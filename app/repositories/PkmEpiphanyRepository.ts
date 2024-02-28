import { db } from '@/utils/db'

export const PkmEpiphanyRepository = {}

type CreateEpiphanyArgs = {
  content: string
  userId: string
}

type UpdateEpiphanyArgs = CreateEpiphanyArgs & {
  historyId: string
  modelId: string
}

export const CreateEpiphanyItem = async ({
  userId,
  content,
}: CreateEpiphanyArgs) => {
  await db.pkmHistory.create({
    data: {
      user_id: userId,
      is_current: true,
      model_type: 'PkmEpiphany',
      epiphany_item: {
        create: {
          content,
          user_id: userId,
        },
      },
    },
  })
}

export const UpdateEpiphanyItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateEpiphanyArgs) => {
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
          model_type: 'PkmEpiphany',
          model_id: modelId,
          epiphany_item: {
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
