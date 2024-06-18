import { getUserAuth } from '@/utils/auth'
import { db } from '@/utils/db'
import { getTransactionsForDuplicateSpace } from '@/utils/duplicate/Space/duplicate'
import { getTransactionsForDuplicateStorey } from '@/utils/duplicate/Storey/duplicate'
import { getTransactionsForDuplicateSuite } from '@/utils/duplicate/Suite/duplicate'
import { Prisma } from '@prisma/client'
import { ActionFunctionArgs } from '@remix-run/node'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import {
  getSpaceForUser,
  getSpacesForUser,
} from '~/repositories/PkmSpaceRepository'
import {
  getStoreyForUser,
  getStoreysForUserBySuite,
} from '~/repositories/PkmStoreyRepository'
import { getSuiteForUser } from '~/repositories/PkmSuiteRepository'

export const suiteStoreySpaceDuplicateAction = async (
  actionArgs: ActionFunctionArgs,
) => {
  const user = await getUserAuth(actionArgs)
  if (!user) {
    return {
      errors: {
        fieldErrors: {
          general: 'User not found. Please log in again [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const { request } = actionArgs

  const formData = await request.formData()
  if (!formData) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report [2]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const eSuiteId = formData.get('suiteId')?.toString()
  const eStoreyId = formData.get('storeyId')?.toString()
  const eSpaceId = formData.get('spaceId')?.toString()

  if (!eSuiteId && !eStoreyId && !eSpaceId) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report [3]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  z.object({
    eSuiteId: z.string().optional(),
    eStoreyId: z.string().optional(),
    eSpaceId: z.string().optional(),
  })
    .strict()
    .parse({
      eSuiteId,
      eStoreyId,
      eSpaceId,
    })

  return await (eSuiteId && !eStoreyId
    ? duplicateSuite({ eSuiteId, userId: user.id })
    : eSuiteId && eStoreyId
      ? duplicateStorey({ eSuiteId, eStoreyId, userId: user.id })
      : eStoreyId && eSpaceId
        ? duplicateSpace({ eStoreyId, eSpaceId, userId: user.id })
        : null)
}

const duplicateSuite = async ({
  eSuiteId,
  userId,
}: {
  eSuiteId: string
  userId: string
}) => {
  const existingSuite = await getSuiteForUser({
    suiteId: eSuiteId,
    userId,
  })

  if (
    !existingSuite ||
    !existingSuite.id ||
    !existingSuite.name ||
    !existingSuite.description ||
    !existingSuite.content
  ) {
    return {
      errors: {
        fieldErrors: {
          general: 'Suite - Not Found [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  // Borrowing the type from prisma.$transaction
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const newSuiteId = randomUUID()

  const transactionsForDuplicateSuite = await getTransactionsForDuplicateSuite(
    `${existingSuite.name} (Duplicated)`,
    existingSuite.description,
    existingSuite.content,
    existingSuite.id,
    newSuiteId,
    userId,
  )

  transactions.push(...transactionsForDuplicateSuite)

  // An empty array here doesn't mean anything, but it does just mean we'll only duplicate the Suite and its Items
  const existingStoreys = await getStoreysForUserBySuite({
    userId,
    suiteId: eSuiteId,
  })

  for (const existingStorey of existingStoreys) {
    const newStoreyId = randomUUID()

    if (
      !existingStorey ||
      !existingStorey.id ||
      !existingStorey.name ||
      !existingStorey.description ||
      !existingStorey.content
    ) {
      continue
    }

    const transactionsForDuplicateSpace =
      await getTransactionsForDuplicateStorey(
        existingStorey.id,
        existingStorey.name,
        existingStorey.description,
        existingStorey.content,
        existingSuite.id,
        newSuiteId,
        newStoreyId,
        userId,
      )

    transactions.push(...transactionsForDuplicateSpace)

    const existingSpaces = await getSpacesForUser({
      userId,
      storeyId: existingStorey.id,
    })

    for (const existingSpace of existingSpaces) {
      if (
        !existingSpace ||
        !existingSpace.id ||
        !existingSpace.name ||
        !existingSpace.description ||
        !existingSpace.content
      ) {
        continue
      }

      const transactionsForDuplicateSpace =
        await getTransactionsForDuplicateSpace(
          existingSpace.id,
          existingSpace.name,
          existingSpace.description,
          existingSpace.content,
          existingStorey.id,
          newStoreyId,
          userId,
        )

      transactions.push(...transactionsForDuplicateSpace)
    }
  }

  if (transactions.length === 0) {
    return {
      errors: {
        fieldErrors: {
          general: 'Suite - Nothing to do [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const results = await db.$transaction(transactions)

  if (!results) {
    return {
      errors: {
        fieldErrors: {
          general: 'Suite - Failed [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  return {
    errors: null,
    success: true,
    redirect: `/suite/${newSuiteId}/config`,
  }
}

const duplicateStorey = async ({
  eSuiteId,
  eStoreyId,
  userId,
}: {
  eSuiteId: string
  eStoreyId: string
  userId: string
}) => {
  const existingStorey = await getStoreyForUser({
    suiteId: eSuiteId,
    storeyId: eStoreyId,
    userId,
  })

  if (
    !existingStorey ||
    !existingStorey.id ||
    !existingStorey.name ||
    !existingStorey.description ||
    !existingStorey.content
  ) {
    return {
      errors: {
        fieldErrors: {
          general: 'Storey - Not Found [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  // Borrowing the type from prisma.$transaction
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const newStoreyId = randomUUID()

  const transactionsForDuplicateSpace = await getTransactionsForDuplicateStorey(
    existingStorey.id,
    `${existingStorey.name} (Duplicated)`,
    existingStorey.description,
    existingStorey.content,
    eSuiteId,
    eSuiteId, // The Suites are the same here because it's being duplicated into the same Suite
    newStoreyId,
    userId,
  )

  transactions.push(...transactionsForDuplicateSpace)

  const existingSpaces = await getSpacesForUser({
    userId,
    storeyId: existingStorey.id,
  })

  for (const existingSpace of existingSpaces) {
    if (
      !existingSpace ||
      !existingSpace.id ||
      !existingSpace.name ||
      !existingSpace.description ||
      !existingSpace.content
    ) {
      continue
    }

    const transactionsForDuplicateSpace =
      await getTransactionsForDuplicateSpace(
        existingSpace.id,
        existingSpace.name,
        existingSpace.description,
        existingSpace.content,
        existingStorey.id,
        newStoreyId,
        userId,
      )

    transactions.push(...transactionsForDuplicateSpace)
  }

  if (transactions.length === 0) {
    return {
      errors: {
        fieldErrors: {
          general: 'Storey - Nothing to do [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const results = await db.$transaction(transactions)

  if (!results) {
    return {
      errors: {
        fieldErrors: {
          general: 'Storey - Failed [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  return {
    errors: null,
    success: true,
    redirect: `/suite/${eSuiteId}/storey/${newStoreyId}/config`,
  }
}

const duplicateSpace = async ({
  eStoreyId,
  eSpaceId,
  userId,
}: {
  eStoreyId: string
  eSpaceId: string
  userId: string
}) => {
  const existingSpace = await getSpaceForUser({
    storeyId: eStoreyId,
    spaceId: eSpaceId,
    userId,
  })

  if (
    !existingSpace ||
    !existingSpace.id ||
    !existingSpace.name ||
    !existingSpace.description ||
    !existingSpace.content
  ) {
    return {
      errors: {
        fieldErrors: {
          general: 'Space - Not Found [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  // Borrowing the type from prisma.$transaction
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const newSpaceId = randomUUID()

  const transactionsForDuplicateSpace = await getTransactionsForDuplicateSpace(
    existingSpace.id,
    `${existingSpace.name} (Duplicated)`,
    existingSpace.description,
    existingSpace.content,
    eStoreyId,
    eStoreyId, // The Storeys are the same here because it's being duplicated into the same Storey
    userId,
    newSpaceId,
  )

  transactions.push(...transactionsForDuplicateSpace)

  if (transactions.length === 0) {
    return {
      errors: {
        fieldErrors: {
          general: 'Space - Nothing to do [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const results = await db.$transaction(transactions)

  if (!results) {
    return {
      errors: {
        fieldErrors: {
          general: 'Space - Failed [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  return {
    errors: null,
    success: true,
    redirect: `/suite/${existingSpace.storey.suite.id}/storey/${eStoreyId}/space/${newSpaceId}/config`,
  }
}
