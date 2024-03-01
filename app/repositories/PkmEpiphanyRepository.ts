import { db } from '@/utils/db'
import { randomUUID } from 'node:crypto'
import { User } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'

type CreateEpiphanyArgs = {
  content: string
  userId: string
}

export type UpdateEpiphanyArgs = CreateEpiphanyArgs & {
  historyId: string
  modelId: string
}

// Get the current epiphany item for the user
// Can add another method later if we ever need to grab the non-current one
export const getCurrentEpiphanyItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const epiphanyItemId = args.params.model_id

  if (!epiphanyItemId) {
    return null
  }

  const epiphanyItem = await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true,
      history_id: historyItemId,
      model_id: epiphanyItemId,
    },
    select: {
      epiphany_item: {
        select: {
          content: true,
          model_id: true,
          history_id: true,
        },
      },
    },
  })

  if (!epiphanyItem || !epiphanyItem.epiphany_item) {
    return null
  }

  return epiphanyItem.epiphany_item
}

export const storeEpiphanyItem = async ({
  userId,
  content,
}: CreateEpiphanyArgs) => {
  const modelId = randomUUID()

  return await db.pkmHistory
    .create({
      data: {
        user_id: userId,
        is_current: true,
        model_type: 'PkmEpiphany',
        model_id: modelId,
        epiphany_item: {
          create: {
            content,
            model_id: modelId,
            user_id: userId,
          },
        },
      },
    })
    .then((epiphanyItem) => {
      return {
        success: true,
        epiphanyItem,
      }
    })
    .catch(() => {
      return {
        success: false,
        epiphanyItem: null,
      }
    })
}

export const updateEpiphanyItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateEpiphanyArgs) => {
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
          model_type: 'PkmEpiphany',
          model_id: modelId,
          epiphany_item: {
            create: {
              content,
              model_id: modelId,
              user_id: userId,
            },
          },
        },
      }),
    ])
    .then((epiphanyItem) => {
      return {
        success: true,
        epiphanyItem: epiphanyItem[1],
      }
    })
    .catch(() => {
      return {
        success: false,
        epiphanyItem: null,
      }
    })
}
