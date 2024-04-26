import { getClerkId, getUserAuth } from '@/utils/auth'
import { LoaderFunctionArgs, TypedResponse, redirect } from '@remix-run/node'
import { PkmTrashForDashboard } from '~/repositories/PkmHistoryRepository'
import { getCurrentTrashItemForUser } from '~/repositories/PkmTrashRepository'
import { getUserTrashByClerkId } from '~/repositories/PkmUserRepository'

export type TrashLoaderResponse = {
  content: string
  historyId: string
  modelId: string
}

type TrashInboxLoaderResponse =
  | PkmTrashForDashboard
  | TypedResponse<never>
  | null

export const trashIndexLoader = async (
  args: LoaderFunctionArgs,
): Promise<TrashInboxLoaderResponse> => {
  const clerkId = await getClerkId(args)
  if (!clerkId) {
    return redirect('/')
  }

  const user = await getUserTrashByClerkId(clerkId)

  if (!user) {
    return redirect('/')
  }

  // BTTODO - What do I need to do in order to fix this?
  return { trash: user.pkm_history }
}

export const trashLoader = async (
  args: LoaderFunctionArgs,
): Promise<TrashLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const todoItem = await getCurrentTrashItemForUser(args, user)
  if (todoItem === null) {
    return redirect('/')
  }

  return {
    content: todoItem.content,
    historyId: todoItem.history_id,
    modelId: todoItem.model_id,
  }
}
