import { db } from '@/utils/db'

export const autoHealSpaceHistoryAndContents = async ({
  spaceId,
  userId,
  content,
}: {
  spaceId: string
  userId: string
  content: string
}) => {
  const newHistoryId = crypto.randomUUID()
  await db.$transaction([
    db.pkmHistory.create({
      data: {
        history_id: newHistoryId,
        model_id: spaceId,
        model_type: 'SpaceContents',
        is_current: true,
        user_id: userId,
        suite_id: null,
        storey_id: null,
        space_id: spaceId,
      },
    }),
    db.pkmContents.create({
      data: {
        content_id: crypto.randomUUID(),
        model_id: spaceId,
        history_id: newHistoryId,
        sort_order: 1,
        content: content,
      },
    }),
  ])
}
