import { getUserAuth } from '@/utils/auth'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import {
  getCurrentInboxItemForUser,
  storeInboxItem,
  updateInboxItem,
} from '~/repositories/PkmInboxRepository'

export type InboxActionUpdateResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

export type InboxActionCreateResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

export type InboxLoaderResponse = {
  content: string
  historyId: string
  modelId: string
}

export const inboxActionCreate = async (
  args: ActionFunctionArgs,
): Promise<InboxActionCreateResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const { request } = args

  const formData = await request.formData()
  if (!formData) {
    return redirect('/')
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

  const response = await storeInboxItem({
    userId: user.id,
    content: content.toString(),
  })

  if (response.success === true && response.inboxItem) {
    return redirect(
      `/dashboard/inbox/view/${response.inboxItem.model_id}/${response.inboxItem.history_id}`,
    )
  }

  return {
    errors: {
      fieldErrors: {
        general: 'Failed to create inbox item. Please try again.',
      },
    },
  }
}

export const inboxActionUpdate = async (
  args: ActionFunctionArgs,
): Promise<InboxActionUpdateResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const inboxItem = await getCurrentInboxItemForUser(args, user)

  if (inboxItem === null) {
    return redirect('/')
  }

  const { request } = args

  const formData = await request.formData()
  if (!formData) {
    return redirect('/')
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

  const response = await updateInboxItem({
    userId: user.id,
    content: content.toString(),
    historyId: inboxItem.history_id,
    modelId: inboxItem.model_id,
  })

  if (response.success === true && response.inboxItem) {
    return redirect(
      `/dashboard/inbox/view/${response.inboxItem.model_id}/${response.inboxItem.history_id}`,
    )
  }

  return {
    errors: {
      fieldErrors: {
        general: 'Failed to update inbox item. Please try again.',
      },
    },
  }
}

export const inboxLoader = async (
  args: LoaderFunctionArgs,
): Promise<InboxLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const inboxItem = await getCurrentInboxItemForUser(args, user)
  if (inboxItem === null) {
    return redirect('/')
  }

  return {
    content: inboxItem.content,
    historyId: inboxItem.history_id,
    modelId: inboxItem.model_id,
  }
}
