import { getUserAuth } from '@/utils/auth'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import {
  getCurrentTodoItemForUser,
  storeTodoItem,
  updateTodoItem,
} from '~/repositories/PkmTodoRepository'

export type TodoActionUpdateResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

export type TodoActionCreateResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

export type TodoLoaderResponse = {
  content: string
  historyId: string
  modelId: string
}

export const todoActionCreate = async (
  args: ActionFunctionArgs,
): Promise<TodoActionCreateResponse | TypedResponse<never>> => {
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

  const response = await storeTodoItem({
    userId: user.id,
    content: content.toString(),
  })

  if (response.success === true && response.todoItem) {
    return redirect(
      `/dashboard/todo/view/${response.todoItem.model_id}/${response.todoItem.history_id}`,
    )
  }

  return {
    errors: {
      fieldErrors: {
        general: 'Failed to create todo item. Please try again.',
      },
    },
  }
}

export const todoActionUpdate = async (
  args: ActionFunctionArgs,
): Promise<TodoActionUpdateResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const todoItem = await getCurrentTodoItemForUser(args, user)

  if (todoItem === null) {
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

  const response = await updateTodoItem({
    userId: user.id,
    content: content.toString(),
    historyId: todoItem.history_id,
    modelId: todoItem.model_id,
  })

  if (response.success === true && response.todoItem) {
    return redirect(
      `/dashboard/todo/view/${response.todoItem.model_id}/${response.todoItem.history_id}`,
    )
  }

  return {
    errors: {
      fieldErrors: {
        general: 'Failed to update todo item. Please try again.',
      },
    },
  }
}

export const todoLoader = async (
  args: LoaderFunctionArgs,
): Promise<TodoLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const todoItem = await getCurrentTodoItemForUser(args, user)
  if (todoItem === null) {
    return redirect('/')
  }

  return {
    content: todoItem.content,
    historyId: todoItem.history_id,
    modelId: todoItem.model_id,
  }
}
