import { db } from '@/utils/db'

export const autoHealSuiteHistoryAndContents = async ({
  suiteId,
  userId,
  content,
}: {
  suiteId: string
  userId: string
  content: string
}) => {
  const newHistoryId = crypto.randomUUID()
  await db.$transaction([
    db.pkmHistory.create({
      data: {
        history_id: newHistoryId,
        model_id: suiteId,
        model_type: 'SuiteContents',
        is_current: true,
        user_id: userId,
        suite_id: suiteId,
        storey_id: null,
        space_id: null,
      },
    }),
    db.pkmContents.create({
      data: {
        content_id: crypto.randomUUID(),
        model_id: suiteId,
        history_id: newHistoryId,
        sort_order: 1,
        content: content,
      },
    }),
  ])
}
