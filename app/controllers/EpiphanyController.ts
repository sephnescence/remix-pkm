import { getUserAuth } from '@/utils/auth'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import {
  getCurrentEpiphanyItemForUser,
  storeEpiphanyItem,
  updateEpiphanyItem,
} from '~/repositories/PkmEpiphanyRepository'

export type EpiphanyActionUpdateResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

export type EpiphanyActionCreateResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

export type EpiphanyLoaderResponse = {
  content: string
  historyId: string
  modelId: string
}

export const epiphanyActionCreate = async (
  args: ActionFunctionArgs,
): Promise<EpiphanyActionCreateResponse | TypedResponse<never>> => {
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

  const response = await storeEpiphanyItem({
    userId: user.id,
    content: content.toString(),
  })

  if (response.success === true && response.epiphanyItem) {
    return redirect(
      `/dashboard/epiphanies/view/${response.epiphanyItem.model_id}/${response.epiphanyItem.history_id}`,
    )
  }

  return {
    errors: {
      fieldErrors: {
        general: 'Failed to create epiphany item. Please try again.',
      },
    },
  }
}

export const epiphanyActionUpdate = async (
  args: ActionFunctionArgs,
): Promise<EpiphanyActionUpdateResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const epiphanyItem = await getCurrentEpiphanyItemForUser(args, user)

  if (epiphanyItem === null) {
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

  const response = await updateEpiphanyItem({
    userId: user.id,
    content: content.toString(),
    historyId: epiphanyItem.history_id,
    modelId: epiphanyItem.model_id,
  })

  if (response.success === true && response.epiphanyItem) {
    return redirect(
      `/dashboard/epiphanies/view/${response.epiphanyItem.model_id}/${response.epiphanyItem.history_id}`,
    )
  }

  return {
    errors: {
      fieldErrors: {
        general: 'Failed to update epiphany item. Please try again.',
      },
    },
  }
}

export const epiphanyLoader = async (
  args: LoaderFunctionArgs,
): Promise<EpiphanyLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const epiphanyItem = await getCurrentEpiphanyItemForUser(args, user)
  if (epiphanyItem === null) {
    return redirect('/')
  }

  return {
    content: epiphanyItem.content,
    historyId: epiphanyItem.history_id,
    modelId: epiphanyItem.model_id,
  }
}
