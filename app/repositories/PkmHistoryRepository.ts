import { db } from '@/utils/db'
import { PkmHistory } from '@prisma/client'

type PkmHistoryItemForDashboard = Omit<PkmHistory, 'user_id' | 'is_current'> & {
  epiphany_item?: { content: string } | null
} & { inbox_item?: { content: string } | null } & {
  passing_thought_item?: { content: string } | null
} & { todo_item?: { content: string } | null } & {
  void_item?: { content: string } | null
} & {
  trash_item?: { content: string } | null
}

export type PkmHistoryForDashboard = {
  history: PkmHistoryItemForDashboard[]
}

export type PkmTrashForDashboard = {
  trash: PkmHistoryItemForDashboard[]
}

type GetHistoryItemArgs = {
  suiteId: string | null
  storeyId: string | null
  spaceId: string | null
  modelId: string
  historyId: string
  userId: string
}

export type CurrentHistoryItems = Awaited<
  ReturnType<typeof getCurrentHistoryItemsForUser>
>

export const getCurrentHistoryItemsForUser = async ({
  userId,
  page = 1,
  perPage = 1000,
}: {
  userId: string
  page?: number
  perPage?: number
}) => {
  return await db.pkmHistory
    .findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: perPage,
      skip: (page - 1) * perPage,
      where: {
        user_id: userId,
        is_current: true,
      },
      select: {
        history_id: true,
        model_id: true,
        model_type: true,
        createdAt: true,
        suite: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        storey: {
          select: {
            id: true,
            name: true,
            description: true,
            suite: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        space: {
          select: {
            id: true,
            name: true,
            description: true,
            storey: {
              select: {
                id: true,
                name: true,
                suite: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        epiphany_item: {
          select: {
            content: true,
            name: true,
            summary: true,
          },
        },
        inbox_item: {
          select: {
            content: true,
            name: true,
            summary: true,
          },
        },
        passing_thought_item: {
          select: {
            content: true,
            name: true,
            summary: true,
          },
        },
        todo_item: {
          select: {
            content: true,
            name: true,
            summary: true,
          },
        },
        trash_item: {
          select: {
            content: true,
            name: true,
            summary: true,
          },
        },
        void_item: {
          select: {
            content: true,
            name: true,
            summary: true,
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

export const getCurrentHistoryItemForUser = async ({
  suiteId,
  storeyId,
  spaceId,
  modelId,
  historyId,
  userId,
}: GetHistoryItemArgs) => {
  return await db.pkmHistory
    .findFirst({
      where: {
        user_id: userId,
        is_current: true,
        history_id: historyId,
        model_id: modelId,
        suite_id: suiteId,
        storey_id: storeyId,
        space_id: spaceId,
      },
      select: {
        history_id: true,
        model_type: true,
        suite: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        storey: {
          select: {
            id: true,
            name: true,
            description: true,
            suite: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        space: {
          select: {
            id: true,
            name: true,
            description: true,
            storey: {
              select: {
                id: true,
                name: true,
                suite: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        epiphany_item: {
          select: {
            content: true,
            name: true,
            summary: true,
          },
        },
        inbox_item: {
          select: {
            content: true,
            name: true,
            summary: true,
          },
        },
        passing_thought_item: {
          select: {
            content: true,
            name: true,
            summary: true,
          },
        },
        todo_item: {
          select: {
            content: true,
            name: true,
            summary: true,
          },
        },
        trash_item: {
          select: {
            content: true,
            name: true,
            summary: true,
          },
        },
        void_item: {
          select: {
            content: true,
            name: true,
            summary: true,
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
        trash_item: {
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

export const getAlwaysLatestHistoryItemForUser = async ({
  suiteId,
  storeyId,
  spaceId,
  modelId,
  userId,
}: {
  suiteId: string | null
  storeyId: string | null
  spaceId: string | null
  modelId: string
  userId: string
}) => {
  return await db.pkmHistory.findFirst({
    where: {
      is_current: true,
      user_id: userId,
      suite_id: suiteId,
      storey_id: storeyId,
      space_id: spaceId,
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
      trash_item: {
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
}

export const getPermalinkedHistoryItemForUser = async ({
  suiteId,
  storeyId,
  spaceId,
  modelId,
  historyId,
  userId,
}: {
  suiteId: string | null
  storeyId: string | null
  spaceId: string | null
  modelId: string
  historyId: string
  userId: string
}) => {
  return await db.pkmHistory.findFirst({
    where: {
      user_id: userId,
      suite_id: suiteId,
      storey_id: storeyId,
      space_id: spaceId,
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
      trash_item: {
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
}
