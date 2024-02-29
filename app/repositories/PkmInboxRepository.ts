import { db } from '@/utils/db'
import { randomUUID } from 'node:crypto'
import { User } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'

type CreateInboxArgs = {
  content: string
  userId: string
}

type UpdateInboxArgs = CreateInboxArgs & {
  historyId: string
  modelId: string
}

// Get the current inbox item for the user
// Can add another method later if we ever need to grab the non-current one
export const getCurrentInboxItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const inboxItemId = args.params.model_id

  if (!inboxItemId) {
    return null
  }

  const inboxItem = await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true,
      history_id: historyItemId,
      model_id: inboxItemId,
    },
    select: {
      inbox_item: {
        select: {
          content: true,
          model_id: true,
          history_id: true,
        },
      },
    },
  })

  if (!inboxItem || !inboxItem.inbox_item) {
    return null
  }

  return inboxItem.inbox_item
}

export const storeInboxItem = async ({ userId, content }: CreateInboxArgs) => {
  const modelId = randomUUID()

  return await db.pkmHistory
    .create({
      data: {
        user_id: userId,
        is_current: true,
        model_type: 'PkmInbox',
        model_id: modelId,
        inbox_item: {
          create: {
            content,
            model_id: modelId,
            user_id: userId,
          },
        },
      },
    })
    .then((inboxItem) => {
      return {
        success: true,
        inboxItem,
      }
    })
    .catch(() => {
      return {
        success: false,
        inboxItem: null,
      }
    })
}

export const updateInboxItem = async ({
  content,
  historyId,
  modelId,
  userId,
}: UpdateInboxArgs) => {
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
          model_type: 'PkmInbox',
          model_id: modelId,
          inbox_item: {
            create: {
              content,
              model_id: modelId,
              user_id: userId,
            },
          },
        },
      }),
    ])
    .then((inboxItem) => {
      return {
        success: true,
        inboxItem: inboxItem[1],
      }
    })
    .catch(() => {
      return {
        success: false,
        inboxItem: null,
      }
    })
}
