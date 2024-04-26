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

    const newModelId = randomUUID()

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
      model_id: newModelId,
      user_id: userId,
    }

    if (historyItem.model_type === 'PkmPassingThought') {
      itemArgs.void_at = new Date('9000-01-01 00:00:00')
    }

    transactions.push(
      db.pkmHistory.create({
        data: {
          model_id: newModelId,
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
            model_id: newModelId,
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
