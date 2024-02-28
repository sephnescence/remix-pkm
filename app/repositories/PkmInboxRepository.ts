import { db } from '@/utils/db'

export const PkmInboxRepository = {}

type CreateInboxArgs = {
  content: string
  userId: string
}

type UpdateInboxArgs = CreateInboxArgs & {
  historyId: string
  modelId: string
}

export const CreateInboxItem = async ({ userId, content }: CreateInboxArgs) => {
  await db.pkmHistory.create({
    data: {
      user_id: userId,
      is_current: true,
      model_type: 'PkmInbox',
      inbox_item: {
        create: {
          content,
          user_id: userId,
        },
      },
    },
  })
}

export const UpdateInboxItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateInboxArgs) => {
  await db.$transaction([
    db.pkmHistory.update({
      where: {
        history_id: historyId,
      },
      data: {
        is_current: false,
      },
    }),
    db.pkmHistory.create({
      data: {
        user_id: userId,
        is_current: true,
        model_type: 'PkmInbox',
        model_id: modelId,
        inbox_item: {
          create: {
            content,
            model_id: modelId,
            user_id: userId,
          },
        },
      },
    }),
  ])
}
