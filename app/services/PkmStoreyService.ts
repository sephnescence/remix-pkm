import { db } from '@/utils/db'

export const autoHealStoreyHistoryAndContents = async ({
  storeyId,
  userId,
  content,
}: {
  storeyId: string
  userId: string
  content: string
}) => {
  const newHistoryId = crypto.randomUUID()
  await db.$transaction([
    db.pkmHistory.create({
      data: {
        history_id: newHistoryId,
        model_id: storeyId,
        model_type: 'StoreyContents',
        is_current: true,
        user_id: userId,
        suite_id: null,
        storey_id: storeyId,
        space_id: null,
      },
    }),
    db.pkmContents.create({
      data: {
        content_id: crypto.randomUUID(),
        model_id: storeyId,
        history_id: newHistoryId,
        sort_order: 1,
        content: content,
      },
    }),
  ])
}
