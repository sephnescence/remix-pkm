import { db } from '@/utils/db'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import {
  FIXED_NEW_MULTI_CONTENT_ID,
  PkmContentInput,
} from '~/repositories/PkmContentRepository'

export const determineSyncContentsTransactionsByFormData = ({
  formData,
  modeId,
  historyId,
  modelType,
}: {
  formData: FormData
  modeId: string
  historyId: string
  modelType: string
}): Prisma.PrismaPromise<unknown>[] => {
  const incomingContents = []
  let pkmContentsSortOrder = 1

  const keys = [...formData.keys()]
  for (const key of keys) {
    if (key.indexOf('multi_contents') !== 0) {
      continue
    }

    const [id, strSortOrder, status] = key.substring(16).split('__')

    try {
      z.object({
        id: z.string().uuid(),
        strSortOrder: z.string(),
        status: z.enum(['new', 'discarded', 'updated', 'existing', 'deleted']),
      })
        .strict()
        .parse({ id, strSortOrder, status })
    } catch (e) {
      console.error(
        `Failed to store ${modelType} - Failed to parse incoming content`,
      )
      console.error(e)
      throw new Error(`Failed to store ${modelType}. Please try again.`)
    }

    const content = formData.get(key)
    const sortOrder = parseInt(strSortOrder)

    incomingContents.push({
      id: id === FIXED_NEW_MULTI_CONTENT_ID ? crypto.randomUUID() : id,
      content,
      sortOrder,
      status,
    })
  }

  incomingContents.sort((a, b) => a.sortOrder - b.sortOrder)

  const transactions: Prisma.PrismaPromise<unknown>[] = []

  incomingContents.forEach((incomingContent) => {
    // Check status
    if (
      incomingContent.status === 'deleted' ||
      incomingContent.status === 'discarded'
    ) {
      return
    }

    transactions.push(
      db.pkmContents.create({
        data: {
          content_id: incomingContent.id,
          model_id: modeId,
          history_id: historyId,
          sort_order: pkmContentsSortOrder++, // Ignore the sort order from the frontend. It can have gaps
          content: incomingContent.content
            ? incomingContent.content.toString()
            : '',
        },
      }),
    )
  })

  return transactions
}

export const determineSyncContentsTransactions = ({
  contents,
}: {
  contents: PkmContentInput[]
}) => {
  // PkmContentInput should have an item called "status" added to it. The frontend does know if something
  //    has been updated, is new, or has had no change
  // PkmContentInput should have an item called "summarises_pkm_content_id" added to it. See
  //     "progressive summarisation" below
  // PkmContentInput should have an item called "summarised_by_pkm_content_id" added to it. See
  //     "progressive summarisation" below

  // Updating an item will generally result in the creation of new PkmContents rows, (including all summarisations) as
  //    as the history_id changes. There could a future optimisation to minimise wasteful data storage

  // In the future, I will offer "progressive summarisation" as outlined in "Building a Second Brain" by Tiago
  //  Forte, where a new PkmContent will reference the PkmContent it's summarising with (parent_content_id), and the
  //  PkmContent that's being summarised will reference which PkmContent is summarising it
  return contents.map((content) => {
    return {
      outcome: 'Create',
      queryDescription: `Create pkmContents - ${content.id}`,
      query: db.pkmContents.create({
        data: {
          content_id: content.id,
          model_id: content.modelId,
          history_id: content.historyId,
          sort_order: content.sortOrder,
          content: content.content,
        },
      }),
    }
  })
}
