import { getUserAuth } from '@/utils/auth'
import { displayContent, displaySuiteContent } from '@/utils/content'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import { getStoreyItemCounts } from '~/repositories/PkmStoreyRepository'
import {
  getSuiteConfig,
  getSuiteDashboard,
  storeSuiteConfig,
  updateSuiteConfig,
} from '~/repositories/PkmSuiteRepository'

export type SuiteUpdateConfigActionResponse = {
  errors: {
    fieldErrors: {
      general?: string
      content?: string
      description?: string
      name?: string
    }
  }
}

export const suiteUpdateConfigAction = async (
  args: ActionFunctionArgs,
): Promise<SuiteUpdateConfigActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suite_id = args.params.suite_id
  if (!suite_id) {
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

  const response = await updateSuiteConfig({
    suiteId: suite_id,
    userId: user.id,
    content: content.toString(),
    description: description.toString(),
    name: name.toString(),
  })

  if (!response.success) {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update Suite. Please try again.',
        },
      },
    }
  }

  if (response.suite) {
    return redirect(`/suite/${response.suite.id}/config`)
  }

  return redirect('/') // Not that it should get here
}

export const suiteConfigLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suite_id = args.params.suite_id
  if (!suite_id) {
    return redirect('/')
  }

  const suite = await getSuiteConfig({
    suiteId: suite_id,
    userId: user.id,
  })

  if (!suite) {
    return redirect('/')
  }

  return {
    id: suite.id,
    content: suite.content,
    resolvedContent: await displayContent(suite.content, user),
    description: suite.description,
    name: suite.name,
  }
}

export const suiteDashboardLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suite_id = args.params.suite_id
  if (!suite_id) {
    return redirect('/')
  }

  const suiteDashboard = await getSuiteDashboard({
    suiteId: suite_id,
    userId: user.id,
  })

  if (!suiteDashboard) {
    return redirect('/')
  }

  const suiteItemCounts = await getStoreyItemCounts({
    suiteId: suite_id,
    userId: user.id,
  })

  const url = new URL(args.request.url)
  const tab = url.searchParams.get('tab')

  const resolvedContent = await displaySuiteContent(
    {
      id: suiteDashboard.id,
      name: suiteDashboard.name,
      description: suiteDashboard.description,
      content: suiteDashboard.content,
      storeys: suiteDashboard.storeys.map((storey) => {
        return {
          id: storey.id,
          name: storey.name,
          description: storey.description,
          content: storey.content,
          suite_id: storey.suite_id,
          spaces: storey.spaces.map((space) => {
            return {
              id: space.id,
              name: space.name,
              description: space.description,
              content: space.content,
              storey_id: storey.id,
            }
          }),
        }
      }),
    },
    user,
  )

  return {
    suiteDashboard,
    resolvedContent,
    suiteItemCounts,
    tab: tab ?? 'content',
  }
}

export const suiteConfigNewAction = async (args: ActionFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
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

  const response = await storeSuiteConfig({
    userId: user.id,
    content: content.toString(),
    description: description.toString(),
    name: name.toString(),
  })

  if (!response.success) {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to store Suite. Please try again.',
        },
      },
    }
  }

  if (response.suite) {
    return redirect(`/suite/${response.suite.id}/config`)
  }

  return redirect('/') // Not that it should get here
}
