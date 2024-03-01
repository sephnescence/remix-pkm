import { db } from '@/utils/db'
import { randomUUID } from 'node:crypto'
import { User } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'

type CreatePassingThoughtArgs = {
  content: string
  userId: string
}

export type UpdatePassingThoughtArgs = CreatePassingThoughtArgs & {
  historyId: string
  modelId: string
}

// Get the current passingThought item for the user
// Can add another method later if we ever need to grab the non-current one
export const getCurrentPassingThoughtItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const passingThoughtItemId = args.params.model_id

  if (!passingThoughtItemId) {
    return null
  }

  const passingThoughtItem = await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true,
      history_id: historyItemId,
      model_id: passingThoughtItemId,
    },
    select: {
      passing_thought_item: {
        select: {
          content: true,
          model_id: true,
          history_id: true,
          void_at: true,
        },
      },
    },
  })

  if (!passingThoughtItem || !passingThoughtItem.passing_thought_item) {
    return null
  }

  return passingThoughtItem.passing_thought_item
}

export const storePassingThoughtItem = async ({
  userId,
  content,
}: CreatePassingThoughtArgs) => {
  const modelId = randomUUID()

  const now = new Date()
  const voidAt = new Date(now.setMonth(now.getMonth() + 1))

  return await db.pkmHistory
    .create({
      data: {
        user_id: userId,
        is_current: true,
        model_type: 'PkmPassingThought',
        model_id: modelId,
        passing_thought_item: {
          create: {
            content,
            model_id: modelId,
            user_id: userId,
            void_at: voidAt,
          },
        },
      },
    })
    .then((passingThoughtItem) => {
      return {
        success: true,
        passingThoughtItem,
      }
    })
    .catch(() => {
      return {
        success: false,
        passingThoughtItem: null,
      }
    })
}

export const updatePassingThoughtItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdatePassingThoughtArgs) => {
  const now = new Date()
  const voidAt = new Date(now.setMonth(now.getMonth() + 1))

  return await db
    .$transaction([
      db.pkmHistory.update({
        where: {
          history_id: historyId,
          is_current: true,
        },
        data: {
          is_current: false,
        },
      }),
      db.pkmHistory.create({
        data: {
          user_id: userId,
          is_current: true,
          model_type: 'PkmPassingThought',
          model_id: modelId,
          passing_thought_item: {
            create: {
              content,
              model_id: modelId,
              user_id: userId,
              void_at: voidAt,
            },
          },
        },
      }),
    ])
    .then((passingThoughtItem) => {
      return {
        success: true,
        passingThoughtItem: passingThoughtItem[1],
      }
    })
    .catch(() => {
      return {
        success: false,
        passingThoughtItem: null,
      }
    })
}
