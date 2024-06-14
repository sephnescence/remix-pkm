import {
  modelTypeMap,
  modelTypeSlugToHistoryModelType,
  modelTypeToHistoryModelNameMap,
} from '@/utils/apiUtils'
import { getUserAuth } from '@/utils/auth'
import { getNewItemSuiteStoreyAndSpaceIds } from '@/utils/create'
import { db } from '@/utils/db'
import {
  ConformArrayArgsToObjectForItemCreateResponse,
  ConformArrayArgsToObjectResponse,
  conformArrayArgsToObject,
  conformArrayArgsToObjectForItemCreate,
} from '@/utils/url'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import { randomUUID } from 'crypto'
import { getCurrentHistoryItemForUser } from '~/repositories/PkmHistoryRepository'
import {
  cloneModelImages,
  getImagesForItem,
} from '~/repositories/PkmImageRepository'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
  SpaceForMove,
  getSpacesForMove,
} from '~/repositories/PkmSpaceRepository'
import {
  StoreyForMove,
  getStoreyForMove,
  getStoreysForMove,
} from '~/repositories/PkmStoreyRepository'
import {
  SuiteForMove,
  getSuiteForMove,
  getSuitesForMove,
} from '~/repositories/PkmSuiteRepository'
import { getNewSuiteStoreyAndSpaceIds } from '@/utils/move'
import { getDetailsForBreadcrumbs } from '@/utils/content/suiteStoreySpace'

export type ItemUpdateConfigActionResponse = {
  errors: {
    fieldErrors: {
      general?: string
      content?: string
      name?: string
      summary?: string
    } | null
  } | null
  success: boolean
  redirect: string | null
}

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

export type ItemMoveLoaderResponse = {
  args: ConformArrayArgsToObjectResponse
  history: Awaited<ReturnType<typeof getCurrentHistoryItemForUser>>
  item: {
    name: string
    content: string
    summary: string
  }
  itemLocation: string
  suitesForMove: SuiteForMove[] | null
  storeysForMove: StoreyForMove[] | null
  spacesForMove: SpaceForMove[] | null
}

export type CreateItemLoaderResponse = {
  pageTitle: string
  cancelUrl: string
  apiEndpoint: string
  locationName: string
  suite: {
    id: string
    name: string
  }
  storey: {
    id: string
    name: string
  }
  space: {
    id: string
    name: string
  }
}

export type ItemCreateConfigActionResponse = {
  errors: {
    fieldErrors: {
      general?: string
      content?: string
      name?: string
      summary?: string
    } | null
  } | null
  success: boolean
  redirect: string | null
}

export const itemCreateAction = async (
  actionArgs: ActionFunctionArgs,
): Promise<ItemCreateConfigActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(actionArgs)
  if (!user) {
    return {
      errors: {
        fieldErrors: {
          general: 'User not found. Please log in again',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const { request } = actionArgs

  const formData = await request.formData()
  if (!formData) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const apiEndpoint = formData.get('apiEndpoint')?.toString().substring(25)

  if (!apiEndpoint || apiEndpoint === '') {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const args = (await conformArrayArgsToObjectForItemCreate(
    apiEndpoint.split('/'),
  )) as ConformArrayArgsToObjectForItemCreateResponse

  if (!args) return redirect('/')

  if (args.exception) {
    return {
      errors: {
        fieldErrors: {
          general: args.exception,
        },
      },
      success: false,
      redirect: null,
    }
  }

  const name: string | undefined = formData.get('name')?.toString()

  if (!name || name === '') {
    return {
      errors: {
        fieldErrors: {
          name: 'Name cannot be empty',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const summary: string | undefined = formData.get('summary')?.toString()

  if (!summary || summary === '') {
    return {
      errors: {
        fieldErrors: {
          summary: 'Summary cannot be empty',
        },
      },
      success: false,
      redirect: null,
    }
  }

  let content: string | undefined = formData.get('content')?.toString()

  if (!content || content === '') {
    return {
      errors: {
        fieldErrors: {
          content: 'Content cannot be empty',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const s3Client = new S3Client({
    region: 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  })

  const keys = [...formData.keys()]
  const newModelId = randomUUID().toString()
  const newHistoryId = randomUUID().toString()
  for (const key of keys) {
    const value = formData.get(key)

    if (value instanceof File) {
      const name = formData.get(`${key}_name`)?.toString()
      const size = parseInt(formData.get(`${key}_size`)?.toString() ?? '0')
      const type = formData.get(`${key}_type`)?.toString()
      const localStorageUrl = formData.get(`${key}_url`)?.toString()
      if (name && size && type) {
        const s3_name = randomUUID().toString() + '-' + name

        const arrayBuffer = await value.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const results = await s3Client.send(
          new PutObjectCommand({
            Bucket: 'rethought-item-images',
            Key: `${user.id}/${newModelId}/${s3_name}`,
            Body: buffer,
            ACL: 'public-read',
          }),
        )

        const s3_url = `https://rethought-item-images.s3-ap-southeast-2.amazonaws.com/${user.id}/${newModelId}/${s3_name}`

        if (results.$metadata.httpStatusCode !== 200) {
          return {
            errors: {
              fieldErrors: {
                general: 'Image upload failed. Please try again later',
              },
            },
            success: false,
            redirect: null,
          }
        }

        await db.pkmImage.create({
          data: {
            s3_url,
            name,
            size,
            type,
            user_id: user.id,
            model_id: newModelId,
          },
        })

        if (localStorageUrl) {
          content = content.replaceAll(localStorageUrl, s3_url)
        }
      }
    }
  }

  const itemArgs: {
    content: string
    name: string
    summary: string
    model_id: string
    user_id: string
    void_at?: Date
  } = {
    content,
    name,
    summary,
    model_id: newModelId,
    user_id: user.id,
  }

  if (args.conformedArgs.nModelType === 'passing-thought') {
    itemArgs.void_at = new Date('9000-01-01 00:00:00')
  }

  const {
    suiteId: newSuiteId,
    storeyId: newStoreyId,
    spaceId: newSpaceId,
  } = getNewItemSuiteStoreyAndSpaceIds({
    eSuiteId: args.conformedArgs.eSuiteId ?? null,
    eStoreyId: args.conformedArgs.eStoreyId ?? null,
    eSpaceId: args.conformedArgs.eSpaceId ?? null,
  })

  const results = await db.$transaction([
    db.pkmHistory.create({
      data: {
        history_id: newHistoryId,
        model_id: newModelId,
        model_type:
          modelTypeSlugToHistoryModelType[args.conformedArgs.nModelType],
        is_current: true,
        user_id: user.id,
        suite_id: newSuiteId,
        storey_id: newStoreyId,
        space_id: newSpaceId,
        [`${modelTypeToHistoryModelNameMap[args.conformedArgs.nModelType]}_item`]:
          {
            create: itemArgs,
          },
      },
    }),
  ])

  if (!results) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  let redirectUrlPart = '/item/view/'

  if (args.itemLocation.suiteId) {
    redirectUrlPart += `eSuiteId/${args.itemLocation.suiteId}/`
  }

  if (args.itemLocation.storeyId) {
    redirectUrlPart += `eStoreyId/${args.itemLocation.storeyId}/`
  }

  if (args.itemLocation.spaceId) {
    redirectUrlPart += `eSpaceId/${args.itemLocation.spaceId}/`
  }

  redirectUrlPart += `eModelType/${args.conformedArgs.nModelType}/eModelId/${newModelId}/eHistoryId/${newHistoryId}`

  return {
    errors: null,
    success: true,
    redirect: redirectUrlPart,
  }
}

export const itemUpdateAction = async (
  actionArgs: ActionFunctionArgs,
): Promise<ItemUpdateConfigActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(actionArgs)
  if (!user) {
    return {
      errors: {
        fieldErrors: {
          general: 'User not found. Please log in again',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const { request } = actionArgs

  const formData = await request.formData()
  if (!formData) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const apiEndpoint = formData.get('apiEndpoint')?.toString().substring(23)

  if (!apiEndpoint || apiEndpoint === '') {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const args = (await conformArrayArgsToObject(
    apiEndpoint.split('/'),
  )) as ConformArrayArgsToObjectResponse

  if (!args) return redirect('/')

  if (args.exception) {
    return {
      errors: {
        fieldErrors: {
          general: args.exception,
        },
      },
      success: false,
      redirect: null,
    }
  }

  const name: string | undefined = formData.get('name')?.toString()

  if (!name || name === '') {
    return {
      errors: {
        fieldErrors: {
          name: 'Name cannot be empty',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const summary: string | undefined = formData.get('summary')?.toString()

  if (!summary || summary === '') {
    return {
      errors: {
        fieldErrors: {
          summary: 'Summary cannot be empty',
        },
      },
      success: false,
      redirect: null,
    }
  }

  let content: string | undefined = formData.get('content')?.toString()

  if (!content || content === '') {
    return {
      errors: {
        fieldErrors: {
          content: 'Content cannot be empty',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const s3Client = new S3Client({
    region: 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  })

  const keys = [...formData.keys()]

  for (const key of keys) {
    const value = formData.get(key)

    if (value instanceof File) {
      const name = formData.get(`${key}_name`)?.toString()
      const size = parseInt(formData.get(`${key}_size`)?.toString() ?? '0')
      const type = formData.get(`${key}_type`)?.toString()
      const localStorageUrl = formData.get(`${key}_url`)?.toString()
      if (name && size && type) {
        const s3_name = randomUUID().toString() + '-' + name

        const arrayBuffer = await value.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const results = await s3Client.send(
          new PutObjectCommand({
            Bucket: 'rethought-item-images',
            Key: `${user.id}/${args.conformedArgs.eModelId}/${s3_name}`,
            Body: buffer,
            ACL: 'public-read',
          }),
        )

        const s3_url = `https://rethought-item-images.s3-ap-southeast-2.amazonaws.com/${user.id}/${args.conformedArgs.eModelId}/${s3_name}`

        if (results.$metadata.httpStatusCode !== 200) {
          return {
            errors: {
              fieldErrors: {
                general: 'Image upload failed. Please try again later',
              },
            },
            success: false,
            redirect: null,
          }
        }

        await db.pkmImage.create({
          data: {
            s3_url,
            name,
            size,
            type,
            user_id: user.id,
            model_id: args.conformedArgs.eModelId,
          },
        })

        if (localStorageUrl) {
          content = content.replaceAll(localStorageUrl, s3_url)
        }
      }
    }
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
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
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
    return {
      errors: {
        fieldErrors: {
          general:
            'Item not found. You might be trying to update an older version of the Item',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const item =
    history.historyItem.epiphany_item ??
    history.historyItem.inbox_item ??
    history.historyItem.passing_thought_item ??
    history.historyItem.todo_item ??
    history.historyItem.trash_item ??
    history.historyItem.void_item

  if (!item) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const itemArgs: {
    content: string
    name: string
    summary: string
    model_id: string
    user_id: string
    void_at?: Date
  } = {
    content,
    name,
    summary,
    model_id: args.conformedArgs.eModelId,
    user_id: user.id,
  }

  if (args.conformedArgs.eModelType === 'passing-thought') {
    itemArgs.void_at = new Date('9000-01-01 00:00:00')
  }

  const {
    suiteId: newSuiteId,
    storeyId: newStoreyId,
    spaceId: newSpaceId,
  } = getNewItemSuiteStoreyAndSpaceIds({
    eSuiteId: args.conformedArgs.eSuiteId ?? null,
    eStoreyId: args.conformedArgs.eStoreyId ?? null,
    eSpaceId: args.conformedArgs.eSpaceId ?? null,
  })

  const newHistoryId = randomUUID().toString()

  const results = await db.$transaction([
    db.pkmHistory.update({
      where: {
        history_id: args.conformedArgs.eHistoryId,
        is_current: true,
      },
      data: {
        is_current: false,
      },
    }),
    db.pkmHistory.create({
      data: {
        history_id: newHistoryId,
        model_id: args.conformedArgs.eModelId,
        model_type:
          modelTypeSlugToHistoryModelType[args.conformedArgs.eModelType],
        is_current: true,
        user_id: user.id,
        suite_id: newSuiteId,
        storey_id: newStoreyId,
        space_id: newSpaceId,
        [`${modelTypeToHistoryModelNameMap[args.conformedArgs.eModelType ?? args.conformedArgs.eModelType]}_item`]:
          {
            create: itemArgs,
          },
      },
    }),
  ])

  if (!results) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  let redirectUrlPart = '/item/view/'

  if (args.conformedArgs.eSuiteId) {
    redirectUrlPart += `eSuiteId/${args.conformedArgs.eSuiteId}/`
  }

  if (args.conformedArgs.eStoreyId) {
    redirectUrlPart += `eStoreyId/${args.conformedArgs.eStoreyId}/`
  }

  if (args.conformedArgs.eSpaceId) {
    redirectUrlPart += `eSpaceId/${args.conformedArgs.eSpaceId}/`
  }

  redirectUrlPart += `eModelType/${args.conformedArgs.eModelType}/eModelId/${args.conformedArgs.eModelId}/eHistoryId/${newHistoryId}`

  return {
    errors: null,
    success: true,
    redirect: redirectUrlPart,
  }
}

export const createItemLoader = async (
  loaderArgs: LoaderFunctionArgs,
): Promise<CreateItemLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(loaderArgs)
  if (!user) return redirect('/')

  const params = loaderArgs.params['*']
  if (!params) return redirect('/')

  const args = (await conformArrayArgsToObjectForItemCreate(
    params.split('/'),
  )) as ConformArrayArgsToObjectForItemCreateResponse

  if (!args || args.exception) return redirect('/')

  const detailsForBreadcrumbs = await getDetailsForBreadcrumbs({
    userId: user.id,
    suiteId: args.conformedArgs.eSuiteId ?? null,
    storeyId: args.conformedArgs.eStoreyId ?? null,
    spaceId: args.conformedArgs.eSpaceId ?? null,
  })

  if (!detailsForBreadcrumbs) {
    return redirect('/')
  }

  return {
    pageTitle: args.pageTitle,
    cancelUrl: args.feParentUrl,
    apiEndpoint: args.apiCreateUrl,
    locationName: args.itemLocationName,
    suite: {
      id: detailsForBreadcrumbs.suiteId,
      name: detailsForBreadcrumbs.suiteName,
    },
    storey: {
      id: detailsForBreadcrumbs.storeyId,
      name: detailsForBreadcrumbs.storeyName,
    },
    space: {
      id: detailsForBreadcrumbs.spaceId,
      name: detailsForBreadcrumbs.spaceName,
    },
  }
}

export const itemLoader = async (
  loaderArgs: LoaderFunctionArgs,
): Promise<ItemLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(loaderArgs)
  if (!user) {
    return redirect('/')
  }

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

export const itemMoveLoader = async (
  loaderArgs: LoaderFunctionArgs,
): Promise<ItemMoveLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(loaderArgs)
  if (!user) {
    return redirect('/')
  }

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

  let suitesForMove = null
  let storeysForMove = null
  let spacesForMove = null

  const itemLocation =
    storeyId === null ? 'suite' : spaceId === null ? 'storey' : 'space'

  // Suite Items can move into a sibling Suite
  if (itemLocation === 'suite') {
    suitesForMove = await getSuitesForMove({
      userId: user.id,
    })
  } else if (itemLocation === 'storey') {
    // Storey Items can move to the parent Suite
    // Space Items can move to the parent Suite
    suitesForMove = [
      (await getSuiteForMove({
        userId: user.id,
        suiteId,
      })) as SuiteForMove,
    ]
  }

  // Storey Items can move to a sibling Storey
  // Suite Items can move to a child Storey
  if (itemLocation === 'storey' || itemLocation === 'suite') {
    storeysForMove = await getStoreysForMove({
      userId: user.id,
      suiteId,
    })
  } else {
    // Space Items can move to the parent Storey
    storeysForMove = [
      (await getStoreyForMove({
        userId: user.id,
        storeyId,
      })) as StoreyForMove,
    ]
  }

  // Space Items can move to a sibling Space
  // Space Items can move to the parent Storey
  // Storey Items can move to a child Space
  if (itemLocation === 'space' || itemLocation === 'storey') {
    spacesForMove = await getSpacesForMove({
      userId: user.id,
      storeyId,
    })
  }

  return {
    args,
    history,
    item,
    itemLocation,
    suitesForMove,
    storeysForMove,
    spacesForMove,
  }
}

export const itemMoveAction = async (
  actionArgs: ActionFunctionArgs,
): Promise<ItemUpdateConfigActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(actionArgs)
  if (!user) {
    return {
      errors: {
        fieldErrors: {
          general: 'User not found. Please log in again',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const { request } = actionArgs

  const formData = await request.formData()
  if (!formData) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const apiEndpoint = formData.get('apiEndpoint')?.toString().substring(23)

  if (!apiEndpoint || apiEndpoint === '') {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const args = (await conformArrayArgsToObject(
    apiEndpoint.split('/'),
  )) as ConformArrayArgsToObjectResponse

  if (!args) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  if (args.exception) {
    return {
      errors: {
        fieldErrors: {
          general: args.exception,
        },
      },
      success: false,
      redirect: null,
    }
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
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
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
    return {
      errors: {
        fieldErrors: {
          general:
            'Item not found. You might be trying to update an older version of the Item',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const item =
    history.historyItem.epiphany_item ??
    history.historyItem.inbox_item ??
    history.historyItem.passing_thought_item ??
    history.historyItem.todo_item ??
    history.historyItem.trash_item ??
    history.historyItem.void_item

  if (!item) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const newHistoryId = randomUUID().toString()

  const itemArgs: {
    content: string
    name: string
    summary: string
    model_id: string
    user_id: string
    void_at?: Date
  } = {
    content: item.content,
    name: item.name,
    summary: item.summary,
    model_id: args.conformedArgs.eModelId,
    user_id: user.id,
  }

  if (args.conformedArgs.nModelType === 'passing-thought') {
    itemArgs.void_at = new Date('9000-01-01 00:00:00')
  }

  let redirectUrlPart = '/'

  try {
    const {
      suiteId: newSuiteId,
      storeyId: newStoreyId,
      spaceId: newSpaceId,
    } = getNewSuiteStoreyAndSpaceIds({
      eSuiteId: args.conformedArgs.eSuiteId ?? null,
      eStoreyId: args.conformedArgs.eStoreyId ?? null,
      eSpaceId: args.conformedArgs.eSpaceId ?? null,
      nSuiteId: args.conformedArgs.nSuiteId ?? null,
      nStoreyId: args.conformedArgs.nStoreyId ?? null,
      nSpaceId: args.conformedArgs.nSpaceId ?? null,
    })

    const results = await db.$transaction([
      db.pkmHistory.update({
        where: {
          history_id: history.historyItem.history_id,
          is_current: true,
        },
        data: {
          is_current: false,
        },
      }),
      db.pkmHistory.create({
        data: {
          history_id: newHistoryId,
          model_id: args.conformedArgs.eModelId,
          model_type: args.conformedArgs.nModelType
            ? modelTypeSlugToHistoryModelType[args.conformedArgs.nModelType]
            : history.historyItem.model_type,
          is_current: true,
          user_id: user.id,
          suite_id: newSuiteId,
          storey_id: newStoreyId,
          space_id: newSpaceId,
          [`${modelTypeToHistoryModelNameMap[args.conformedArgs.nModelType ?? args.conformedArgs.eModelType]}_item`]:
            {
              create: itemArgs,
            },
        },
      }),
    ])

    if (!results) {
      return {
        errors: {
          fieldErrors: {
            general: 'Move - Item was not moved',
          },
        },
        success: false,
        redirect: null,
      }
    }

    redirectUrlPart = '/item/view/'

    if (newSuiteId) {
      redirectUrlPart += `eSuiteId/${newSuiteId}/`
    } else {
      if (history.historyItem.suite?.id) {
        redirectUrlPart += `eSuiteId/${history.historyItem.suite?.id}/`
      } else if (history.historyItem.storey?.suite?.id) {
        redirectUrlPart += `eSuiteId/${history.historyItem.storey?.suite?.id}/`
      }
    }

    if (newStoreyId) {
      redirectUrlPart += `eStoreyId/${newStoreyId}/`
    }

    if (newSpaceId) {
      redirectUrlPart += `eSpaceId/${newSpaceId}/`
    }

    redirectUrlPart += `eModelType/${args.conformedArgs.nModelType ?? args.conformedArgs.eModelType}/eModelId/${args.conformedArgs.eModelId}/eHistoryId/${results[1].history_id}`

    return {
      errors: null,
      success: true,
      redirect: redirectUrlPart,
    }
  } catch (e) {
    if (e instanceof Error) {
      return {
        errors: {
          fieldErrors: {
            general: `Move - ${e.message}`,
          },
        },
        success: false,
        redirect: null,
      }
    }

    return {
      errors: {
        fieldErrors: {
          general: `Move - Unknown exception`,
        },
      },
      success: false,
      redirect: null,
    }
  }
}

export const itemDuplicateAction = async (
  actionArgs: ActionFunctionArgs,
): Promise<ItemUpdateConfigActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(actionArgs)
  if (!user) {
    return {
      errors: {
        fieldErrors: {
          general: 'User not found. Please log in again [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const { request } = actionArgs

  const formData = await request.formData()
  if (!formData) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report [2]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const apiEndpoint = formData.get('apiEndpoint')?.toString().substring(28)

  if (!apiEndpoint || apiEndpoint === '') {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report [3]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const args = (await conformArrayArgsToObject(
    apiEndpoint.split('/'),
  )) as ConformArrayArgsToObjectResponse

  if (!args) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report [4]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  if (args.exception) {
    return {
      errors: {
        fieldErrors: {
          general: args.exception,
        },
      },
      success: false,
      redirect: null,
    }
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
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report [5]',
        },
      },
      success: false,
      redirect: null,
    }
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
    return {
      errors: {
        fieldErrors: {
          general:
            'Item not found. You might be trying to update an older version of the Item',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const item =
    history.historyItem.epiphany_item ??
    history.historyItem.inbox_item ??
    history.historyItem.passing_thought_item ??
    history.historyItem.todo_item ??
    history.historyItem.trash_item ??
    history.historyItem.void_item

  if (!item) {
    return {
      errors: {
        fieldErrors: {
          general: 'System Error. Please file a bug report [6]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const newModelId = randomUUID().toString()
  const newHistoryId = randomUUID().toString()

  const itemArgs: {
    content: string
    name: string
    summary: string
    model_id: string
    user_id: string
    void_at?: Date
  } = {
    content: item.content,
    name: item.name,
    summary: item.summary,
    model_id: newModelId,
    user_id: user.id,
  }

  if (args.conformedArgs.nModelType === 'passing-thought') {
    itemArgs.void_at = new Date('9000-01-01 00:00:00')
  }

  const results = await db.pkmHistory.create({
    data: {
      history_id: newHistoryId,
      model_id: newModelId,
      model_type: history.historyItem.model_type,
      is_current: true,
      user_id: user.id,
      suite_id: args.conformedArgs.nSuiteId ?? null,
      storey_id: args.conformedArgs.nStoreyId ?? null,
      space_id: args.conformedArgs.nSpaceId ?? null,
      [`${modelTypeToHistoryModelNameMap[args.conformedArgs.eModelType]}_item`]:
        {
          create: itemArgs,
        },
    },
  })

  if (!results) {
    return {
      errors: {
        fieldErrors: {
          general:
            'System Error. Please file a bug report. Duplicate - Item was not created',
        },
      },
      success: false,
      redirect: null,
    }
  }

  await cloneModelImages({
    modelId: newModelId,
    newModelId: newModelId,
    userId: user.id,
  })

  let redirectUrlPart = '/item/view/'
  if (args.conformedArgs.eSuiteId) {
    redirectUrlPart += `eSuiteId/${args.conformedArgs.eSuiteId}/`
  } else {
    if (history.historyItem.suite?.id) {
      redirectUrlPart += `eSuiteId/${history.historyItem.suite?.id}/`
    } else if (history.historyItem.storey?.suite?.id) {
      redirectUrlPart += `eSuiteId/${history.historyItem.storey?.suite?.id}/`
    }
  }

  if (args.conformedArgs.eStoreyId) {
    redirectUrlPart += `eStoreyId/${args.conformedArgs.eStoreyId}/`
  }
  if (args.conformedArgs.eSpaceId) {
    redirectUrlPart += `eSpaceId/${args.conformedArgs.eSpaceId}/`
  }
  redirectUrlPart += `eModelType/${modelTypeToHistoryModelNameMap[args.conformedArgs.eModelType]}/eModelId/${newModelId}/eHistoryId/${newHistoryId}`

  return redirect(redirectUrlPart)
}
