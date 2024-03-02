import { db } from '@/utils/db'
import { randomUUID } from 'node:crypto'
import { User } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'

type CreateVoidArgs = {
  content: string
  userId: string
}

export type UpdateVoidArgs = CreateVoidArgs & {
  historyId: string
  modelId: string
}

// Get the current void item for the user
// Can add another method later if we ever need to grab the non-current one
export const getCurrentVoidItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const voidItemId = args.params.model_id

  if (!voidItemId) {
    return null
  }

  const voidItem = await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true,
      history_id: historyItemId,
      model_id: voidItemId,
    },
    select: {
      void_item: {
        select: {
          content: true,
          model_id: true,
          history_id: true,
        },
      },
    },
  })

  if (!voidItem || !voidItem.void_item) {
    return null
  }

  return voidItem.void_item
}

export const storeVoidItem = async ({ userId, content }: CreateVoidArgs) => {
  const modelId = randomUUID()

  return await db.pkmHistory
    .create({
      data: {
        user_id: userId,
        is_current: true,
        model_type: 'PkmVoid',
        model_id: modelId,
        void_item: {
          create: {
            content,
            model_id: modelId,
            user_id: userId,
          },
        },
      },
    })
    .then((voidItem) => {
      return {
        success: true,
        voidItem,
      }
    })
    .catch(() => {
      return {
        success: false,
        voidItem: null,
      }
    })
}

export const updateVoidItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateVoidArgs) => {
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
          model_type: 'PkmVoid',
          model_id: modelId,
          void_item: {
            create: {
              content,
              model_id: modelId,
              user_id: userId,
            },
          },
        },
      }),
    ])
    .then((voidItem) => {
      return {
        success: true,
        voidItem: voidItem[1],
      }
    })
    .catch(() => {
      return {
        success: false,
        voidItem: null,
      }
    })
}
