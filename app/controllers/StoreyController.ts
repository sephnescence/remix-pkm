import { getUserAuth } from '@/utils/auth'
import { displayContent, displayStoreyContent } from '@/utils/content'
import { db } from '@/utils/db'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import { MultiContentItem } from '~/components/Suites/forms/SuiteForm'
import { getSpaceItemCounts } from '~/repositories/PkmSpaceRepository'
import {
  getStoreyConfig,
  getStoreyDashboard,
  storeStoreyConfig,
  updateStoreyConfig,
} from '~/repositories/PkmStoreyRepository'
import { getSuiteForUser } from '~/repositories/PkmSuiteRepository'

export type StoreyUpdateConfigActionResponse = {
  errors: {
    fieldErrors: {
      general?: string
      content?: string
      description?: string
      name?: string
    }
  }
}

export const storeyUpdateConfigAction = async (
  args: ActionFunctionArgs,
): Promise<StoreyUpdateConfigActionResponse | TypedResponse<never>> => {
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

  const response = await updateStoreyConfig({
    storeyId,
    userId: user.id,
    content: content.toString(),
    description: description.toString(),
    name: name.toString(),
  })

  if (!response.success) {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update Storey. Please try again.',
        },
      },
    }
  }

  if (response.storey) {
    return redirect(`/suite/${suiteId}/storey/${response.storey.id}/config`)
  }

  return redirect('/') // Not that it should get here
}

export const storeyConfigLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const storey_id = args.params.storey_id
  if (!storey_id) {
    return redirect('/')
  }

  const storey = await getStoreyConfig({
    storeyId: storey_id,
    userId: user.id,
  })

  if (!storey) {
    return redirect('/')
  }

  // A storey can have multiple pkm_history, but for the sake of getting its Multi Contents
  //    we need the History Item that's current and belongs specifically to the Suite
  const historyIdForMultiContent = storey.pkm_history[0]?.history_id ?? null

  const storeyMultiContents: MultiContentItem[] = []
  const resolvedMultiContents: string[] = []

  if (historyIdForMultiContent) {
    const multiContents = await db.pkmContents.findMany({
      where: {
        history_id: historyIdForMultiContent,
        model_id: storey.id,
      },
    })

    for (const multiContent of multiContents) {
      storeyMultiContents.push({
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
    id: storey.id,
    suiteId: storey.suite_id,
    suiteName: storey.suite.name,
    content: storey.content,
    resolvedContent:
      '<div class="*:mb-2"><div>' +
      resolvedMultiContents.join('</div><div>') +
      '</div></div>',
    multiContents: storeyMultiContents,
    description: storey.description,
    name: storey.name,
  }
}

export const storeyDashboardLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suite_id = args.params.suite_id
  if (!suite_id) {
    return redirect('/')
  }

  const storey_id = args.params.storey_id
  if (!storey_id) {
    return redirect('/')
  }

  const storeyDashboard = await getStoreyDashboard({
    suiteId: suite_id,
    storeyId: storey_id,
    userId: user.id,
  })

  if (!storeyDashboard) {
    return redirect('/')
  }

  const storeyItemCounts = await getSpaceItemCounts({
    storeyId: storey_id,
    userId: user.id,
  })

  const url = new URL(args.request.url)
  const tab = url.searchParams.get('tab')

  const resolvedContent = await displayStoreyContent(
    {
      id: storeyDashboard.id,
      name: storeyDashboard.name,
      description: storeyDashboard.description,
      content: storeyDashboard.content,
      suite_id: storeyDashboard.suite_id,
      spaces: storeyDashboard.spaces.map((space) => {
        return {
          id: space.id,
          name: space.name,
          description: space.description,
          content: space.content,
          storey_id: storeyDashboard.id,
        }
      }),
    },
    user,
  )

  return {
    resolvedContent,
    storeyDashboard,
    storeyItemCounts,
    tab: tab ?? 'content',
  }
}

export const storeyConfigNewLoader = async (args: ActionFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suiteId = args.params.suite_id
  if (!suiteId) {
    return redirect('/')
  }

  const suite = await getSuiteForUser({
    userId: user.id,
    suiteId,
  })

  if (!suite) {
    return redirect('/')
  }

  return {
    suiteId: suite.id,
    suiteName: suite.name,
  }
}

export const storeyConfigNewAction = async (args: ActionFunctionArgs) => {
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

  const response = await storeStoreyConfig({
    userId: user.id,
    suiteId: suiteId.toString(),
    content: content.toString(),
    description: description.toString(),
    name: name.toString(),
  })

  if (!response.success) {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to store Storey. Please try again.',
        },
      },
    }
  }

  if (response.storey) {
    return redirect(`/suite/${suiteId}/storey/${response.storey.id}/config`)
  }

  return redirect('/') // Not that it should get here
}
