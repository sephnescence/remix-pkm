import { getUserAuth } from '@/utils/auth'
import { displayContent, displaySpaceContent } from '@/utils/content'
import { db } from '@/utils/db'
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
  storeSpaceConfig,
  updateSpaceConfig,
} from '~/repositories/PkmSpaceRepository'
import { getStoreyForUser } from '~/repositories/PkmStoreyRepository'
import { getSuiteForUser } from '~/repositories/PkmSuiteRepository'

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

  const response = await updateSpaceConfig({
    spaceId,
    userId: user.id,
    content: content.toString(),
    description: description.toString(),
    name: name.toString(),
  })

  if (!response.success) {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update Space. Please try again.',
        },
      },
    }
  }

  if (response.space) {
    return redirect(
      `/suite/${suiteId}/storey/${storeyId}/space/${spaceId}/config`,
    )
  }

  return redirect('/') // Not that it should get here
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
        status: 'existing',
        originalStatus: 'existing',
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

  const storey_id = args.params.storey_id
  if (!storey_id) {
    return redirect('/')
  }

  const space_id = args.params.space_id
  if (!space_id) {
    return redirect('/')
  }

  const spaceDashboard = await getSpaceDashboard({
    storeyId: storey_id,
    spaceId: space_id,
    userId: user.id,
  })

  if (!spaceDashboard) {
    return redirect('/')
  }

  const spaceItemCounts = await getSpaceItemCounts({
    storeyId: storey_id,
    userId: user.id,
  })

  const url = new URL(args.request.url)
  const tab = url.searchParams.get('tab')

  const resolvedContent = await displaySpaceContent(
    {
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
    user,
  )

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

  const response = await storeSpaceConfig({
    userId: user.id,
    storeyId: storeyId.toString(),
    content: content.toString(),
    description: description.toString(),
    name: name.toString(),
  })

  if (!response.success) {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to store Space. Please try again.',
        },
      },
    }
  }

  if (response.space) {
    return redirect(
      `/suite/${suiteId}/storey/${storeyId}/space/${response.space.id}/config`,
    )
  }

  return redirect('/') // Not that it should get here
}
