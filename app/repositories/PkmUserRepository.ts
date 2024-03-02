import { db } from '@/utils/db'

export const getUserTrashByClerkId = async (clerkId: string) => {
  return await db.user.findFirst({
    where: {
      clerkId,
    },
    select: {
      pkm_history: {
        where: {
          is_current: true,
          model_type: 'PkmTrash',
        },
        select: {
          createdAt: true,
          history_id: true,
          model_id: true,
          model_type: true,
          trash_item: {
            select: {
              content: true,
            },
          },
        },
      },
    },
  })
}

export const getUserDashboardByClerkId = async (clerkId: string) => {
  /*
    Interesting to note right now that this performs seven queries. It's probably easier to just pull
    from each of the tables separately? Though it doesn't have relationship info built in

    i.e.
    0ms SELECT "public"."User"."id" FROM "public"."User" WHERE "public"."User"."clerkId" = $1 LIMIT $2 OFFSET $3
    0ms SELECT "public"."PkmHistory"."history_id", "public"."PkmHistory"."model_type", "public"."PkmHistory"."user_id" FROM "public"."PkmHistory" WHERE "public"."PkmHistory"."user_id" IN ($1) OFFSET $2
    0ms SELECT "public"."PkmEpiphany"."history_id", "public"."PkmEpiphany"."content" FROM "public"."PkmEpiphany" WHERE "public"."PkmEpiphany"."history_id" IN ($1,$2,$3,$4,$5) OFFSET $6
    0ms SELECT "public"."PkmInbox"."history_id", "public"."PkmInbox"."content" FROM "public"."PkmInbox" WHERE "public"."PkmInbox"."history_id" IN ($1,$2,$3,$4,$5) OFFSET $6
    0ms SELECT "public"."PkmPassingThought"."history_id", "public"."PkmPassingThought"."content" FROM "public"."PkmPassingThought" WHERE "public"."PkmPassingThought"."history_id" IN ($1,$2,$3,$4,$5) OFFSET $6
    0ms SELECT "public"."PkmTodo"."history_id", "public"."PkmTodo"."content" FROM "public"."PkmTodo" WHERE "public"."PkmTodo"."history_id" IN ($1,$2,$3,$4,$5) OFFSET $6
    0ms SELECT "public"."PkmVoid"."history_id", "public"."PkmVoid"."content" FROM "public"."PkmVoid" WHERE "public"."PkmVoid"."history_id" IN ($1,$2,$3,$4,$5) OFFSET $6
  */

  return await db.user.findFirst({
    where: {
      clerkId,
    },
    select: {
      pkm_history: {
        where: {
          is_current: true,
          model_type: {
            not: 'PkmTrash',
          },
        },
        select: {
          createdAt: true,
          history_id: true,
          model_id: true,
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
      },
    },
  })
}
