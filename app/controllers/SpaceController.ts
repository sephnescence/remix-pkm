import { getUserAuth } from '@/utils/auth'
import { displayContent, displaySpaceContent } from '@/utils/content'
import { db } from '@/utils/db'
import { Prisma } from '@prisma/client'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import { MultiContentItem } from '~/components/Suites/forms/SuiteForm'
import {
  getSpaceItemCounts,
  getSpaceConfig,
  getSpaceDashboard,
} from '~/repositories/PkmSpaceRepository'
import { getStoreyForUser } from '~/repositories/PkmStoreyRepository'
import { getSuiteForUser } from '~/repositories/PkmSuiteRepository'
import { determineSyncContentsTransactionsByFormData } from '~/services/PkmContentService'

export type SpaceUpdateConfigActionResponse = {
  errors: {
    fieldErrors: {
      general?: string
      content?: string
      description?: string
      name?: string
    }
  }
}

export const spaceUpdateConfigAction = async (
  args: ActionFunctionArgs,
): Promise<SpaceUpdateConfigActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suiteId = args.params.suite_id
  if (!suiteId) {
    return redirect('/')
  }

  const storeyId = args.params.storey_id
  if (!storeyId) {
    return redirect('/')
  }

  const spaceId = args.params.space_id
  if (!spaceId) {
    return redirect('/')
  }

  const space = await getSpaceConfig({
    spaceId,
    userId: user.id,
  })

  if (!space) {
    return redirect('/')
  }

  const existingHistoryIdForMultiContent =
    space.pkm_history[0]?.history_id ?? null

  // When loading a Space now, it should auto heal if it doesn't have an existing history
  if (!existingHistoryIdForMultiContent) {
    return redirect('/')
  }

  const { request } = args

  const formData = await request.formData()
  if (!formData) {
    return redirect('/')
  }

  const name: FormDataEntryValue | null = formData.get('name')

  if (!name || name === '') {
    return {
      errors: {
        fieldErrors: {
          name: 'Name cannot be empty',
        },
      },
    }
  }

  const description: FormDataEntryValue | null = formData.get('description')

  if (!description || description === '') {
    return {
      errors: {
        fieldErrors: {
          description: 'Description cannot be empty',
        },
      },
    }
  }

  const content: FormDataEntryValue | null = formData.get('content')

  if (!content || content === '') {
    return {
      errors: {
        fieldErrors: {
          content: 'Content cannot be empty',
        },
      },
    }
  }

  const newHistoryId = crypto.randomUUID()

  const transactions: Prisma.PrismaPromise<unknown>[] = [
    db.space.update({
      where: {
        user_id: user.id,
        id: space.id,
      },
      data: {
        name: name.toString(),
        description: description.toString(),
        content: content.toString(),
      },
    }),
    db.pkmHistory.update({
      where: {
        history_id: existingHistoryIdForMultiContent,
        is_current: true,
      },
      data: {
        is_current: false,
      },
    }),
    db.pkmHistory.create({
      data: {
        history_id: newHistoryId,
        model_id: space.id,
        model_type: 'SpaceContents',
        is_current: true,
        user_id: user.id,
        suite_id: null,
        storey_id: null,
        space_id: space.id,
      },
    }),
  ]

  try {
    const incomingContents = determineSyncContentsTransactionsByFormData({
      formData,
      modeId: spaceId,
      historyId: newHistoryId,
      modelType: 'SpaceContents',
    })

    incomingContents.forEach((incomingContent) => {
      transactions.push(incomingContent)
    })
  } catch {
    return {
      errors: {
        fieldErrors: {
          general: `Failed to update Space. Please try again. [1]`,
        },
      },
    }
  }

  try {
    await db.$transaction(transactions)

    return redirect(
      `/suite/${suiteId}/storey/${storeyId}/space/${spaceId}/config`,
    )
  } catch {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update Space. Please try again. [2]',
        },
      },
    }
  }
}

export const spaceConfigLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const space_id = args.params.space_id
  if (!space_id) {
    return redirect('/')
  }

  const space = await getSpaceConfig({
    spaceId: space_id,
    userId: user.id,
  })

  if (!space) {
    return redirect('/')
  }

  // A space can have multiple pkm_history, but for the sake of getting its Multi Contents
  //    we need the History Item that's current and belongs specifically to the Suite
  const historyIdForMultiContent = space.pkm_history[0]?.history_id ?? null

  const suiteMultiContents: MultiContentItem[] = []
  const resolvedMultiContents: string[] = []

  if (historyIdForMultiContent) {
    const multiContents = await db.pkmContents.findMany({
      where: {
        history_id: historyIdForMultiContent,
        model_id: space.id,
      },
    })

    for (const multiContent of multiContents) {
      suiteMultiContents.push({
        id: multiContent.content_id,
        sortOrder: multiContent.sort_order,
        content: multiContent.content,
        status: 'active',
        originalStatus: 'active',
      })

      resolvedMultiContents.push(
        await displayContent(multiContent.content, user),
      )
    }
  }

  return {
    id: space.id,
    content: space.content,
    resolvedContent:
      '<div class="*:mb-2"><div>' +
      resolvedMultiContents.join('</div><div>') +
      '</div></div>',
    multiContents: suiteMultiContents,
    description: space.description,
    name: space.name,
    suiteId: space.storey.suite.id,
    suiteName: space.storey.suite.name,
    storeyId: space.storey.id,
    storeyName: space.storey.name,
  }
}

export const spaceDashboardLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const storeyId = args.params.storey_id
  if (!storeyId) {
    return redirect('/')
  }

  const spaceId = args.params.space_id
  if (!spaceId) {
    return redirect('/')
  }

  const spaceConfig = await getSpaceConfig({
    spaceId,
    userId: user.id,
  })

  if (!spaceConfig) {
    return redirect('/')
  }

  const historyIdForMultiContent = spaceConfig.pkm_history[0]?.history_id

  if (!historyIdForMultiContent) {
    return redirect('/')
  }

  const spaceDashboard = await getSpaceDashboard({
    storeyId,
    spaceId,
    userId: user.id,
  })

  if (!spaceDashboard) {
    return redirect('/')
  }

  const spaceItemCounts = await getSpaceItemCounts({
    storeyId,
    userId: user.id,
  })

  const url = new URL(args.request.url)
  const tab = url.searchParams.get('tab')

  const resolvedContent = await displaySpaceContent({
    space: {
      id: spaceDashboard.id,
      name: spaceDashboard.name,
      description: spaceDashboard.description,
      content: spaceDashboard.content,
      storey: {
        id: spaceDashboard.storey_id,
        name: spaceDashboard.storey.name,
        description: spaceDashboard.storey.description,
        suite: {
          id: spaceDashboard.storey.suite.id,
          name: spaceDashboard.storey.suite.id,
          description: spaceDashboard.storey.suite.description,
        },
      },
    },
    historyIdForMultiContent,
    user,
  })

  return {
    resolvedContent,
    spaceDashboard,
    spaceItemCounts,
    tab: tab ?? 'content',
  }
}

export const spaceConfigNewLoader = async (args: ActionFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suiteId = args.params.suite_id
  if (!suiteId) {
    return redirect('/')
  }

  const suite = await getSuiteForUser({
    suiteId,
    userId: user.id,
  })

  if (!suite) {
    return redirect('/')
  }

  const storeyId = args.params.storey_id
  if (!storeyId) {
    return redirect('/')
  }

  const storey = await getStoreyForUser({
    suiteId,
    storeyId,
    userId: user.id,
  })

  if (!storey) {
    return redirect('/')
  }

  return {
    suiteId: suite.id,
    suiteName: suite.name,
    storeyId: storey.id,
    storeyName: storey.name,
  }
}

export const spaceConfigNewAction = async (args: ActionFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const { request } = args

  const formData = await request.formData()
  if (!formData) {
    return redirect('/')
  }

  const suiteId = args.params.suite_id
  if (!suiteId) {
    return redirect('/')
  }

  const storeyId = args.params.storey_id
  if (!storeyId) {
    return redirect('/')
  }

  const name: FormDataEntryValue | null = formData.get('name')

  if (!name || name === '') {
    return {
      errors: {
        fieldErrors: {
          name: 'Name cannot be empty',
        },
      },
    }
  }

  const description: FormDataEntryValue | null = formData.get('description')

  if (!description || description === '') {
    return {
      errors: {
        fieldErrors: {
          description: 'Description cannot be empty',
        },
      },
    }
  }

  const content: FormDataEntryValue | null = formData.get('content')

  if (!content || content === '') {
    return {
      errors: {
        fieldErrors: {
          content: 'Content cannot be empty',
        },
      },
    }
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const newSpaceId = crypto.randomUUID()

  transactions.push(
    db.space.create({
      data: {
        id: newSpaceId,
        storey_id: storeyId,
        content: content.toString(), // Content input will be removed soon
        description: description.toString(),
        name: name.toString(),
        user_id: user.id,
      },
    }),
  )

  const newHistoryId = crypto.randomUUID()

  transactions.push(
    db.pkmHistory.create({
      data: {
        history_id: newHistoryId,
        model_id: newSpaceId,
        model_type: 'SpaceContents',
        is_current: true,
        user_id: user.id,
        suite_id: null,
        storey_id: null,
        space_id: newSpaceId,
      },
    }),
  )

  try {
    const incomingContents = determineSyncContentsTransactionsByFormData({
      formData,
      modeId: newSpaceId,
      historyId: newHistoryId,
      modelType: 'SpaceContents',
    })

    incomingContents.forEach((incomingContent) => {
      transactions.push(incomingContent)
    })
  } catch {
    return {
      errors: {
        fieldErrors: {
          general: `Failed to store Space. Please try again. [1]`,
        },
      },
    }
  }

  try {
    await db.$transaction(transactions)

    return redirect(
      `/suite/${suiteId}/storey/${storeyId}/space/${newSpaceId}/config`,
    )
  } catch {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to store Space. Please try again. [2]',
        },
      },
    }
  }
}
