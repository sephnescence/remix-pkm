import { db } from '@/utils/db'
import { User } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'

export type MoveToTrashArgs = {
  content: string
  historyId: string
  modelId: string
  userId: string
}

// Get the current trash item for the user
// Can add another method later if we ever need to grab the non-current one
export const getCurrentTrashItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const trashItemId = args.params.model_id

  if (!trashItemId) {
    return null
  }

  const trashItem = await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true,
      history_id: historyItemId,
      model_id: trashItemId,
    },
    select: {
      trash_item: {
        select: {
          content: true,
          model_id: true,
          history_id: true,
        },
      },
    },
  })

  if (!trashItem || !trashItem.trash_item) {
    return null
  }

  return trashItem.trash_item
}

export const moveItemToTrash = async ({
  content,
  historyId,
  modelId,
  userId,
}: MoveToTrashArgs) => {
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
          model_type: 'PkmTrash',
          model_id: modelId,
          trash_item: {
            create: {
              content,
              model_id: modelId,
              user_id: userId,
            },
          },
        },
      }),
    ])
    .then((trashItem) => {
      return {
        success: true,
        trashItem: trashItem[1],
      }
    })
    .catch(() => {
      return {
        success: false,
        trashItem: null,
      }
    })
}
