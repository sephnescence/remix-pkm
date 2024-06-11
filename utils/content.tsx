/*
    For now any referenced contents MUST belong to the logged in user. Public pages will come later

    The "content" field of Suite, Storey, and Space has a domain-specific language that allows for dynamic content generation

    For example `<div [variable-name]></div>`. The following variable names are supported:
      - data-content-loc: Replaced with the content of the Suite, Storey, or Space
        - It is recommended to add `<div data-name></div>` if it's required to be linked to
      - data-name: Replaced with the name of the Suite, Storey, or Space
      - data-name-link: Replaced with the name of the Suite, Storey, or Space, but as a link
      - data-description: Replaced with the description of the Suite, Storey, or Space
      - data-children-list(-names|-descriptions|-contents)(-names|-descriptions|-contents)(-names|-descriptions|-contents)
      - data-children: Replaced with a list of children (Storeys for Suite, Spaces for Storey)
        - It is recommended to add `<div data-name></div>` to the child if it's required to be linked to
      - data-children-w-name-links: Replaced with a list of children (Storeys for Suite, Spaces for Storey). As a convenience,
          it will pop a data-name link that appears on the top right
      - data-storey: Replaced with a link to a child Storey
      - data-space: Replaced with a link to a child Space
      - data-space-inbox-kanban - Storey specific. Will make a column for every child Space that things in its inbox

    Coming soon
    - data-children-list-name-links
      - Can probably get away with doing this in the content of the suite/item
    - data-children-list-content-collapsed
      - Can probably get away with doing this in the content of the suite/item
    - data-suite: Replaced with a link to the Suite
      - Probably want this so that you can configure reception to be a kanban of your Suite's inboxes
    - data-children-collapsed - A way of listing children in a collapsed manner
      - For example, the Crafting Interpreters suite has way too much shit to be useful
    - data-kanban - For a Suite only, list a Storey x Space grid showing the names and summaries of both
      - Take care to have the Storey names stick
    - data-epiphany-list
      - data-suite-epiphany-list="<suiteId>"
      - data-storey-epiphany-list"<storeyId>"
      - data-space-epiphany-list"<spaceId>"
    - data-inbox-list
      - data-suite-inbox-list="<suiteId>"
      - data-storey-inbox-list"<storeyId>"
      - data-space-inbox-list"<spaceId>"
    - data-passing-thoughts
    - data-todo-list
    - data-trash-list
    - data-void-list

    Also coming soon - Shoelace / Web Awesome support
*/
import { z } from 'zod'
import { User } from '@prisma/client'
import expandSuiteStoreyKanbans from './content/Suite/expandSuiteStoreyKanbans'
import expandStoreySpaceKanbans from './content/Storey/expandStoreySpaceKanbans'
import expandSuiteName from './content/Suite/expandSuiteName'
import expandSuiteDescription from './content/Suite/expandSuiteDescription'
import expandSpaceKanbans from './content/Space/expandSpaceKanbans'
import expandStoreyKanbans from './content/Storey/expandStoreyKanbans'
import expandSuiteKanbans from './content/Suite/expandSuiteKanbans'
import {
  getAlwaysLatestHistoryItemForUser,
  getPermalinkedHistoryItemForUser,
} from '~/repositories/PkmHistoryRepository'
import { getSpaceForUser } from '~/repositories/PkmSpaceRepository'
import { getStoreyAndChildrenForUser } from '~/repositories/PkmStoreyRepository'
import { getSuiteAndChildrenForUser } from '~/repositories/PkmSuiteRepository'

export const resolveContentByArrayParams = async ({
  params,
  user,
}: {
  params: string[]
  user: User
}) => {
  const args = looselyCheckArrayParamsAreValid(params)
  if (!args) return invalidOperationResponse('Invalid Parameters')

  const content = await autoResolveContent(args, user)

  if (typeof content === 'string') {
    return <div dangerouslySetInnerHTML={{ __html: content }} />
  }

  return content
}

export const autoResolveContent = async (
  args: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  return (
    (await viewSuiteContent(args, user)) ??
    (await viewStoreyContent(args, user)) ??
    (await viewSpaceContent(args, user)) ??
    (await viewItemFromPermalink(args, user)) ??
    (await viewItemFromAlwaysLatestLink(args, user)) ??
    invalidOperationResponse('Unable to figure out what to do')
  )
}

export const viewSuiteContent = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  try {
    const args = z
      .object({
        suiteId: z.string(),
      })
      .strict()
      .parse(params)

    const suite = await getSuiteAndChildrenForUser({
      suiteId: args.suiteId,
      userId: user.id,
    })
    if (!suite) {
      return invalidOperationResponse('Suite - Suite not found')
    }

    if (!suite.content) {
      return invalidOperationResponse('Suite - Suite has no content')
    }

    return await displaySuiteContent(suite, user)
  } catch {
    return null
  }
}

export const viewStoreyContent = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  try {
    const args = z
      .object({
        suiteId: z.string(),
        storeyId: z.string(),
      })
      .strict()
      .parse(params)

    const storey = await getStoreyAndChildrenForUser({
      suiteId: args.suiteId,
      storeyId: args.storeyId,
      userId: user.id,
    })
    if (!storey) {
      return invalidOperationResponse('Storey - Storey not found')
    }

    if (!storey.content) {
      return invalidOperationResponse('Storey - Storey has no content')
    }

    return await displayStoreyContent(storey, user)
  } catch {
    return null
  }
}

export const viewSpaceContent = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  try {
    const args = z
      .object({
        storeyId: z.string(),
        spaceId: z.string(),
      })
      .strict()
      .parse(params)

    const space = await getSpaceForUser({
      storeyId: args.storeyId,
      spaceId: args.spaceId,
      userId: user.id,
    })
    if (!space) {
      return invalidOperationResponse('Space - Space not found')
    }

    if (!space.content) {
      return invalidOperationResponse('Space - Space has no content')
    }

    return await displaySpaceContent(space, user)
  } catch (e) {
    return null
  }
}

const invalidOperationResponse = (message: string) => {
  return (
    <div>
      <div>{message}</div>
    </div>
  )
}

export const viewItemFromPermalink = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  try {
    const args = z
      .object({
        suiteId: z.string().optional(),
        storeyId: z.string().optional(),
        spaceId: z.string().optional(),
        modelId: z.string(),
        historyId: z.string(),
      })
      .strict()
      .parse(params)

    return (
      (await viewSpaceItemFromPermalink(args, user)) ??
      (await viewStoreyItemFromPermalink(args, user)) ??
      (await viewSuiteItemFromPermalink(args, user)) ??
      invalidOperationResponse(
        'Unable to figure out which Item to show from Permalink',
      )
    )
  } catch {
    return null
  }
}

export const viewSuiteItemFromPermalink = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  if (!params || !params.suiteId || !params.modelId || !params.historyId) {
    return null
  }

  const historyItem = await getPermalinkedHistoryItemForUser({
    userId: user.id,
    suiteId: params.suiteId,
    storeyId: null,
    spaceId: null,
    modelId: params.modelId,
    historyId: params.historyId,
  })

  if (!historyItem) {
    return invalidOperationResponse(
      'Suite History Item Not Found from Permalink',
    )
  }

  const modelItem =
    historyItem.epiphany_item ??
    historyItem.inbox_item ??
    historyItem.passing_thought_item ??
    historyItem.todo_item ??
    historyItem.trash_item ??
    historyItem.void_item

  if (!modelItem) {
    return invalidOperationResponse('Suite Model Item Not Found from Permalink')
  }

  return displayContent(modelItem.content, user)
}

export const viewStoreyItemFromPermalink = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  if (
    !params ||
    !params.suiteId ||
    !params.storeyId ||
    !params.modelId ||
    !params.historyId
  ) {
    return null
  }

  const historyItem = await getPermalinkedHistoryItemForUser({
    userId: user.id,
    suiteId: params.suiteId,
    storeyId: params.storeyId,
    spaceId: null,
    modelId: params.modelId,
    historyId: params.historyId,
  })

  if (!historyItem) {
    return invalidOperationResponse(
      'Storey History Item Not Found from Permalink',
    )
  }

  const modelItem =
    historyItem.epiphany_item ??
    historyItem.inbox_item ??
    historyItem.passing_thought_item ??
    historyItem.todo_item ??
    historyItem.trash_item ??
    historyItem.void_item

  if (!modelItem) {
    return invalidOperationResponse(
      'Storey Model Item Not Found from Permalink',
    )
  }

  return displayContent(modelItem.content, user)
}

export const viewSpaceItemFromPermalink = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  if (
    !params ||
    !params.storeyId ||
    !params.spaceId ||
    !params.modelId ||
    !params.historyId
  ) {
    return null
  }

  const historyItem = await getPermalinkedHistoryItemForUser({
    userId: user.id,
    suiteId: null,
    storeyId: params.storeyId,
    spaceId: params.spaceId,
    modelId: params.modelId,
    historyId: params.historyId,
  })

  if (!historyItem) {
    return invalidOperationResponse(
      'Space History Item Not Found from Permalink',
    )
  }

  const modelItem =
    historyItem.epiphany_item ??
    historyItem.inbox_item ??
    historyItem.passing_thought_item ??
    historyItem.todo_item ??
    historyItem.trash_item ??
    historyItem.void_item

  if (!modelItem) {
    return invalidOperationResponse('Space Model Item Not Found from Permalink')
  }

  return displayContent(modelItem.content, user)
}

export const viewItemFromAlwaysLatestLink = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  try {
    const args = z
      .object({
        suiteId: z.string().optional(),
        storeyId: z.string().optional(),
        spaceId: z.string().optional(),
        modelId: z.string(),
      })
      .strict()
      .parse(params)

    return (
      (await viewSpaceItemFromAlwaysLatestLink(args, user)) ??
      (await viewStoreyItemFromAlwaysLatestLink(args, user)) ??
      (await viewSuiteItemFromAlwaysLatestLink(args, user)) ??
      invalidOperationResponse(
        'Unable to figure out which Item to show from Always-Latest link',
      )
    )
  } catch {
    return null
  }
}

export const viewSpaceItemFromAlwaysLatestLink = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  if (!params || !params.storeyId || !params.spaceId || !params.modelId) {
    return null
  }

  const historyItem = await getAlwaysLatestHistoryItemForUser({
    userId: user.id,
    suiteId: null,
    storeyId: params.storeyId,
    spaceId: params.spaceId,
    modelId: params.modelId,
  })

  if (!historyItem) {
    return invalidOperationResponse(
      'Space History Item Not Found from Always-Latest link',
    )
  }

  const modelItem =
    historyItem.epiphany_item ??
    historyItem.inbox_item ??
    historyItem.passing_thought_item ??
    historyItem.todo_item ??
    historyItem.trash_item ??
    historyItem.void_item

  if (!modelItem) {
    return invalidOperationResponse(
      'Space Model Item Not Found from Always-Latest link',
    )
  }

  return displayContent(modelItem.content, user)
}

export const viewStoreyItemFromAlwaysLatestLink = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  if (!params || !params.suiteId || !params.storeyId || !params.modelId) {
    return null
  }

  const historyItem = await getAlwaysLatestHistoryItemForUser({
    userId: user.id,
    suiteId: params.suiteId,
    storeyId: params.storeyId,
    spaceId: null,
    modelId: params.modelId,
  })

  if (!historyItem) {
    return invalidOperationResponse(
      'Storey History Item Not Found from Always-Latest link',
    )
  }

  const modelItem =
    historyItem.epiphany_item ??
    historyItem.inbox_item ??
    historyItem.passing_thought_item ??
    historyItem.todo_item ??
    historyItem.trash_item ??
    historyItem.void_item

  if (!modelItem) {
    return invalidOperationResponse(
      'Storey Model Item Not Found from Always-Latest link',
    )
  }

  return displayContent(modelItem.content, user)
}

export const viewSuiteItemFromAlwaysLatestLink = async (
  params: Awaited<ReturnType<typeof looselyCheckArrayParamsAreValid>>,
  user: User,
) => {
  if (!params || !params.suiteId || !params.modelId) {
    return null
  }

  const historyItem = await getAlwaysLatestHistoryItemForUser({
    userId: user.id,
    suiteId: params.suiteId,
    storeyId: null,
    spaceId: null,
    modelId: params.modelId,
  })

  if (!historyItem) {
    return invalidOperationResponse(
      'Suite History Item Not Found from Always-Latest link',
    )
  }

  const modelItem =
    historyItem.epiphany_item ??
    historyItem.inbox_item ??
    historyItem.passing_thought_item ??
    historyItem.todo_item ??
    historyItem.trash_item ??
    historyItem.void_item

  if (!modelItem) {
    return invalidOperationResponse(
      'Suite Model Item Not Found from Always-Latest link',
    )
  }

  return displayContent(modelItem.content, user)
}

const parseParams = (params: string[] | string) => {
  const _params = typeof params === 'string' ? params.split('/') : params

  const parsedParams: {
    [key: string]: string
  } = {}

  for (let i = 0; i < _params.length; i += 2) {
    parsedParams[decodeURI(_params[i])] = decodeURI(_params[i + 1])
  }

  return parsedParams
}

export const looselyCheckArrayParamsAreValid = (params: string[]) => {
  try {
    const parsedParams = parseParams(params)

    return z
      .object({
        suiteId: z.string().optional(),
        storeyId: z.string().optional(),
        spaceId: z.string().optional(),
        modelId: z.string().optional(),
        historyId: z.string().optional(),
      })
      .strict()
      .parse(parsedParams)
  } catch {
    return null
  }
}

export const displaySuiteContent = async (
  suite: {
    id: string
    name: string
    description: string
    content: string
    storeys: {
      id: string
      name: string
      description: string
      content: string
      suite_id: string
      spaces: {
        id: string
        name: string
        description: string
        content: string
        storey_id: string
      }[]
    }[]
  },
  user: User,
) => {
  if (!suite.content) {
    return ''
  }

  let returnContent = suite.content

  // == Suite Specific ==

  returnContent = await expandSuiteStoreyKanbans(returnContent, suite, user)
  returnContent = await expandSuiteKanbans(returnContent, suite, user)

  returnContent = expandSuiteName(returnContent, suite)
  returnContent = expandSuiteDescription(returnContent, suite)

  // == Suite Children ==

  if (!suite.storeys) {
    return displayContent(returnContent, user)
  }

  const children = [...returnContent.matchAll(/<div data-children><\/div>/gi)]

  if (children.length) {
    let childrenContent = ''
    for (const storey of suite.storeys.sort((storeyA, storeyB) =>
      storeyA.name.localeCompare(storeyB.name),
    )) {
      const suiteContent = await displayStoreyContent(storey, user)
      childrenContent += `<div class="mb-2">${suiteContent}</div>`
    }

    for (const { 0: match, index } of children.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        childrenContent +
        returnContent.slice(index! + match.length)
    }
  }

  const childrenComplex = [
    ...returnContent.matchAll(
      /<div data-children-list(-names|-descriptions|-contents)?(-names|-descriptions|-contents)?(-names|-descriptions|-contents)><\/div>/gi,
    ),
  ]

  // The typing on matchAll is horrendous, so we have to do this foreach instead of referencing the first result
  for (const {
    0: match,
    1: flagOne,
    2: flagTwo,
    3: flagThree,
    index,
  } of childrenComplex.reverse()) {
    let childrenComplexContent = ''
    for (const storey of suite.storeys.sort((storeyA, storeyB) =>
      storeyA.name.localeCompare(storeyB.name),
    )) {
      childrenComplexContent += '<div class="mb-2">'

      let storeyContent = ''

      if (flagOne === '-names') {
        storeyContent += `<div>${storey.name}</div>`
      }

      if (flagOne === '-descriptions') {
        storeyContent += `<div>${storey.description}</div>`
      }

      if (flagOne === '-contents') {
        storeyContent += `<div>${storey.content}</div>`
      }

      if (flagTwo === '-names') {
        storeyContent += `<div>${storey.name}</div>`
      }

      if (flagTwo === '-descriptions') {
        storeyContent += `<div>${storey.description}</div>`
      }

      if (flagTwo === '-contents') {
        storeyContent += `<div>${storey.content}</div>`
      }

      if (flagThree === '-names') {
        storeyContent += `<div>${storey.name}</div>`
      }

      if (flagThree === '-descriptions') {
        storeyContent += `<div>${storey.description}</div>`
      }

      if (flagThree === '-contents') {
        storeyContent += `<div>${storey.content}</div>`
      }

      const fakeStorey = {
        id: storey.id,
        name: storey.name,
        description: storey.description,
        content: storeyContent,
        suite_id: storey.suite_id,
        spaces: storey.spaces?.map((space) => {
          return {
            id: space.id,
            name: space.name,
            description: space.description,
            content: space.content,
            storey_id: space.storey_id,
          }
        }),
      }

      childrenComplexContent += await displayStoreyContent(fakeStorey, user)

      childrenComplexContent += '</div>'
    }

    returnContent =
      returnContent.slice(0, index!) +
      childrenComplexContent +
      returnContent.slice(index! + match.length)
  }

  const childrenWithNameLinks = [
    ...returnContent.matchAll(/<div data-children-w-name-links><\/div>/gi),
  ]

  if (childrenWithNameLinks.length) {
    let childrenContent = ''
    for (const storey of suite.storeys.sort((storeyA, storeyB) =>
      storeyA.name.localeCompare(storeyB.name),
    )) {
      const suiteContent = await displayStoreyContent(storey, user)
      childrenContent += `
        <div class="mb-2">
          <div class="w-full text-xs text-right">
            <a href="/suite/${suite.id}/storey/${storey.id}/dashboard">${storey.name}</a>
          </div>
          ${suiteContent}
        </div>`
    }

    for (const { 0: match, index } of childrenWithNameLinks.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        childrenContent +
        returnContent.slice(index! + match.length)
    }
  }

  const storeys = [
    ...returnContent.matchAll(/<div data-storey="([a-zA-Z0-9/-]*)"><\/div>/gi),
  ]

  for (const { 0: match, 1: storeyId, index } of storeys.reverse()) {
    returnContent =
      returnContent.slice(0, index) +
      `<a href="/suite/${suite.id}/storey/${storeyId}/dashboard">
        <div data-content-loc="/content/suiteId/${suite.id}/storeyId/${storeyId}"></div>
      </a>` +
      returnContent.slice(index! + match.length)
  }

  return displayContent(returnContent, user)
}

/*
  Expand Storey-only supported variables
*/
export const displayStoreyContent = async (
  storey: {
    id: string
    name: string
    description: string
    content: string
    suite_id: string
    spaces: {
      id: string
      name: string
      description: string
      content: string
      storey_id: string
    }[]
  },
  user: User,
) => {
  if (!storey.content) {
    return ''
  }

  let returnContent = storey.content

  // == Storey Specific ==

  returnContent = await expandStoreySpaceKanbans(returnContent, storey, user)
  returnContent = await expandStoreyKanbans(returnContent, storey, user)

  const nameLinks = [...returnContent.matchAll(/<div data-name-link><\/div>/gi)]

  if (nameLinks.length) {
    for (const { 0: match, index } of nameLinks.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        `<a href="/suite/${storey.suite_id}/storey/${storey.id}/dashboard"><div>${storey.name}</div></a>` +
        returnContent.slice(index! + match.length)
    }
  }

  const names = [...returnContent.matchAll(/<div data-name><\/div>/gi)]

  if (names.length) {
    for (const { 0: match, index } of names.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        `<div>${storey.name}</div>` +
        returnContent.slice(index! + match.length)
    }
  }

  const descriptions = [
    ...returnContent.matchAll(/<div data-description><\/div>/gi),
  ]

  if (descriptions.length) {
    for (const { 0: match, index } of descriptions.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        `<div>${storey.description}</div>` +
        returnContent.slice(index! + match.length)
    }
  }

  // == Storey Children ==

  if (!storey.spaces) {
    return displayContent(returnContent, user)
  }

  const children = [...returnContent.matchAll(/<div data-children><\/div>/gi)]

  if (children.length) {
    let childrenContent = ''
    for (const space of storey.spaces.sort((spaceA, spaceB) =>
      spaceA.name.localeCompare(spaceB.name),
    )) {
      const spaceContent = await displaySpaceContent(
        {
          id: space.id,
          name: space.name,
          description: space.description,
          content: space.content,
          storey: {
            id: storey.id,
            name: storey.name,
            description: storey.description,
            suite: {
              id: storey.suite_id,
              name: 'NOT YET IMPLEMENTED',
              description: 'NOT YET IMPLEMENTED',
            },
          },
        },
        user,
      )
      childrenContent += `<div class="mb-2">${spaceContent}</div>`
    }

    for (const { 0: match, index } of children.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        childrenContent +
        returnContent.slice(index! + match.length)
    }
  }

  const childrenWithNameLinks = [
    ...returnContent.matchAll(/<div data-children-w-name-links><\/div>/gi),
  ]

  if (childrenWithNameLinks.length) {
    let childrenContent = ''
    for (const space of storey.spaces.sort((spaceA, spaceB) =>
      spaceA.name.localeCompare(spaceB.name),
    )) {
      const spaceContent = await displaySpaceContent(
        {
          id: space.id,
          name: space.name,
          description: space.description,
          content: space.content,
          storey: {
            id: storey.id,
            name: storey.name,
            description: storey.description,
            suite: {
              id: storey.suite_id,
              name: 'NOT YET IMPLEMENTED',
              description: 'NOT YET IMPLEMENTED',
            },
          },
        },
        user,
      )
      childrenContent += `
        <div class="mb-2">
          <div class="w-full text-xs text-right">
            <a href="/suite/${storey.suite_id}/storey/${storey.id}/space/${space.id}/dashboard">${space.name}</a>
          </div>
          ${spaceContent}
        </div>`
    }

    for (const { 0: match, index } of childrenWithNameLinks.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        childrenContent +
        returnContent.slice(index! + match.length)
    }
  }

  const spaces = [
    ...returnContent.matchAll(/<div data-space="([a-zA-Z0-9/-]*)"><\/div>/gi),
  ]

  for (const { 0: match, 1: spaceId, index } of spaces.reverse()) {
    const space = storey.spaces.find((space) => space.id === spaceId)
    const spaceContent = space
      ? await displaySpaceContent(
          {
            id: space.id,
            name: space.name,
            description: space.description,
            content: space.content,
            storey: {
              id: storey.id,
              name: storey.name,
              description: storey.description,
              suite: {
                id: storey.suite_id,
                name: 'NOT YET IMPLEMENTED',
                description: 'NOT YET IMPLEMENTED',
              },
            },
          },
          user,
        )
      : 'SPACE NOT FOUND'

    returnContent =
      returnContent.slice(0, index) +
      spaceContent +
      returnContent.slice(index! + match.length)
  }

  return displayContent(returnContent, user)
}

export const displaySpaceContent = async (
  space: {
    id: string
    name: string
    description: string
    content: string
    storey: {
      id: string
      name: string
      description: string
      suite: {
        id: string
        name: string
        description: string
      }
    }
  },
  user: User,
) => {
  if (!space.content) {
    return ''
  }

  let returnContent = space.content

  // == Space Specific ==

  returnContent = await expandSpaceKanbans(returnContent, space, user)

  const nameLinks = [...returnContent.matchAll(/<div data-name-link><\/div>/gi)]

  if (nameLinks.length) {
    for (const { 0: match, index } of nameLinks.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        `<a href="/suite/${space.storey.suite.id}/storey/${space.storey.id}/space/${space.id}/dashboard"><div>${space.name}</div></a>` +
        returnContent.slice(index! + match.length)
    }
  }

  const names = [...returnContent.matchAll(/<div data-name><\/div>/gi)]

  if (names.length) {
    for (const { 0: match, index } of names.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        `<div>${space.name}</div>` +
        returnContent.slice(index! + match.length)
    }
  }

  const descriptions = [
    ...returnContent.matchAll(/<div data-description><\/div>/gi),
  ]

  if (descriptions.length) {
    for (const { 0: match, index } of descriptions.reverse()) {
      returnContent =
        returnContent.slice(0, index) +
        `<div>${space.description}</div>` +
        returnContent.slice(index! + match.length)
    }
  }

  return displayContent(returnContent, user)
}

export const displayContent = async (content: string, user: User) => {
  const contentLocations = [
    ...content.matchAll(
      /<div data-content-loc="\/content\/([a-zA-Z0-9/-]*)"><\/div>/gi,
    ),
  ]

  for (const { 0: match, 1: url, index } of contentLocations.reverse()) {
    const parsedParams = parseParams(url)
    const resolved = await autoResolveContent(parsedParams, user)

    content =
      content.slice(0, index) + resolved + content.slice(index! + match.length)
  }

  return content
}
