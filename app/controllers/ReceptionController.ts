import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getClerkId } from '@/utils/auth'
import { sessionStorage } from '~/session/session.server'
import { db } from '@/utils/db'
import { Prisma } from '@prisma/client'

const newSuiteId = 'cfe57969-cf72-4b9d-a57d-8dafbd3690c2'
const newStoreyId = '6294a0e5-ddff-49c6-b6b9-0d102808f770'
const newSpaceId = 'daa94ddd-a090-488f-a3fb-caad7249bb0c'

export const receptionLoader = async (args: LoaderFunctionArgs) => {
  const clerkId = await getClerkId(args)
  if (!clerkId) return redirect('/')

  const cookieSession = await sessionStorage.getSession(
    args.request.headers.get('cookie'),
  )

  const userId = cookieSession.get('userId')

  if (!userId) return redirect('/')

  const user = await db.user.findFirst({
    where: {
      clerkId,
    },
    select: {
      id: true, // BTTODO - Remove
      suite_id: true,
      storey_id: true,
      space_id: true,
    },
  })

  if (!user) return redirect('/')

  if (user.suite_id && user.storey_id && user.space_id) {
    return redirect(
      `/suite/${user.suite_id}/storey/${user.storey_id}/space/${user.space_id}/dashboard?tab=content`,
    )
  }

  try {
    const transactions: Prisma.PrismaPromise<unknown>[] = []

    await getSuiteTransactions({
      userId,
    }).then((suiteTransactions) => {
      if (suiteTransactions)
        suiteTransactions.forEach((transaction) =>
          transactions.push(transaction),
        )
    })

    await getStoreyTransactions({
      userId,
    }).then((storeyTransactions) => {
      if (storeyTransactions)
        storeyTransactions.forEach((transaction) =>
          transactions.push(transaction),
        )
    })

    await getSpaceTransactions({
      userId,
    }).then((spaceTransactions) => {
      if (spaceTransactions)
        spaceTransactions.forEach((transaction) =>
          transactions.push(transaction),
        )
    })

    await db.$transaction(transactions)

    return redirect(
      `/suite/${newSuiteId}/storey/${newStoreyId}/space/${newStoreyId}/dashboard?tab=content`,
    )
  } catch (e) {
    return redirect(
      `/suite/${userId}/storey/${userId}/space/${userId}/dashboard?tab=content`,
    )
  }
}

const getSuiteTransactions = async ({ userId }: { userId: string }) => {
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const suiteExistsWithIdMatchingUserId = await db.suite.findFirst({
    where: {
      id: userId,
      user_id: userId,
    },
    select: {
      id: true,
    },
  })

  if (suiteExistsWithIdMatchingUserId !== null) {
    transactions.push(
      db.user.update({
        where: {
          id: userId,
        },
        data: {
          suite_id: newSuiteId,
        },
      }),
    )

    transactions.push(
      db.suite.update({
        where: {
          id: userId,
          user_id: userId,
        },
        data: {
          id: newSuiteId,
        },
      }),
    )

    const suiteHistory = await db.pkmHistory.findMany({
      where: {
        suite_id: userId,
        storey_id: null,
        space_id: null,
        user_id: userId,
      },
      select: {
        history_id: true,
      },
    })

    if (suiteHistory.length > 0) {
      suiteHistory.forEach(({ history_id }) => {
        transactions.push(
          db.pkmContents.updateMany({
            where: {
              model_id: userId,
              history_id,
            },
            data: {
              model_id: newSuiteId,
            },
          }),
        )
      })

      transactions.push(
        db.pkmHistory.updateMany({
          where: {
            suite_id: userId,
            storey_id: null,
            space_id: null,
            user_id: userId,
          },
          data: {
            suite_id: newSuiteId,
          },
        }),
      )
    }

    transactions.push(
      db.storey.updateMany({
        where: {
          suite_id: userId,
        },
        data: {
          suite_id: newSuiteId,
        },
      }),
    )

    return transactions
  }
}

const getStoreyTransactions = async ({ userId }: { userId: string }) => {
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const storeyExistsWithIdMatchingUserId = await db.storey.findFirst({
    where: {
      id: userId,
      user_id: userId,
    },
    select: {
      id: true,
    },
  })

  if (storeyExistsWithIdMatchingUserId !== null) {
    transactions.push(
      db.user.update({
        where: {
          id: userId,
        },
        data: {
          storey_id: newStoreyId,
        },
      }),
    )

    transactions.push(
      db.storey.update({
        where: {
          id: userId,
          user_id: userId,
        },
        data: {
          id: newStoreyId,
        },
      }),
    )

    const storeyHistory = await db.pkmHistory.findMany({
      where: {
        suite_id: null,
        storey_id: userId,
        space_id: null,
        user_id: userId,
      },
      select: {
        history_id: true,
      },
    })

    if (storeyHistory.length > 0) {
      storeyHistory.forEach(({ history_id }) => {
        transactions.push(
          db.pkmContents.updateMany({
            where: {
              model_id: userId,
              history_id,
            },
            data: {
              model_id: newStoreyId,
            },
          }),
        )
      })

      transactions.push(
        db.pkmHistory.updateMany({
          where: {
            suite_id: null,
            storey_id: userId,
            space_id: null,
            user_id: userId,
          },
          data: {
            storey_id: newStoreyId,
          },
        }),
      )
    }

    transactions.push(
      db.space.updateMany({
        where: {
          storey_id: userId,
        },
        data: {
          storey_id: newStoreyId,
        },
      }),
    )

    return transactions
  }
}

const getSpaceTransactions = async ({ userId }: { userId: string }) => {
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const spaceExistsWithIdMatchingUserId = await db.space.findFirst({
    where: {
      id: userId,
      storey_id: userId,
      user_id: userId,
    },
    select: {
      id: true,
    },
  })

  if (spaceExistsWithIdMatchingUserId !== null) {
    transactions.push(
      db.user.update({
        where: {
          id: userId,
        },
        data: {
          space_id: newSpaceId,
        },
      }),
    )

    transactions.push(
      db.space.update({
        where: {
          id: userId,
          user_id: userId,
        },
        data: {
          id: newSpaceId,
        },
      }),
    )

    const spaceHistory = await db.pkmHistory.findMany({
      where: {
        suite_id: null,
        storey_id: null,
        space_id: userId,
        user_id: userId,
      },
      select: {
        history_id: true,
      },
    })

    if (spaceHistory.length > 0) {
      spaceHistory.forEach(({ history_id }) => {
        transactions.push(
          db.pkmContents.updateMany({
            where: {
              model_id: userId,
              history_id,
            },
            data: {
              model_id: newSpaceId,
            },
          }),
        )
      })

      transactions.push(
        db.pkmHistory.updateMany({
          where: {
            suite_id: null,
            storey_id: null,
            space_id: userId,
            user_id: userId,
          },
          data: {
            space_id: newSpaceId,
          },
        }),
      )
    }

    return transactions
  }
}
