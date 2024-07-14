import { ZodError, z } from 'zod'
import { feModelTypeMap, parseParams } from './apiUtils'
import { getNewItemSuiteStoreyAndSpaceIds } from './create'

export type ConformArrayArgsToObjectResponse = {
  exception: null
  apiDuplicateUrl: string
  apiEditUrl: string
  feAlwaysLatestUrl: string
  feEditUrl: string
  feMoveUrl: string
  feParentUrl: string
  fePermalinkUrl: string
  feViewUrl: string
  itemLocationName: string
  conformedArgs: ReturnType<typeof conformItemArgs>
  itemLocation: {
    suiteId: string
    storeyId: string
    spaceId: string
  }
}

export type ConformArrayArgsToObjectForItemCreateResponse = {
  apiCreateUrl: string
  conformedArgs: ReturnType<typeof conformItemArgsForItemCreate>
  exception: null
  feParentUrl: string
  itemLocationName: string
  itemLocation: {
    suiteId: string
    spaceId: string
    storeyId: string
  }
  pageTitle: string
}

export type ConformArrayArgsToObjectNullResponse = {
  exception: string
  apiDuplicateUrl: null
  apiEditUrl: null
  feAlwaysLatestUrl: null
  feEditUrl: null
  feMoveUrl: null
  feParentUrl: null
  fePermalinkUrl: null
  feViewUrl: null
  itemLocationName: null
  conformedArgs: null
  itemLocation: null
}

export type ConformArrayArgsToObjectForItemNullResponse = {
  exception: string
  conformedArgs: null
  feCreateUrl: null
  feParentUrl: null
}

/*
  Expected exceptions:
  - Zod not being able to format the incoming array, as strict is enabled
  - getNewItemSuiteStoreyAndSpaceIds not being able to determine a relevant Suite, Storey, or Space ID
*/
export const conformArrayArgsToObject = async (
  params: string[],
): Promise<
  ConformArrayArgsToObjectResponse | ConformArrayArgsToObjectNullResponse
> => {
  const tempArgs = await Promise.resolve(parseParams(params))

  let conformedArgs = null
  try {
    conformedArgs = conformItemArgs({ tempArgs })
  } catch (e: unknown) {
    let exception = 'Unknown Exception'
    if (e instanceof Error) {
      exception = e.message || 'No message provided'
    }
    if (e instanceof ZodError) {
      exception = e.issues
        .map((issue) => `${issue.path} - ${issue.message}`)
        .join(', ')
    }

    return {
      ...emptyReturn,
      exception,
    } as ConformArrayArgsToObjectNullResponse
  }

  let searchSuiteId = null
  let searchStoreyId = null
  let searchSpaceId = null

  try {
    const search = getNewItemSuiteStoreyAndSpaceIds({
      eSuiteId: conformedArgs.eSuiteId ?? null,
      eStoreyId: conformedArgs.eStoreyId ?? null,
      eSpaceId: conformedArgs.eSpaceId ?? null,
    })

    searchSuiteId = search.suiteId
    searchStoreyId = search.storeyId
    searchSpaceId = search.spaceId
  } catch (e) {
    let exception = 'Failed to get search location'
    if (e instanceof Error) {
      exception = e.message
    }

    return {
      ...emptyReturn,
      exception,
    } as ConformArrayArgsToObjectNullResponse
  }

  return {
    apiDuplicateUrl:
      searchStoreyId === null
        ? `/api/history/item/duplicate/eSuiteId/${conformedArgs.eSuiteId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}/nSuiteId/${conformedArgs.eSuiteId}`
        : searchSpaceId === null
          ? `/api/history/item/duplicate/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}/nSuiteId/${conformedArgs.eSuiteId}/nStoreyId/${conformedArgs.eStoreyId}`
          : `/api/history/item/duplicate/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eSpaceId/${conformedArgs.eSpaceId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}/nStoreyId/${conformedArgs.eStoreyId}/nSpaceId/${conformedArgs.eSpaceId}`,
    apiEditUrl:
      searchStoreyId === null
        ? `/api/history/item/edit/eSuiteId/${conformedArgs.eSuiteId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`
        : searchSpaceId === null
          ? `/api/history/item/edit/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`
          : `/api/history/item/edit/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eSpaceId/${conformedArgs.eSpaceId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`,
    conformedArgs,
    exception: null,
    feAlwaysLatestUrl:
      searchStoreyId === null
        ? `/content/view/suiteId/${conformedArgs.eSuiteId}/modelId/${conformedArgs.eModelId}`
        : searchSpaceId === null
          ? `/content/view/suiteId/${conformedArgs.eSuiteId}/storeyId/${conformedArgs.eStoreyId}/modelId/${conformedArgs.eModelId}`
          : `/content/view/storeyId/${conformedArgs.eStoreyId}/spaceId/${conformedArgs.eSpaceId}/modelId/${conformedArgs.eModelId}`,
    feEditUrl:
      searchStoreyId === null
        ? `/item/edit/eSuiteId/${conformedArgs.eSuiteId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`
        : searchSpaceId === null
          ? `/item/edit/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`
          : `/item/edit/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eSpaceId/${conformedArgs.eSpaceId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`,
    feMoveUrl:
      searchStoreyId === null
        ? `/item/move/eSuiteId/${conformedArgs.eSuiteId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`
        : searchSpaceId === null
          ? `/item/move/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`
          : `/item/move/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eSpaceId/${conformedArgs.eSpaceId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`,
    feParentUrl:
      searchStoreyId === null
        ? `/suite/${conformedArgs.eSuiteId}/dashboard?tab=${conformedArgs.eModelType}`
        : searchSpaceId === null
          ? `/suite/${conformedArgs.eSuiteId}/storey/${conformedArgs.eStoreyId}/dashboard?tab=${conformedArgs.eModelType}`
          : `/suite/${conformedArgs.eSuiteId}/storey/${conformedArgs.eStoreyId}/space/${conformedArgs.eSpaceId}/dashboard?tab=${conformedArgs.eModelType}`,
    fePermalinkUrl:
      searchStoreyId === null
        ? `/content/view/suiteId/${conformedArgs.eSuiteId}/modelId/${conformedArgs.eModelId}/historyId/${conformedArgs.eHistoryId}`
        : searchSpaceId === null
          ? `/content/view/suiteId/${conformedArgs.eSuiteId}/storeyId/${conformedArgs.eStoreyId}/modelId/${conformedArgs.eModelId}/historyId/${conformedArgs.eHistoryId}`
          : `/content/view/storeyId/${conformedArgs.eStoreyId}/spaceId/${conformedArgs.eSpaceId}/modelId/${conformedArgs.eModelId}/historyId/${conformedArgs.eHistoryId}`,
    feViewUrl:
      searchStoreyId === null
        ? `/item/view/eSuiteId/${conformedArgs.eSuiteId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`
        : searchSpaceId === null
          ? `/item/view/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`
          : `/item/view/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eSpaceId/${conformedArgs.eSpaceId}/eModelType/${conformedArgs.eModelType}/eModelId/${conformedArgs.eModelId}/eHistoryId/${conformedArgs.eHistoryId}`,
    itemLocation: {
      suiteId: searchSuiteId,
      storeyId: searchStoreyId,
      spaceId: searchSpaceId,
    },
    itemLocationName:
      searchStoreyId === null
        ? 'Suite'
        : searchSpaceId === null
          ? 'Storey'
          : 'Space',
  } as ConformArrayArgsToObjectResponse
}

const conformItemArgs = ({
  tempArgs,
}: {
  tempArgs: {
    [key: string]: string
  }
}) => {
  return z
    .object({
      eSuiteId: z.string().optional(),
      eStoreyId: z.string().optional(),
      eSpaceId: z.string().optional(),
      eModelType: z.enum([
        'epiphany',
        'inbox',
        'passing-thought',
        'todo',
        'trash',
        'void',
      ]),
      eModelId: z.string(),
      eHistoryId: z.string(),
      nSuiteId: z.string().optional(),
      nStoreyId: z.string().optional(),
      nSpaceId: z.string().optional(),
      nModelType: z
        .enum(['epiphany', 'inbox', 'passing-thought', 'todo', 'trash', 'void'])
        .optional(),
    })
    .strict()
    .parse(tempArgs)
}

const conformItemArgsForItemCreate = ({
  tempArgs,
}: {
  tempArgs: {
    [key: string]: string
  }
}) => {
  return z
    .object({
      eSuiteId: z.string().uuid().optional(),
      eStoreyId: z.string().uuid().optional(),
      eSpaceId: z.string().uuid().optional(),
      nModelType: z.enum([
        'epiphany',
        'inbox',
        'passing-thought',
        'todo',
        'trash',
        'void',
      ]),
    })
    .strict()
    .parse(tempArgs)
}

const emptyReturn = {
  apiDuplicateUrl: null,
  apiEditUrl: null,
  conformedArgs: null,
  feAlwaysLatestUrl: null,
  feEditUrl: null,
  feMoveUrl: null,
  feParentUrl: null,
  fePermalinkUrl: null,
  feViewUrl: null,
  itemLocation: null,
  itemLocationName: null,
}

export const conformArrayArgsToObjectForItemCreate = async (
  params: string[],
): Promise<
  | ConformArrayArgsToObjectForItemCreateResponse
  | ConformArrayArgsToObjectForItemNullResponse
> => {
  const tempArgs = await Promise.resolve(parseParams(params))

  let conformedArgs = null
  try {
    conformedArgs = conformItemArgsForItemCreate({ tempArgs })
  } catch (e: unknown) {
    let exception = 'Unknown Exception'
    if (e instanceof Error) {
      exception = e.message || 'No message provided'
    }
    if (e instanceof ZodError) {
      exception = e.format().toString() // BTTODO - Not 100% sure this will be a well formatted string
    }

    return {
      exception,
      conformedArgs: null,
      feCreateUrl: null,
      feParentUrl: null,
    } as ConformArrayArgsToObjectForItemNullResponse
  }

  let searchSuiteId = null
  let searchStoreyId = null
  let searchSpaceId = null

  // Same rules apply with n variables
  try {
    const search = getNewItemSuiteStoreyAndSpaceIds({
      eSuiteId: conformedArgs.eSuiteId ?? null,
      eStoreyId: conformedArgs.eStoreyId ?? null,
      eSpaceId: conformedArgs.eSpaceId ?? null,
    })

    searchSuiteId = search.suiteId
    searchStoreyId = search.storeyId
    searchSpaceId = search.spaceId
  } catch (e) {
    let exception = 'Failed to get search location'
    if (e instanceof Error) {
      exception = e.message
    }

    return {
      exception,
    } as ConformArrayArgsToObjectForItemNullResponse
  }

  return {
    conformedArgs,
    exception: null,
    apiCreateUrl:
      searchStoreyId === null
        ? `/api/history/item/create/eSuiteId/${conformedArgs.eSuiteId}/nModelType/${conformedArgs.nModelType}`
        : searchSpaceId === null
          ? `/api/history/item/create/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/nModelType/${conformedArgs.nModelType}`
          : `/api/history/item/create/eSuiteId/${conformedArgs.eSuiteId}/eStoreyId/${conformedArgs.eStoreyId}/eSpaceId/${conformedArgs.eSpaceId}/nModelType/${conformedArgs.nModelType}`,
    feParentUrl:
      searchStoreyId === null
        ? `/suite/${conformedArgs.eSuiteId}/dashboard?tab=${conformedArgs.nModelType}`
        : searchSpaceId === null
          ? `/suite/${conformedArgs.eSuiteId}/storey/${conformedArgs.eStoreyId}/dashboard?tab=${conformedArgs.nModelType}`
          : `/suite/${conformedArgs.eSuiteId}/storey/${conformedArgs.eStoreyId}/space/${conformedArgs.eSpaceId}/dashboard?tab=${conformedArgs.nModelType}`,
    itemLocation: {
      suiteId: searchSuiteId,
      storeyId: searchStoreyId,
      spaceId: searchSpaceId,
    },
    itemLocationName:
      searchStoreyId === null
        ? 'Suite'
        : searchSpaceId === null
          ? 'Storey'
          : 'Space',
    pageTitle: `Create ${searchStoreyId === null ? 'Suite' : searchSpaceId === null ? 'Storey' : 'Space'} ${feModelTypeMap[conformedArgs.nModelType]} Item`,
  } as ConformArrayArgsToObjectForItemCreateResponse
}
