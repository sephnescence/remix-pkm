import { getUserAuth } from '@/utils/auth'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import {
  getCurrentPassingThoughtItemForUser,
  storePassingThoughtItem,
  updatePassingThoughtItem,
} from '~/repositories/PkmPassingThoughtRepository'

export type PassingThoughtActionUpdateResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

export type PassingThoughtActionCreateResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

export type PassingThoughtLoaderResponse = {
  content: string
  historyId: string
  modelId: string
}

export const passingThoughtActionCreate = async (
  args: ActionFunctionArgs,
): Promise<PassingThoughtActionCreateResponse | TypedResponse<never>> => {
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

  const response = await storePassingThoughtItem({
    userId: user.id,
    content: content.toString(),
  })

  if (response.success === true && response.passingThoughtItem) {
    return redirect(
      `/dashboard/passing-thought/view/${response.passingThoughtItem.model_id}/${response.passingThoughtItem.history_id}`,
    )
  }

  return {
    errors: {
      fieldErrors: {
        general: 'Failed to create passingThought item. Please try again.',
      },
    },
  }
}

export const passingThoughtActionUpdate = async (
  args: ActionFunctionArgs,
): Promise<PassingThoughtActionUpdateResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const passingThoughtItem = await getCurrentPassingThoughtItemForUser(
    args,
    user,
  )

  if (passingThoughtItem === null) {
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

  const response = await updatePassingThoughtItem({
    userId: user.id,
    content: content.toString(),
    historyId: passingThoughtItem.history_id,
    modelId: passingThoughtItem.model_id,
  })

  if (response.success === true && response.passingThoughtItem) {
    return redirect(
      `/dashboard/passing-thought/view/${response.passingThoughtItem.model_id}/${response.passingThoughtItem.history_id}`,
    )
  }

  return {
    errors: {
      fieldErrors: {
        general: 'Failed to update passingThought item. Please try again.',
      },
    },
  }
}

export const passingThoughtLoader = async (
  args: LoaderFunctionArgs,
): Promise<PassingThoughtLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const passingThoughtItem = await getCurrentPassingThoughtItemForUser(
    args,
    user,
  )
  if (passingThoughtItem === null) {
    return redirect('/')
  }

  return {
    content: passingThoughtItem.content,
    historyId: passingThoughtItem.history_id,
    modelId: passingThoughtItem.model_id,
  }
}
