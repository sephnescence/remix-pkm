import { db } from '@/utils/db'
import { Prisma } from '@prisma/client'

export type ItemCountRow = {
  epiphany_count: number
  inbox_count: number
  passing_thought_count: number
  todo_count: number
  trash_count: number
  void_count: number
}

export type SuiteItemCountsResults = ItemCountRow & {
  id: string
}

type StoreSuiteArgs = {
  userId: string
  content: string
  description: string
  name: string
}

type UpdateSuiteArgs = {
  suiteId: string
  userId: string
  content: string
  description: string
  name: string
}

export type SuiteForMove = {
  id: string
  description: string
  name: string
  counts: ItemCountRow
  storeys: number
}

export const storeSuiteConfig = async ({
  userId,
  content,
  description,
  name,
}: StoreSuiteArgs) => {
  return await db.suite
    .create({
      data: {
        user_id: userId,
        name,
        description,
        content,
      },
    })
    .then((suite) => {
      return {
        success: true,
        suite,
      }
    })
    .catch(() => {
      return {
        success: false,
        suite: null,
      }
    })
}

export const updateSuiteConfig = async ({
  suiteId,
  userId,
  content,
  description,
  name,
}: UpdateSuiteArgs) => {
  return await db.suite
    .update({
      where: {
        user_id: userId,
        id: suiteId,
      },
      data: {
        name,
        description,
        content,
      },
    })
    .then((suite) => {
      return {
        success: true,
        suite,
      }
    })
    .catch(() => {
      return {
        success: false,
        suite: null,
      }
    })
}

export const getSuiteConfig = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}) => {
  const suite = await db.suite.findFirst({
    where: {
      user_id: userId,
      id: suiteId,
    },
    select: {
      name: true,
      description: true,
      content: true,
      id: true,
    },
  })

  if (!suite) {
    return null
  }

  return suite
}

export const getSuiteDashboard = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}) => {
  const suite = await db.suite.findFirst({
    where: {
      user_id: userId,
      id: suiteId,
    },
    select: {
      name: true,
      description: true,
      id: true,
      content: true,
      storeys: {
        select: {
          _count: {
            select: {
              spaces: true,
            },
          },
          id: true,
          name: true,
          description: true,
          content: true,
          suite_id: true,
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
      },
      pkm_history: {
        where: {
          suite_id: suiteId,
          storey_id: null,
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

  if (!suite) {
    return null
  }

  return suite
}

export const getSuitesForUser = async ({ userId }: { userId: string }) => {
  return await db.suite
    .findMany({
      where: {
        user_id: userId,
      },
      select: {
        _count: {
          select: {
            storeys: true,
          },
        },
        name: true,
        description: true,
        content: true,
        id: true,
      },
    })
    .then((suites) => suites)
}

// This shares a large amount of code with getSuiteItemCounts
// There's only one line that's different
// and suite_id = ${suiteId}::uuid
export const getItemCountForSuite = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}) => {
  // SQL injection should be impossible here
  const query = Prisma.sql`
    select
      suite_id as id,
      (sum(case when model_type = 'PkmEpiphany' then 1 else 0 end))::int as epiphany_count,
      (sum(case when model_type = 'PkmInbox' then 1 else 0 end))::int as inbox_count,
      (sum(case when model_type = 'PkmPassingThought' then 1 else 0 end))::int as passing_thought_count,
      (sum(case when model_type = 'PkmTodo' then 1 else 0 end))::int as todo_count,
      (sum(case when model_type = 'PkmTrash' then 1 else 0 end))::int as trash_count,
      (sum(case when model_type = 'PkmVoid' then 1 else 0 end))::int as void_count
    from "PkmHistory"
    where user_id = ${userId}::uuid
      and suite_id = ${suiteId}::uuid
      and storey_id is null
      and space_id is null
      and is_current is true
    group by suite_id
  `

  const results: [] = await db.$queryRaw(query)

  if (!results) {
    return {}
  }

  const suites: {
    [key: string]: ItemCountRow
  } = {}

  results.map(
    (row: SuiteItemCountsResults) =>
      (suites[row.id] = {
        epiphany_count: row.epiphany_count,
        inbox_count: row.inbox_count,
        passing_thought_count: row.passing_thought_count,
        todo_count: row.todo_count,
        trash_count: row.trash_count,
        void_count: row.void_count,
      }),
  )

  return suites
}

export const getSuiteItemCounts = async ({ userId }: { userId: string }) => {
  // SQL injection should be impossible here
  const query = Prisma.sql`
    select
      suite_id as id,
      (sum(case when model_type = 'PkmEpiphany' then 1 else 0 end))::int as epiphany_count,
      (sum(case when model_type = 'PkmInbox' then 1 else 0 end))::int as inbox_count,
      (sum(case when model_type = 'PkmPassingThought' then 1 else 0 end))::int as passing_thought_count,
      (sum(case when model_type = 'PkmTodo' then 1 else 0 end))::int as todo_count,
      (sum(case when model_type = 'PkmTrash' then 1 else 0 end))::int as trash_count,
      (sum(case when model_type = 'PkmVoid' then 1 else 0 end))::int as void_count
    from "PkmHistory"
    where user_id = ${userId}::uuid
      and suite_id is not null
      and storey_id is null
      and space_id is null
      and is_current is true
    group by suite_id
  `

  const results: [] = await db.$queryRaw(query)

  if (!results) {
    return {}
  }

  const suites: {
    [key: string]: ItemCountRow
  } = {}

  results.map(
    (row: SuiteItemCountsResults) =>
      (suites[row.id] = {
        epiphany_count: row.epiphany_count,
        inbox_count: row.inbox_count,
        passing_thought_count: row.passing_thought_count,
        todo_count: row.todo_count,
        trash_count: row.trash_count,
        void_count: row.void_count,
      }),
  )

  return suites
}

export const getSuiteAndChildrenForUser = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}) => {
  const suite = await db.suite.findFirst({
    where: {
      user_id: userId,
      id: suiteId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      content: true,
      storeys: {
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
          suite_id: true,
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
      },
    },
  })

  if (!suite) {
    return null
  }

  return suite
}

export const getSuiteForUser = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}) => {
  const suite = await db.suite.findFirst({
    where: {
      user_id: userId,
      id: suiteId,
    },
    select: {
      name: true,
      description: true,
      content: true,
      id: true,
    },
  })

  if (!suite) {
    return null
  }

  return suite
}

export const getSuiteDashboardForUser = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}) => {
  const suite = await db.suite.findFirst({
    where: {
      user_id: userId,
      id: suiteId,
    },
    select: {
      name: true,
      description: true,
      id: true,
      content: true,
      storeys: {
        select: {
          _count: {
            select: {
              spaces: true,
            },
          },
          id: true,
          name: true,
          description: true,
          content: true,
          suite_id: true,
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
      },
      pkm_history: {
        where: {
          suite_id: suiteId,
          storey_id: null,
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

  if (!suite) {
    return null
  }

  return suite
}

export const getSuitesForMove = async ({
  userId,
}: {
  userId: string
}): Promise<SuiteForMove[]> => {
  const suites = await getSuitesForUser({
    userId,
  })

  const suiteCounts = await getSuiteItemCounts({
    userId: userId,
  })

  const enrichedSuites = suites.map((suite) => {
    return {
      id: suite.id,
      name: suite.name,
      description: suite.description,
      counts: suiteCounts[suite.id] || {
        epiphany_count: 0,
        inbox_count: 0,
        passing_thought_count: 0,
        todo_count: 0,
        trash_count: 0,
        void_count: 0,
      },
      storeys: suite._count.storeys,
    }
  })

  return enrichedSuites
}

export const getSuiteForMove = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}): Promise<SuiteForMove | null> => {
  const suite = await db.suite.findFirst({
    where: {
      user_id: userId,
      id: suiteId,
    },
    select: {
      _count: {
        select: {
          storeys: true,
        },
      },
      name: true,
      description: true,
      id: true,
    },
  })

  if (!suite) {
    return null
  }

  const suiteCounts = await getItemCountForSuite({
    userId: userId,
    suiteId,
  })

  const enrichedSuite = {
    id: suite.id,
    name: suite.name,
    description: suite.description,
    counts: suiteCounts[suite.id] || {
      epiphany_count: 0,
      inbox_count: 0,
      passing_thought_count: 0,
      todo_count: 0,
      trash_count: 0,
      void_count: 0,
    },
    storeys: suite._count.storeys,
  }

  return enrichedSuite
}
