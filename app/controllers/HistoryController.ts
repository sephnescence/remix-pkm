import { getUserAuth } from '@/utils/auth'
import { ActionFunctionArgs, redirect } from '@remix-run/node'
import {
  UpdateEpiphanyArgs,
  updateEpiphanyItem,
} from '~/repositories/PkmEpiphanyRepository'
import { getHistoryItem } from '~/repositories/PkmHistoryRepository'

export const historyActionMove = async (args: ActionFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  try {
    const {
      params: { model_id: modelId, history_id: historyId, move_to: moveTo },
    } = args

    const userId = user.id

    const historyItemResponse = await getHistoryItem(
      modelId!,
      historyId!,
      userId,
    )

    if (historyItemResponse.success === false) {
      return {
        errors: {
          fieldErrors: {
            general: 'No history item found',
          },
        },
      }
    }

    const content = historyItemResponse.historyItem?.['inbox_item']!.content

    let redirectUrl
    if (moveTo === 'epiphany') {
      redirectUrl = await moveToEpiphanyItem({
        content: content!,
        historyId: historyId!,
        modelId: modelId!,
        userId,
      })
    }

    if (redirectUrl) {
      return redirect(redirectUrl)
    }

    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update epiphany item. Please try again.',
        },
      },
    }
  } catch {
    return {
      errors: {
        fieldErrors: {
          general: 'No form data found',
        },
      },
    }
  }
}

const moveToEpiphanyItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateEpiphanyArgs) => {
  const response = await updateEpiphanyItem({
    content: content!,
    historyId: historyId!,
    modelId: modelId!,
    userId,
  })

  if (response.success === true && response.epiphanyItem) {
    return `/dashboard/epiphanies/view/${response.epiphanyItem.model_id}/${response.epiphanyItem.history_id}`
  }

  return null
}
