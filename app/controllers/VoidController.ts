import { getUserAuth } from '@/utils/auth'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import {
  getCurrentVoidItemForUser,
  storeVoidItem,
  updateVoidItem,
} from '~/repositories/PkmVoidRepository'

export type VoidActionUpdateResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

export type VoidActionCreateResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

export type VoidLoaderResponse = {
  content: string
  historyId: string
  modelId: string
}

export const voidActionCreate = async (
  args: ActionFunctionArgs,
): Promise<VoidActionCreateResponse | TypedResponse<never>> => {
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

  const response = await storeVoidItem({
    userId: user.id,
    content: content.toString(),
  })

  if (response.success === true && response.voidItem) {
    return redirect(
      `/dashboard/void/view/${response.voidItem.model_id}/${response.voidItem.history_id}`,
    )
  }

  return {
    errors: {
      fieldErrors: {
        general: 'Failed to create void item. Please try again.',
      },
    },
  }
}

export const voidActionUpdate = async (
  args: ActionFunctionArgs,
): Promise<VoidActionUpdateResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const voidItem = await getCurrentVoidItemForUser(args, user)

  if (voidItem === null) {
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

  const response = await updateVoidItem({
    userId: user.id,
    content: content.toString(),
    historyId: voidItem.history_id,
    modelId: voidItem.model_id,
  })

  if (response.success === true && response.voidItem) {
    return redirect(
      `/dashboard/void/view/${response.voidItem.model_id}/${response.voidItem.history_id}`,
    )
  }

  return {
    errors: {
      fieldErrors: {
        general: 'Failed to update void item. Please try again.',
      },
    },
  }
}

export const voidLoader = async (
  args: LoaderFunctionArgs,
): Promise<VoidLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const voidItem = await getCurrentVoidItemForUser(args, user)
  if (voidItem === null) {
    return redirect('/')
  }

  return {
    content: voidItem.content,
    historyId: voidItem.history_id,
    modelId: voidItem.model_id,
  }
}
