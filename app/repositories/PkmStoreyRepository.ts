import { db } from '@/utils/db'
import { Prisma } from '@prisma/client'
import { autoHealStoreyHistoryAndContents } from '~/services/PkmStoreyService'

export type ItemCountRow = {
  epiphany_count: number
  inbox_count: number
  passing_thought_count: number
  todo_count: number
  trash_count: number
  void_count: number
}

export type StoreyItemCountsResults = ItemCountRow & {
  id: string
}

export type StoreyForMove = {
  id: string
  description: string
  name: string
  counts: ItemCountRow
  spaces: number
  suiteId: string
}

export const getStoreyConfig = async ({
  storeyId,
  userId,
}: {
  storeyId: string
  userId: string
}) => {
  const args = {
    where: {
      user_id: userId,
      id: storeyId,
    },
    select: {
      id: true,
      suite_id: true,
      content: true,
      description: true,
      name: true,
      pkm_history: {
        where: {
          suite_id: null,
          storey_id: storeyId,
          space_id: null,
          is_current: true,
          model_type: 'StoreyContents',
        },
        select: {
          history_id: true,
        },
      },
      suite: {
        select: {
          name: true,
        },
      },
    },
  }

  const storey = await db.storey.findFirst(args)

  if (!storey) {
    return null
  }

  if (!storey.pkm_history.length) {
    await autoHealStoreyHistoryAndContents({
      storeyId,
      userId,
      content: storey.content,
    })

    // TypeScript complains if I just call the method recursively
    return await db.storey.findFirst(args)
  }

  return storey
}

export const getStoreyDashboard = async ({
  suiteId,
  storeyId,
  userId,
}: {
  suiteId: string
  storeyId: string
  userId: string
}) => {
  const args = {
    where: {
      user_id: userId,
      suite_id: suiteId,
      id: storeyId,
    },
    select: {
      name: true,
      description: true,
      id: true,
      suite_id: true,
      content: true,
      suite: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      spaces: {
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
        },
      },
      pkm_history: {
        where: {
          suite_id: suiteId,
          storey_id: storeyId,
          space_id: null,
          is_current: true,
        },
        select: {
          createdAt: true,
          history_id: true,
          model_id: true,
          model_type: true,
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
      },
    },
  }

  const storey = await db.storey.findFirst(args)

  if (!storey) {
    return null
  }

  return storey
}

// This shares a large amount of code with getStoreyItemCounts
// There's only two lines that are different
// and suite_id = is not null
// and storey_id = ${storeyId}::uuid
export const getItemCountForStorey = async ({
  storeyId,
  userId,
}: {
  storeyId: string
  userId: string
}) => {
  // SQL injection should be impossible here
  const query = Prisma.sql`
    select
      suite_id || '-' || storey_id as id,
      (sum(case when model_type = 'PkmEpiphany' then 1 else 0 end))::int as epiphany_count,
      (sum(case when model_type = 'PkmInbox' then 1 else 0 end))::int as inbox_count,
      (sum(case when model_type = 'PkmPassingThought' then 1 else 0 end))::int as passing_thought_count,
      (sum(case when model_type = 'PkmTodo' then 1 else 0 end))::int as todo_count,
      (sum(case when model_type = 'PkmTrash' then 1 else 0 end))::int as trash_count,
      (sum(case when model_type = 'PkmVoid' then 1 else 0 end))::int as void_count
    from "PkmHistory"
    where user_id = ${userId}::uuid
    and suite_id is not null
    and storey_id = ${storeyId}::uuid
    and space_id is null
    and is_current is true
    group by suite_id || '-' || storey_id
  `

  const results: [] = await db.$queryRaw(query)

  if (!results) {
    return {}
  }

  const storeys: {
    [key: string]: ItemCountRow
  } = {}

  results.map(
    (row: StoreyItemCountsResults) =>
      (storeys[row.id] = {
        epiphany_count: row.epiphany_count,
        inbox_count: row.inbox_count,
        passing_thought_count: row.passing_thought_count,
        todo_count: row.todo_count,
        trash_count: row.trash_count,
        void_count: row.void_count,
      }),
  )

  return storeys
}

export const getStoreyItemCounts = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}) => {
  // SQL injection should be impossible here
  const query = Prisma.sql`
    select
      suite_id || '-' || storey_id as id,
      (sum(case when model_type = 'PkmEpiphany' then 1 else 0 end))::int as epiphany_count,
      (sum(case when model_type = 'PkmInbox' then 1 else 0 end))::int as inbox_count,
      (sum(case when model_type = 'PkmPassingThought' then 1 else 0 end))::int as passing_thought_count,
      (sum(case when model_type = 'PkmTodo' then 1 else 0 end))::int as todo_count,
      (sum(case when model_type = 'PkmTrash' then 1 else 0 end))::int as trash_count,
      (sum(case when model_type = 'PkmVoid' then 1 else 0 end))::int as void_count
    from "PkmHistory"
    where user_id = ${userId}::uuid
    and suite_id = ${suiteId}::uuid
    and storey_id is not null
    and space_id is null
    and is_current is true
    group by suite_id || '-' || storey_id
  `

  const results: [] = await db.$queryRaw(query)

  if (!results) {
    return {}
  }

  const storeys: {
    [key: string]: ItemCountRow
  } = {}

  results.map(
    (row: StoreyItemCountsResults) =>
      (storeys[row.id] = {
        epiphany_count: row.epiphany_count,
        inbox_count: row.inbox_count,
        passing_thought_count: row.passing_thought_count,
        todo_count: row.todo_count,
        trash_count: row.trash_count,
        void_count: row.void_count,
      }),
  )

  return storeys
}

export const getStoreysForUserBySuite = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}) => {
  return await db.storey
    .findMany({
      where: {
        suite_id: suiteId,
        user_id: userId,
      },
      select: {
        _count: {
          select: {
            spaces: true,
          },
        },
        suite_id: true,
        name: true,
        description: true,
        content: true,
        id: true,
      },
    })
    .then((storeys) => storeys)
}

export const getStoreysForUser = async ({ userId }: { userId: string }) => {
  return await db.storey
    .findMany({
      where: {
        user_id: userId,
      },
      select: {
        _count: {
          select: {
            spaces: true,
          },
        },
        suite_id: true,
        name: true,
        description: true,
        content: true,
        id: true,
      },
    })
    .then((storeys) => storeys)
}

export const getStoreyAndChildrenForUser = async ({
  suiteId,
  storeyId,
  userId,
}: {
  suiteId: string
  storeyId: string
  userId: string
}) => {
  const storey = await db.storey.findFirst({
    where: {
      user_id: userId,
      suite_id: suiteId,
      id: storeyId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      content: true,
      suite_id: true,
      pkm_history: {
        where: {
          suite_id: null,
          storey_id: storeyId,
          space_id: null,
          is_current: true,
          model_type: 'StoreyContents',
        },
        select: {
          history_id: true,
        },
      },
      spaces: {
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
          storey_id: true,
        },
      },
    },
  })

  if (!storey) {
    return null
  }

  return storey
}

export const getStoreyForUser = async ({
  suiteId,
  storeyId,
  userId,
}: {
  suiteId: string
  storeyId: string
  userId: string
}) => {
  const storey = await db.storey.findFirst({
    where: {
      user_id: userId,
      suite_id: suiteId,
      id: storeyId,
    },
    select: {
      name: true,
      description: true,
      content: true,
      id: true,
      suite: {
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
        },
      },
    },
  })

  if (!storey) {
    return null
  }

  return storey
}

export const getStoreyDashboardForUser = async ({
  suiteId,
  storeyId,
  userId,
}: {
  suiteId: string
  storeyId: string
  userId: string
}) => {
  const storey = await db.storey.findFirst({
    where: {
      user_id: userId,
      suite_id: suiteId,
      id: storeyId,
    },
    select: {
      name: true,
      description: true,
      id: true,
      suite_id: true,
      content: true,
      suite: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      spaces: {
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
        },
      },
      pkm_history: {
        where: {
          suite_id: suiteId,
          storey_id: storeyId,
          space_id: null,
          is_current: true,
        },
        select: {
          createdAt: true,
          history_id: true,
          model_id: true,
          model_type: true,
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
      },
    },
  })

  if (!storey) {
    return null
  }

  return storey
}

export const getStoreysForMove = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}): Promise<StoreyForMove[]> => {
  const storeys = await getStoreysForUserBySuite({
    suiteId,
    userId,
  })

  const storeyCounts = await getStoreyItemCounts({
    userId: userId,
    suiteId,
  })

  const enrichedStoreys = storeys.map((storey) => {
    return {
      id: storey.id,
      name: storey.name,
      description: storey.description,
      counts: storeyCounts[`${suiteId}-${storey.id}`] || {
        epiphany_count: 0,
        inbox_count: 0,
        passing_thought_count: 0,
        todo_count: 0,
        trash_count: 0,
        void_count: 0,
      },
      spaces: storey._count.spaces,
      suiteId: storey.suite_id,
    }
  })

  return enrichedStoreys
}

export const getStoreyForMove = async ({
  storeyId,
  userId,
}: {
  storeyId: string
  userId: string
}): Promise<StoreyForMove | null> => {
  const storey = await db.storey.findFirst({
    where: {
      user_id: userId,
      id: storeyId,
    },
    select: {
      _count: {
        select: {
          spaces: true,
        },
      },
      name: true,
      description: true,
      id: true,
      suite: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!storey) {
    return null
  }

  const storeyCounts = await getItemCountForStorey({
    userId: userId,
    storeyId,
  })

  const enrichedStorey = {
    id: storey.id,
    name: storey.name,
    description: storey.description,
    counts: storeyCounts[`${storey.suite.id}-${storey.id}`] || {
      epiphany_count: 0,
      inbox_count: 0,
      passing_thought_count: 0,
      todo_count: 0,
      trash_count: 0,
      void_count: 0,
    },
    spaces: storey._count.spaces,
    suiteId: storey.suite.id,
  }

  return enrichedStorey
}
