/**
 * There's the opportunity for something thematic, like "Wreckers" and "Removalists"
 *
 * The first iteration of Wreckers will _immediately_ destroy data. In the future, the server will reassign ownership
 *  to uuid nil and then delete the data in the background
 *
 * Removalists can take some time checking for data that's referenced elsewhere to avoid orphaning anything, and can
 *  raise notices about Items they might like to Move instead. It will be more difficult with children Storeys or
 *  Spaces, as the server will have to perform a bulk update to move a lot of data across. When there are no more
 *  action items, the user can figuratively "sign off" on the removalists starting the process of draining the data
 *
 * Future additions could include giving the user a few days to change their mind. Or call in the Wreckers immediately
 *
 * Behind the scenes, there will be a service that removes data from external sources like AWS S3, and records in the
 *  database that no longer need to be there
 *
 * Here's a handy query to ensure all data is removed
 * select id, "createdAt", 'PkmContents' from "PkmContents" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select model_id as id, "createdAt", 'PkmEpiphany' from "PkmEpiphany" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select model_id as id, "createdAt", 'PkmInbox' from "PkmInbox" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select model_id as id, "createdAt", 'PkmPassingThought' from "PkmPassingThought" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select model_id as id, "createdAt", 'PkmTodo' from "PkmTodo" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select model_id as id, "createdAt", 'PkmTrash' from "PkmTrash" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select model_id as id, "createdAt", 'PkmVoid' from "PkmVoid" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select model_id as id, "createdAt", 'PkmImage' from "PkmImage" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select model_id as id, "createdAt", 'PkmHistory' from "PkmHistory" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select id, "createdAt", 'Space' from "Space" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select id, "createdAt", 'Storey' from "Storey" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 * union all
 * select id, "createdAt", 'Suite' from "Suite" where "createdAt" > '2024-07-07 09:00:00.000'::timestamptz
 */

import { db } from '@/utils/db'
import { Prisma } from '@prisma/client'
import {
  defaultSpaceId,
  defaultStoreyId,
  defaultSuiteId,
} from '~/repositories/PkmUserRepository'

export const wreckSuite = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}) => {
  if (suiteId === defaultSuiteId)
    return {
      success: false,
      error: 'Cannot wreck default Suite',
      redirect: '/',
    }

  const transactions: Prisma.PrismaPromise<unknown>[] =
    await getSuiteTransactions({
      suiteId,
      userId,
    })

  await db.$transaction(transactions)

  return {
    success: true,
    error: null,
    redirect: '/suites',
  }
}

export const wreckStorey = async ({
  suiteId,
  storeyId,
  userId,
}: {
  suiteId: string
  storeyId: string
  userId: string
}) => {
  if (storeyId === defaultStoreyId)
    return {
      success: false,
      error: 'Cannot wreck default Suite',
      redirect: '/',
    }

  const transactions: Prisma.PrismaPromise<unknown>[] =
    await getStoreyTransactions({
      suiteId,
      storeyId,
      userId,
    })

  await db.$transaction(transactions)

  return {
    success: true,
    error: null,
    redirect: `/suite/${suiteId}/dashboard?tab=storeys`,
  }
}

export const wreckSpace = async ({
  suiteId,
  storeyId,
  spaceId,
  userId,
}: {
  suiteId: string
  storeyId: string
  spaceId: string
  userId: string
}) => {
  if (spaceId === defaultSpaceId)
    return {
      success: false,
      error: 'Cannot wreck default Space',
      redirect: '/',
    }

  const transactions: Prisma.PrismaPromise<unknown>[] =
    await getSpaceTransactions({
      storeyId,
      spaceId,
      userId,
    })

  await db.$transaction(transactions)

  return {
    success: true,
    error: null,
    redirect: `/suite/${suiteId}/storey/${storeyId}/dashboard?tab=spaces`,
  }
}

const getSuiteTransactions = async ({
  suiteId,
  userId,
}: {
  suiteId: string
  userId: string
}) => {
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const existingSuite = await db.suite.findFirst({
    where: {
      id: suiteId,
      user_id: userId,
    },
    select: {
      id: true,
      storeys: {
        select: {
          id: true,
          spaces: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })

  if (!existingSuite) return transactions

  transactions.push(
    ...(await getChildItemTransactions({
      userId,
      suiteId,
      storeyId: null,
      spaceId: null,
    })),
    db.pkmContents.deleteMany({
      where: {
        model_id: suiteId,
      },
    }),
    db.pkmImage.deleteMany({
      where: {
        model_id: suiteId,
      },
    }),
    db.suite.delete({ where: { id: suiteId, user_id: userId } }),
  )

  return transactions
}

const getStoreyTransactions = async ({
  suiteId,
  storeyId,
  userId,
}: {
  suiteId: string
  storeyId: string
  userId: string
}) => {
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const existingStorey = await db.storey.findFirst({
    where: {
      suite_id: suiteId,
      id: storeyId,
      user_id: userId,
    },
    select: {
      id: true,
      spaces: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!existingStorey) return transactions

  transactions.push(
    ...(await getChildItemTransactions({
      userId,
      suiteId,
      storeyId,
      spaceId: null,
    })),
    db.pkmContents.deleteMany({
      where: {
        model_id: storeyId,
      },
    }),
    db.pkmImage.deleteMany({
      where: {
        model_id: storeyId,
      },
    }),
    db.storey.delete({ where: { id: storeyId, user_id: userId } }),
  )

  return transactions
}

const getSpaceTransactions = async ({
  storeyId,
  spaceId,
  userId,
}: {
  storeyId: string
  spaceId: string
  userId: string
}) => {
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const existingSpace = await db.space.findFirst({
    where: {
      id: spaceId,
      storey_id: storeyId,
      user_id: userId,
    },
    select: {
      id: true,
    },
  })

  if (!existingSpace) return transactions

  transactions.push(
    ...(await getChildItemTransactions({
      userId,
      suiteId: null,
      storeyId,
      spaceId,
    })),
    db.pkmContents.deleteMany({
      where: {
        model_id: spaceId,
      },
    }),
    db.pkmImage.deleteMany({
      where: {
        model_id: spaceId,
      },
    }),
    db.space.delete({ where: { id: spaceId, user_id: userId } }),
  )

  return transactions
}

const getChildItemTransactions = async ({
  userId,
  suiteId,
  storeyId,
  spaceId,
}: {
  userId: string
  suiteId: string | null
  storeyId: string | null
  spaceId: string | null
}) => {
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const childModelIds = await db.pkmHistory
    .findMany({
      where: {
        suite_id: suiteId,
        storey_id: storeyId,
        space_id: spaceId,
        user_id: userId,
      },
      select: {
        model_id: true,
      },
    })
    .then((childModels) => childModels.map((childModel) => childModel.model_id))

  const itemWhere = {
    where: {
      model_id: {
        in: childModelIds,
      },
    },
  }

  transactions.push(
    db.pkmContents.deleteMany(itemWhere),
    db.pkmImage.deleteMany(itemWhere),
    db.pkmEpiphany.deleteMany(itemWhere),
    db.pkmInbox.deleteMany(itemWhere),
    db.pkmPassingThought.deleteMany(itemWhere),
    db.pkmTodo.deleteMany(itemWhere),
    db.pkmTrash.deleteMany(itemWhere),
    db.pkmVoid.deleteMany(itemWhere),
  )

  return transactions
}
