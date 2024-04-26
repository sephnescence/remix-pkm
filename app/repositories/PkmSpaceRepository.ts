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

export type SpaceItemCountsResults = ItemCountRow & {
  id: string
}

type StoreSpaceArgs = {
  storeyId: string
  userId: string
  content: string
  description: string
  name: string
}

type UpdateSpaceArgs = {
  spaceId: string
  userId: string
  content: string
  description: string
  name: string
}

export const storeSpaceConfig = async ({
  storeyId,
  userId,
  content,
  description,
  name,
}: StoreSpaceArgs) => {
  return await db.space
    .create({
      data: {
        storey_id: storeyId,
        user_id: userId,
        name,
        description,
        content,
      },
    })
    .then((space) => {
      return {
        success: true,
        space,
      }
    })
    .catch(() => {
      return {
        success: false,
        space: null,
      }
    })
}

export const updateSpaceConfig = async ({
  spaceId,
  userId,
  content,
  description,
  name,
}: UpdateSpaceArgs) => {
  return await db.space
    .update({
      where: {
        user_id: userId,
        id: spaceId,
      },
      data: {
        name,
        description,
        content,
      },
    })
    .then((space) => {
      return {
        success: true,
        space,
      }
    })
    .catch(() => {
      return {
        success: false,
        space: null,
      }
    })
}

export const getSpaceConfig = async ({
  spaceId,
  userId,
}: {
  spaceId: string
  userId: string
}) => {
  const space = await db.space.findFirst({
    where: {
      user_id: userId,
      id: spaceId,
    },
    select: {
      id: true,
      content: true,
      description: true,
      name: true,
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
  })

  if (!space) {
    return null
  }

  return space
}

export const getSpaceDashboard = async ({
  storeyId,
  spaceId,
  userId,
}: {
  storeyId: string
  spaceId: string
  userId: string
}) => {
  const space = await db.space.findFirst({
    where: {
      user_id: userId,
      storey_id: storeyId,
      id: spaceId,
    },
    select: {
      name: true,
      description: true,
      id: true,
      storey_id: true,
      content: true,
      storey: {
        select: {
          id: true,
          name: true,
          description: true,
          suite: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
      pkm_history: {
        where: {
          suite_id: null,
          storey_id: storeyId,
          space_id: spaceId,
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

  if (!space) {
    return null
  }

  return space
}

export const getSpaceItemCounts = async ({
  storeyId,
  userId,
}: {
  storeyId: string
  userId: string
}) => {
  // SQL injection should be impossible here
  const query = Prisma.sql`
    select
      storey_id || '-' || space_id as id,
      (sum(case when model_type = 'PkmEpiphany' then 1 else 0 end))::int as epiphany_count,
      (sum(case when model_type = 'PkmInbox' then 1 else 0 end))::int as inbox_count,
      (sum(case when model_type = 'PkmPassingThought' then 1 else 0 end))::int as passing_thought_count,
      (sum(case when model_type = 'PkmTodo' then 1 else 0 end))::int as todo_count,
      (sum(case when model_type = 'PkmTrash' then 1 else 0 end))::int as trash_count,
      (sum(case when model_type = 'PkmVoid' then 1 else 0 end))::int as void_count
    from "PkmHistory"
    where user_id = ${userId}::uuid
      and suite_id is null
      and storey_id = ${storeyId}::uuid
      and space_id is not null
      and is_current is true
    group by storey_id || '-' || space_id
  `

  const results: [] = await db.$queryRaw(query)

  if (!results) {
    return {}
  }

  const storeys: {
    [key: string]: ItemCountRow
  } = {}

  results.map(
    (row: SpaceItemCountsResults) =>
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

export const getSpacesForUser = async ({
  userId,
  storeyId,
}: {
  userId: string
  storeyId: string
}) => {
  return await db.space
    .findMany({
      where: {
        user_id: userId,
        storey_id: storeyId,
      },
      select: {
        name: true,
        description: true,
        content: true,
        id: true,
        storey_id: true,
        storey: {
          select: {
            id: true,
            name: true,
            description: true,
            suite: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    })
    .then((spaces) => spaces)
}

export const getSpaceForUser = async ({
  storeyId,
  spaceId,
  userId,
}: {
  storeyId: string
  spaceId: string
  userId: string
}) => {
  const space = await db.space.findFirst({
    where: {
      user_id: userId,
      storey_id: storeyId,
      id: spaceId,
    },
    select: {
      name: true,
      description: true,
      content: true,
      id: true,
      storey: {
        select: {
          id: true,
          name: true,
          description: true,
          suite: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
  })

  if (!space) {
    return null
  }

  return space
}

export const getSpaceDashboardForUser = async ({
  storeyId,
  spaceId,
  userId,
}: {
  storeyId: string
  spaceId: string
  userId: string
}) => {
  const space = await db.space.findFirst({
    where: {
      user_id: userId,
      id: spaceId,
      storey_id: storeyId,
    },
    select: {
      name: true,
      description: true,
      id: true,
      content: true,
      storey: {
        select: {
          id: true,
          name: true,
          description: true,
          suite: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
      pkm_history: {
        where: {
          suite_id: null,
          storey_id: storeyId,
          space_id: spaceId,
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

  if (!space) {
    return null
  }

  return space
}
