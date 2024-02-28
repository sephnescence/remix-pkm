import { db } from '@/utils/db'

export const PkmTodoRepository = {}

type CreateTodoArgs = {
  content: string
  userId: string
}

type UpdateTodoArgs = CreateTodoArgs & {
  historyId: string
  modelId: string
}

export const CreateTodoItem = async ({ userId, content }: CreateTodoArgs) => {
  await db.pkmHistory.create({
    data: {
      user_id: userId,
      is_current: true,
      model_type: 'PkmTodo',
      todo_item: {
        create: {
          content,
          user_id: userId,
        },
      },
    },
  })
}

export const UpdateTodoItem = async ({
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
    .then(() => true)
    .catch(() => false)
}
