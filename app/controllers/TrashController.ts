import { getUserAuth } from '@/utils/auth'
import { LoaderFunctionArgs, TypedResponse, redirect } from '@remix-run/node'
import { getCurrentTrashItemForUser } from '~/repositories/PkmTrashRepository'

export type TrashLoaderResponse = {
  content: string
  historyId: string
  modelId: string
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
