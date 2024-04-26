import { modelTypeMap } from '@/utils/apiUtils'
import { getUserAuth } from '@/utils/auth'
import {
  ConformArrayArgsToObjectResponse,
  conformArrayArgsToObject,
} from '@/utils/url'
import { LoaderFunctionArgs, TypedResponse, redirect } from '@remix-run/node'
import { getCurrentHistoryItemForUser } from '~/repositories/PkmHistoryRepository'
import { getImagesForItem } from '~/repositories/PkmImageRepository'

export type ItemLoaderResponse = {
  args: ConformArrayArgsToObjectResponse
  history: Awaited<ReturnType<typeof getCurrentHistoryItemForUser>>
  images: {
    image_id: string
    name: string
    s3_url: string
  }[]
  item: {
    name: string
    content: string
    summary: string
  }
}

export const itemLoader = async (
  loaderArgs: LoaderFunctionArgs,
): Promise<ItemLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(loaderArgs)
  if (!user) return redirect('/')

  const params = loaderArgs.params['*']
  if (!params) {
    return redirect('/')
  }

  const args = await conformArrayArgsToObject(params.split('/'))
  if (!args) return redirect('/')

  if (args.exception) {
    return redirect('/')
  }

  if (
    !args.apiDuplicateUrl ||
    !args.apiEditUrl ||
    !args.conformedArgs ||
    !args.feAlwaysLatestUrl ||
    !args.feEditUrl ||
    !args.feMoveUrl ||
    !args.feParentUrl ||
    !args.fePermalinkUrl ||
    !args.feViewUrl ||
    !args.itemLocation ||
    !args.itemLocationName
  ) {
    return redirect('/')
  }

  const { suiteId, storeyId, spaceId } = args.itemLocation

  const history = await getCurrentHistoryItemForUser({
    suiteId: suiteId,
    storeyId: storeyId,
    spaceId: spaceId,
    modelId: args.conformedArgs.eModelId,
    historyId: args.conformedArgs.eHistoryId,
    userId: user.id,
  })

  if (
    !history ||
    !history.historyItem ||
    !history.historyItem.history_id ||
    history.historyItem.model_type !==
      'Pkm' + modelTypeMap[args.conformedArgs.eModelType]
  ) {
    return redirect('/')
  }

  const item =
    history.historyItem.epiphany_item ??
    history.historyItem.inbox_item ??
    history.historyItem.passing_thought_item ??
    history.historyItem.todo_item ??
    history.historyItem.trash_item ??
    history.historyItem.void_item

  if (!item) {
    return redirect('/')
  }

  const images = await getImagesForItem({
    modelId: args.conformedArgs.eModelId,
    userId: user.id,
  })

  return {
    args,
    history,
    images,
    item,
  }
}
