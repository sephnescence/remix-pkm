import { db } from '@/utils/db'
import { PkmHistory } from '@prisma/client'

type PkmHistoryItemForDashboard = Omit<PkmHistory, 'user_id' | 'is_current'> & {
  epiphany_item?: { content: string } | null
} & { inbox_item?: { content: string } | null } & {
  passing_thought_item?: { content: string } | null
} & { todo_item?: { content: string } | null } & {
  void_item?: { content: string } | null
}

export type PkmHistoryForDashboard = {
  history: PkmHistoryItemForDashboard[]
}

export const getHistoryItem = async (
  modelId: string,
  historyId: string,
  userId: string,
) => {
  return await db.pkmHistory
    .findFirst({
      where: {
        user_id: userId,
        is_current: true,
        history_id: historyId,
        model_id: modelId,
      },
      select: {
        model_type: true,
        epiphany_item: {
          select: {
            content: true,
          },
        },
        inbox_item: {
          select: {
            content: true,
          },
        },
        passing_thought_item: {
          select: {
            content: true,
          },
        },
        todo_item: {
          select: {
            content: true,
          },
        },
        void_item: {
          select: {
            content: true,
          },
        },
      },
    })
    .then((historyItem) => {
      return {
        success: true,
        historyItem,
      }
    })
    .catch(() => {
      return {
        success: false,
        historyItem: null,
      }
    })
}
