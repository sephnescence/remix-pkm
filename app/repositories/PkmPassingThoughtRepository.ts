import { db } from '@/utils/db'

export const PkmPassingThoughtRepository = {}

type CreatePassingThoughtArgs = {
  content: string
  userId: string
}

type UpdatePassingThoughtArgs = CreatePassingThoughtArgs & {
  historyId: string
  modelId: string
}

export const CreatePassingThoughtItem = async ({
  userId,
  content,
}: CreatePassingThoughtArgs) => {
  await db.pkmHistory.create({
    data: {
      user_id: userId,
      is_current: true,
      model_type: 'PkmPassingThought',
      passing_thought_item: {
        create: {
          content,
          user_id: userId,
          void_at: new Date('9000-01-01 00:00:00'),
        },
      },
    },
  })
}

export const UpdatePassingThoughtItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdatePassingThoughtArgs) => {
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
          model_type: 'PkmPassingThought',
          model_id: modelId,
          passing_thought_item: {
            create: {
              content,
              model_id: modelId,
              user_id: userId,
              void_at: new Date('9000-01-01 00:00:00'),
            },
          },
        },
      }),
    ])
    .then(() => true)
    .catch(() => false)
}
