import { Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { historyModelTypeMap } from '../../apiUtils'
import { db } from '@/utils/db'
import { getSpaceDashboardForUser } from '~/repositories/PkmSpaceRepository'

export const getTransactionsForDuplicateSpace = async (
  eSpaceId: string,
  eSpaceName: string,
  eSpaceDescription: string,
  eSpaceContent: string,
  eStoreyId: string,
  nStoreyId: string,
  userId: string,
  newSpaceId?: string,
) => {
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  // nSpaceId isn't taken as an argument because it doesn't have children
  // Whereas duplicating a storey requires it as a parameter because it might be created by cloning its parent suite,
  //  or because it itself is being cloned
  const nSpaceId = newSpaceId ?? randomUUID()

  transactions.push(
    db.space.create({
      data: {
        user_id: userId,
        storey_id: nStoreyId,
        id: nSpaceId,
        name: eSpaceName,
        description: eSpaceDescription,
        content: eSpaceContent,
      },
    }),
  )

  const spaceHistory = await db.pkmHistory.findFirst({
    where: {
      suite_id: null,
      storey_id: null,
      space_id: eSpaceId,
      user_id: userId,
      is_current: true,
      model_type: 'SpaceContents',
    },
    select: {
      history_id: true,
    },
  })

  if (!spaceHistory) {
    // Not certain this will ever happen
    return transactions
  }

  const nHistoryId = randomUUID()
  transactions.push(
    db.pkmHistory.create({
      data: {
        history_id: nHistoryId,
        model_id: nSpaceId,
        model_type: 'SpaceContents',
        is_current: true,
        user_id: userId,
        suite_id: null,
        storey_id: null,
        space_id: nSpaceId,
      },
    }),
  )

  const contents = await db.pkmContents.findMany({
    where: {
      model_id: eSpaceId,
      history_id: spaceHistory.history_id,
    },
    select: {
      content: true,
      sort_order: true,
    },
  })

  for (const content of contents) {
    transactions.push(
      db.pkmContents.create({
        data: {
          content_id: randomUUID().toString(),
          model_id: nSpaceId,
          content: content.content,
          history_id: nHistoryId,
          sort_order: content.sort_order,
        },
      }),
    )
  }

  const images = await db.pkmImage.findMany({
    where: {
      model_id: eSpaceId,
      user_id: userId,
    },
    select: {
      model_id: true,
      name: true,
      size: true,
      type: true,
      s3_url: true,
      user_id: true,
    },
  })

  images.map((image) => {
    transactions.push(
      db.pkmImage.create({
        data: {
          model_id: nSpaceId,
          name: image.name,
          size: image.size,
          type: image.type,
          s3_url: image.s3_url,
          user_id: image.user_id,
        },
      }),
    )
  })

  const spaceDashboard = await getSpaceDashboardForUser({
    storeyId: eStoreyId,
    spaceId: eSpaceId,
    userId,
  })

  for (const historyItem of spaceDashboard?.pkm_history ?? []) {
    if (
      historyItem.model_type !== 'PkmEpiphany' &&
      historyItem.model_type !== 'PkmInbox' &&
      historyItem.model_type !== 'PkmPassingThought' &&
      historyItem.model_type !== 'PkmTodo' &&
      historyItem.model_type !== 'PkmTrash' &&
      historyItem.model_type !== 'PkmVoid'
    ) {
      return transactions
    }

    const item =
      historyItem.epiphany_item ??
      historyItem.inbox_item ??
      historyItem.passing_thought_item ??
      historyItem.todo_item ??
      historyItem.trash_item ??
      historyItem.void_item

    if (!item) {
      return transactions
    }

    const nModelId = randomUUID()
    const nHistoryId = randomUUID()

    const itemArgs: {
      content: string
      name: string
      summary: string
      model_id: string
      user_id: string
      void_at?: Date
    } = {
      content: item.content,
      name: item.name,
      summary: item.summary,
      model_id: nModelId,
      user_id: userId,
    }

    if (historyItem.model_type === 'PkmPassingThought') {
      itemArgs.void_at = new Date('9000-01-01 00:00:00')
    }

    transactions.push(
      db.pkmHistory.create({
        data: {
          history_id: nHistoryId,
          model_id: nModelId,
          model_type: historyItem.model_type,
          is_current: true,
          user_id: userId,
          suite_id: null,
          storey_id: nStoreyId,
          space_id: nSpaceId,
          [`${historyModelTypeMap[historyItem.model_type]}`]: {
            create: itemArgs,
          },
        },
      }),
    )

    const contents = await db.pkmContents.findMany({
      where: {
        model_id: historyItem.model_id,
        history_id: historyItem.history_id,
      },
      select: {
        content: true,
        sort_order: true,
      },
    })

    for (const content of contents) {
      transactions.push(
        db.pkmContents.create({
          data: {
            content_id: randomUUID().toString(),
            model_id: nModelId,
            content: content.content,
            history_id: nHistoryId,
            sort_order: content.sort_order,
          },
        }),
      )
    }

    const images = await db.pkmImage.findMany({
      where: {
        model_id: historyItem.model_id,
        user_id: userId,
      },
      select: {
        model_id: true,
        name: true,
        size: true,
        type: true,
        s3_url: true,
        user_id: true,
      },
    })

    images.map((image) => {
      transactions.push(
        db.pkmImage.create({
          data: {
            model_id: nModelId,
            name: image.name,
            size: image.size,
            type: image.type,
            s3_url: image.s3_url,
            user_id: image.user_id,
          },
        }),
      )
    })
  }

  return transactions
}
