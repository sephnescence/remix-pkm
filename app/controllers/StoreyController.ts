import { getUserAuth } from '@/utils/auth'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import {
  getStoreyItemCounts,
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

  return {
    id: storey.id,
    suiteId: storey.suite_id,
    content: storey.content,
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

  const storeyItemCounts = await getStoreyItemCounts({
    storeyId: storey_id,
    userId: user.id,
  })

  const url = new URL(args.request.url)
  const tab = url.searchParams.get('tab')

  return {
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
