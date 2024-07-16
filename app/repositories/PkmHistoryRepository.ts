import { db } from '@/utils/db'
import { PkmHistory, Prisma } from '@prisma/client'

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

export const getAlwaysLatestUrlByModelId = async ({
  modelId,
  userId,
}: {
  modelId: string
  userId: string
}) => {
  const query = Prisma.sql`
    select
      case
        when model_type = 'SuiteContents' then '/suite/' || su_su.id || '/config'
        when model_type = 'StoreyContents' then '/suite/' || st_su.id || '/storey/' || st_st.id || '/config'
        when model_type = 'SpaceContents' then '/suite/' || sp_su.id || '/storey/' || sp_st.id || '/space/' || sp_sp.id || '/config'
        when model_type = 'PkmEpiphany' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/epiphany/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmEpiphany' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/epiphany/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmEpiphany' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_sp.id || '/eModelType/epiphany/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmInbox' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/inbox/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmInbox' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/inbox/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmInbox' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_sp.id || '/eModelType/inbox/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmPassingThought' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/passing-thought/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmPassingThought' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/passing-thought/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmPassingThought' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_sp.id || '/eModelType/passing-thought/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmTodo' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/todo/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmTodo' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/todo/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmTodo' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_sp.id || '/eModelType/todo/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmTrash' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/trash/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmTrash' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/trash/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmTrash' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_su.id || '/eModelType/trash/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmVoid' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/void/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmVoid' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/void/eModelId/' || model_id || '/eHistoryId/' || history_id
        when model_type = 'PkmVoid' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_sp.id || '/eModelType/void/eModelId/' || model_id || '/eHistoryId/' || history_id
      else '/' end as link,
      case
        when model_type = 'SuiteContents' then su_su.name
        when model_type = 'StoreyContents' then st_st.name
        when model_type = 'SpaceContents' then sp_sp.name
        when model_type = 'PkmEpiphany' then (select name from "PkmEpiphany" pe where pe.history_id = h.history_id)
        when model_type = 'PkmInbox' then (select name from "PkmInbox" pe where pe.history_id = h.history_id)
        when model_type = 'PkmPassingThought' then (select name from "PkmPassingThought" pe where pe.history_id = h.history_id)
        when model_type = 'PkmTodo' then (select name from "PkmTodo" pe where pe.history_id = h.history_id)
        when model_type = 'PkmTrash' then (select name from "PkmTrash" pe where pe.history_id = h.history_id)
        when model_type = 'PkmVoid' then (select name from "PkmVoid" pe where pe.history_id = h.history_id)
      else '/' end as name
    from "PkmHistory" h
    left join "Suite" su_su on su_su.id = h.suite_id
    left join "Storey" st_st on st_st.id = h.storey_id
    left join "Suite" st_su on st_su.id = st_st.suite_id
    left join "Space" sp_sp on sp_sp.id = h.space_id
    left join "Storey" sp_st on sp_st.id = sp_sp.storey_id
    left join "Suite" sp_su on sp_su.id = sp_st.suite_id
    where h.is_current = true
      and h.model_id = ${modelId}::uuid
      and h.user_id = ${userId}::uuid
  `

  const results: [{ link: string; name: string }] = await db.$queryRaw(query)

  if (results[0].link && results[0].name) {
    return [results[0].link, results[0].name]
  }

  return ['/', 'Unknown']
}

export const getAlwaysLatestUrlByContentId = async ({
  contentId,
  userId,
}: {
  contentId: string
  userId: string
}) => {
  const query = Prisma.sql`
    select
      case
        when model_type = 'SuiteContents' then '/suite/' || su_su.id || '/config#' || c.content_id
        when model_type = 'StoreyContents' then '/suite/' || st_su.id || '/storey/' || st_st.id || '/config#' || c.content_id
        when model_type = 'SpaceContents' then '/suite/' || sp_su.id || '/storey/' || sp_st.id || '/space/' || sp_sp.id || '/config#' || c.content_id
        when model_type = 'PkmEpiphany' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/epiphany/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmEpiphany' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/epiphany/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmEpiphany' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_sp.id || '/eModelType/epiphany/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmInbox' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/inbox/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmInbox' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/inbox/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmInbox' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_sp.id || '/eModelType/inbox/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmPassingThought' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/passing-thought/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmPassingThought' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/passing-thought/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmPassingThought' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_sp.id || '/eModelType/passing-thought/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmTodo' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/todo/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmTodo' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/todo/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmTodo' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_sp.id || '/eModelType/todo/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmTrash' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/trash/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmTrash' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/trash/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmTrash' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_su.id || '/eModelType/trash/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmVoid' and h.storey_id is null then '/item/view/eSuiteId/' || su_su.id || '/eModelType/void/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmVoid' and h.space_id is null then '/item/view/eSuiteId/' || st_su.id || '/eStoreyId/' || st_st.id ||  '/eModelType/void/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
        when model_type = 'PkmVoid' then '/item/view/eSuiteId/' || sp_su.id || '/eStoreyId/' || sp_st.id ||  '/eSpaceId/' || sp_sp.id || '/eModelType/void/eModelId/' || h.model_id || '/eHistoryId/' || h.history_id || '#' || c.content_id
      else '/' end as link,
      case
        when model_type = 'SuiteContents' then su_su.name
        when model_type = 'StoreyContents' then st_st.name
        when model_type = 'SpaceContents' then sp_sp.name
        when model_type = 'PkmEpiphany' then (select name from "PkmEpiphany" pe where pe.history_id = h.history_id)
        when model_type = 'PkmInbox' then (select name from "PkmInbox" pe where pe.history_id = h.history_id)
        when model_type = 'PkmPassingThought' then (select name from "PkmPassingThought" pe where pe.history_id = h.history_id)
        when model_type = 'PkmTodo' then (select name from "PkmTodo" pe where pe.history_id = h.history_id)
        when model_type = 'PkmTrash' then (select name from "PkmTrash" pe where pe.history_id = h.history_id)
        when model_type = 'PkmVoid' then (select name from "PkmVoid" pe where pe.history_id = h.history_id)
      else '/' end as name
    from "PkmContents" c
    join "PkmHistory" h on h.history_id = c.history_id and h.is_current is true
    left join "Suite" su_su on su_su.id = h.suite_id
    left join "Storey" st_st on st_st.id = h.storey_id
    left join "Suite" st_su on st_su.id = st_st.suite_id
    left join "Space" sp_sp on sp_sp.id = h.space_id
    left join "Storey" sp_st on sp_st.id = sp_sp.storey_id
    left join "Suite" sp_su on sp_su.id = sp_st.suite_id
    where c.content_id = ${contentId}::uuid
      and h.user_id = ${userId}::uuid
  `

  const results: [{ link: string; name: string }] = await db.$queryRaw(query)

  if (results[0].link && results[0].name) {
    return [results[0].link, results[0].name]
  }

  return ['/', 'Unknown']
}
