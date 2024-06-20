import { getUserAuth } from '@/utils/auth'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import {
  UpdateEpiphanyArgs,
  updateEpiphanyItem,
} from '~/repositories/PkmEpiphanyRepository'
import {
  getCurrentHistoryItemsForUser,
  getHistoryItem,
} from '~/repositories/PkmHistoryRepository'
import {
  UpdateInboxArgs,
  updateInboxItem,
} from '~/repositories/PkmInboxRepository'
import {
  UpdatePassingThoughtArgs,
  updatePassingThoughtItem,
} from '~/repositories/PkmPassingThoughtRepository'
import {
  UpdateTodoArgs,
  updateTodoItem,
} from '~/repositories/PkmTodoRepository'
import {
  MoveToTrashArgs,
  moveItemToTrash,
} from '~/repositories/PkmTrashRepository'
import {
  UpdateVoidArgs,
  updateVoidItem,
} from '~/repositories/PkmVoidRepository'

export const historyLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const historyItems = await getCurrentHistoryItemsForUser({
    userId: user.id,
  })

  return { historyItems }
}

const _historyActionMove = async (
  args: ActionFunctionArgs,
  moveTo: 'epiphany' | 'inbox' | 'passing-thought' | 'todo' | 'trash' | 'void',
) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  try {
    const {
      params: { model_id: modelId, history_id: historyId },
    } = args

    const userId = user.id

    const historyItemResponse = await getHistoryItem(
      modelId!,
      historyId!,
      userId,
    )

    if (
      historyItemResponse.success === false ||
      !historyItemResponse.historyItem
    ) {
      return {
        errors: {
          fieldErrors: {
            general: 'No history item found',
          },
        },
      }
    }

    const item =
      historyItemResponse.historyItem.inbox_item ||
      historyItemResponse.historyItem.epiphany_item ||
      historyItemResponse.historyItem.passing_thought_item ||
      historyItemResponse.historyItem.todo_item ||
      historyItemResponse.historyItem.void_item ||
      historyItemResponse.historyItem.trash_item

    if (!item) {
      return {
        errors: {
          fieldErrors: {
            general: 'No item found',
          },
        },
      }
    }

    const content = item?.content

    const moveArgs:
      | UpdateEpiphanyArgs
      | UpdateInboxArgs
      | UpdatePassingThoughtArgs
      | UpdateTodoArgs
      | UpdateVoidArgs = {
      content: content!,
      historyId: historyId!,
      modelId: modelId!,
      userId,
    }

    let redirectUrl
    if (moveTo === 'epiphany') {
      redirectUrl = await moveToEpiphanyItem(moveArgs)
    } else if (moveTo === 'inbox') {
      redirectUrl = await moveToInboxItem(moveArgs)
    } else if (moveTo === 'passing-thought') {
      redirectUrl = await moveToPassingThoughtItem(moveArgs)
    } else if (moveTo === 'todo') {
      redirectUrl = await moveToTodoItem(moveArgs)
    } else if (moveTo === 'trash') {
      redirectUrl = await moveToTrashItem(moveArgs)
    } else if (moveTo === 'void') {
      redirectUrl = await moveToVoidItem(moveArgs)
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

export const historyActionMoveToEpiphany = async (args: ActionFunctionArgs) =>
  _historyActionMove(args, 'epiphany')
export const historyActionMoveToInbox = async (args: ActionFunctionArgs) =>
  _historyActionMove(args, 'inbox')
export const historyActionMoveToPassingThought = async (
  args: ActionFunctionArgs,
) => _historyActionMove(args, 'passing-thought')
export const historyActionMoveToTodo = async (args: ActionFunctionArgs) =>
  _historyActionMove(args, 'todo')
export const historyActionMoveToTrash = async (args: ActionFunctionArgs) =>
  _historyActionMove(args, 'trash')
export const historyActionMoveToVoid = async (args: ActionFunctionArgs) =>
  _historyActionMove(args, 'void')

export const historyActionRestoreToEpiphany = historyActionMoveToEpiphany
export const historyActionRestoreToInbox = historyActionMoveToInbox
export const historyActionRestoreToPassingThought =
  historyActionMoveToPassingThought
export const historyActionRestoreToTodo = historyActionMoveToTodo

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

const moveToInboxItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateInboxArgs) => {
  const response = await updateInboxItem({
    content: content!,
    historyId: historyId!,
    modelId: modelId!,
    userId,
  })

  if (response.success === true && response.inboxItem) {
    return `/dashboard/inbox/view/${response.inboxItem.model_id}/${response.inboxItem.history_id}`
  }

  return null
}

const moveToPassingThoughtItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdatePassingThoughtArgs) => {
  const response = await updatePassingThoughtItem({
    content: content!,
    historyId: historyId!,
    modelId: modelId!,
    userId,
  })

  if (response.success === true && response.passingThoughtItem) {
    return `/dashboard/passing-thought/view/${response.passingThoughtItem.model_id}/${response.passingThoughtItem.history_id}`
  }

  return null
}

const moveToTodoItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateTodoArgs) => {
  const response = await updateTodoItem({
    content: content!,
    historyId: historyId!,
    modelId: modelId!,
    userId,
  })

  if (response.success === true && response.todoItem) {
    return `/dashboard/todo/view/${response.todoItem.model_id}/${response.todoItem.history_id}`
  }

  return null
}

const moveToVoidItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateVoidArgs) => {
  const response = await updateVoidItem({
    content: content!,
    historyId: historyId!,
    modelId: modelId!,
    userId,
  })

  if (response.success === true && response.voidItem) {
    return `/dashboard/void/view/${response.voidItem.model_id}/${response.voidItem.history_id}`
  }

  return null
}

export const moveToTrashItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: MoveToTrashArgs) => {
  const response = await moveItemToTrash({
    content: content!,
    historyId: historyId!,
    modelId: modelId!,
    userId,
  })

  if (response.success === true && response.trashItem) {
    return `/dashboard/trash/view/${response.trashItem.model_id}/${response.trashItem.history_id}`
  }

  return null
}

export const historyActionMove = async (args: ActionFunctionArgs) => {
  const {
    params: { move_to: moveTo },
  } = args

  if (moveTo === 'epiphany') {
    return historyActionMoveToEpiphany(args)
  } else if (moveTo === 'inbox') {
    return historyActionMoveToInbox(args)
  } else if (moveTo === 'passing-thought') {
    return historyActionMoveToPassingThought(args)
  } else if (moveTo === 'todo') {
    return historyActionMoveToTodo(args)
  } else if (moveTo === 'void') {
    return historyActionMoveToVoid(args)
  }

  return {
    errors: {
      fieldErrors: {
        general:
          'Invalid move to. Please return to the previous page and try again',
      },
    },
  }
}

export const historyActionRestore = async (args: ActionFunctionArgs) => {
  const {
    params: { move_to: restoreTo },
  } = args

  if (restoreTo === 'epiphany') {
    return historyActionMoveToEpiphany(args)
  } else if (restoreTo === 'inbox') {
    return historyActionMoveToInbox(args)
  } else if (restoreTo === 'passing-thought') {
    return historyActionMoveToPassingThought(args)
  } else if (restoreTo === 'todo') {
    return historyActionMoveToTodo(args)
  }

  return {
    errors: {
      fieldErrors: {
        general:
          'Invalid move to. Please return to the previous page and try again',
      },
    },
  }
}

export const historyActionTrash = historyActionMoveToTrash
