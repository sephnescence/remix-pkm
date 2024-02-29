import { db } from '@/utils/db'
import { randomUUID } from 'node:crypto'
import { User } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'

type CreateTodoArgs = {
  content: string
  userId: string
}

type UpdateTodoArgs = CreateTodoArgs & {
  historyId: string
  modelId: string
}

// Get the current todo item for the user
// Can add another method later if we ever need to grab the non-current one
export const getCurrentTodoItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const todoItemId = args.params.model_id

  if (!todoItemId) {
    return null
  }

  const todoItem = await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true,
      history_id: historyItemId,
      model_id: todoItemId,
    },
    select: {
      todo_item: {
        select: {
          content: true,
          model_id: true,
          history_id: true,
        },
      },
    },
  })

  if (!todoItem || !todoItem.todo_item) {
    return null
  }

  return todoItem.todo_item
}

export const storeTodoItem = async ({ userId, content }: CreateTodoArgs) => {
  const modelId = randomUUID()

  return await db.pkmHistory
    .create({
      data: {
        user_id: userId,
        is_current: true,
        model_type: 'PkmTodo',
        model_id: modelId,
        todo_item: {
          create: {
            content,
            model_id: modelId,
            user_id: userId,
          },
        },
      },
    })
    .then((todoItem) => {
      return {
        success: true,
        todoItem,
      }
    })
    .catch(() => {
      return {
        success: false,
        todoItem: null,
      }
    })
}

export const updateTodoItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateTodoArgs) => {
  return await db
    .$transaction([
      db.pkmHistory.update({
        where: {
          history_id: historyId,
          is_current: true,
        },
        data: {
          is_current: false,
        },
      }),
      db.pkmHistory.create({
        data: {
          user_id: userId,
          is_current: true,
          model_type: 'PkmTodo',
          model_id: modelId,
          todo_item: {
            create: {
              content,
              model_id: modelId,
              user_id: userId,
            },
          },
        },
      }),
    ])
    .then((todoItem) => {
      return {
        success: true,
        todoItem: todoItem[1],
      }
    })
    .catch(() => {
      return {
        success: false,
        todoItem: null,
      }
    })
}
