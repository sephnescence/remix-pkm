import { Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { historyModelTypeMap } from '../../apiUtils'
import { getStoreyDashboardForUser } from '~/repositories/PkmStoreyRepository'
import { db } from '@/utils/db'

export const getTransactionsForDuplicateStorey = async (
  eStoreyId: string,
  eStoreyName: string,
  eStoreyDescription: string,
  eStoreyContent: string,
  eSuiteId: string,
  nSuiteId: string,
  nStoreyId: string,
  userId: string,
) => {
  const transactions: Prisma.PrismaPromise<unknown>[] = []

  transactions.push(
    db.storey.create({
      data: {
        user_id: userId,
        suite_id: nSuiteId,
        id: nStoreyId,
        name: eStoreyName,
        description: eStoreyDescription,
        content: eStoreyContent,
      },
    }),
  )

  const storeyDashboard = await getStoreyDashboardForUser({
    suiteId: eSuiteId,
    storeyId: eStoreyId,
    userId,
  })

  for (const historyItem of storeyDashboard?.pkm_history ?? []) {
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
          suite_id: nSuiteId,
          storey_id: nStoreyId,
          space_id: null,
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
