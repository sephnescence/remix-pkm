import { db } from '@/utils/db'

export const PkmVoidRepository = {}

type CreateVoidArgs = {
  content: string
  userId: string
}

type UpdateVoidArgs = CreateVoidArgs & {
  historyId: string
  modelId: string
}

export const CreateVoidItem = async ({ userId, content }: CreateVoidArgs) => {
  await db.pkmHistory.create({
    data: {
      user_id: userId,
      is_current: true,
      model_type: 'PkmVoid',
      void_item: {
        create: {
          content,
          user_id: userId,
        },
      },
    },
  })
}

export const UpdateVoidItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateVoidArgs) => {
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
          model_type: 'PkmVoid',
          model_id: modelId,
          void_item: {
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
