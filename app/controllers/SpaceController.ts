import { getUserAuth } from '@/utils/auth'
import { displayContent, displaySpaceContent } from '@/utils/content'
import { db } from '@/utils/db'
import { Prisma } from '@prisma/client'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { MultiContentReducerItem } from '~/hooks/useMultiContentsReducer'
import { getImagesForItem } from '~/repositories/PkmImageRepository'
import {
  getSpaceItemCounts,
  getSpaceConfig,
  getSpaceDashboard,
} from '~/repositories/PkmSpaceRepository'
import {
  getStoreyConfig,
  getStoreyForUser,
} from '~/repositories/PkmStoreyRepository'
import {
  getSuiteConfig,
  getSuiteForUser,
} from '~/repositories/PkmSuiteRepository'
import { determineSyncContentsTransactionsByFormData } from '~/services/PkmContentService'
import { wreckSpace } from '~/services/WreckerService'

export type SpaceConfigActionResponse = {
  errors: {
    fieldErrors: {
      general?: string
      content?: string
      name?: string
      description?: string
    } | null
  } | null
  success: boolean
  redirect: string | null
}

export const spaceUpdateConfigAction = async (
  args: ActionFunctionArgs,
): Promise<SpaceConfigActionResponse> => {
  const user = await getUserAuth(args)
  if (!user) {
    return {
      errors: {
        fieldErrors: {
          general:
            'Your session has expired. Please log in again in another window to avoid losing your work',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const suiteId = args.params.suite_id
  if (!suiteId) {
    return {
      errors: {
        fieldErrors: {
          general: 'Suite id not provided',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const suite = await getSuiteConfig({
    suiteId,
    userId: user.id,
  })

  if (!suite) {
    return {
      errors: {
        fieldErrors: {
          general: 'Suite not found',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const storeyId = args.params.storey_id
  if (!storeyId) {
    return {
      errors: {
        fieldErrors: {
          general: 'Storey id not provided',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const storey = await getStoreyConfig({
    storeyId,
    userId: user.id,
  })

  if (!storey || storey.suite_id !== suite.id) {
    return {
      errors: {
        fieldErrors: {
          general: 'Storey not found',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const spaceId = args.params.space_id
  if (!spaceId) {
    return {
      errors: {
        fieldErrors: {
          general: 'Space id not provided',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const space = await getSpaceConfig({
    spaceId,
    userId: user.id,
  })

  if (!space || space.storey.id !== storey.id) {
    return {
      errors: {
        fieldErrors: {
          general: 'Space not found',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const existingHistoryIdForMultiContent =
    space.pkm_history[0]?.history_id ?? null

  // When loading a Space now, it should auto heal if it doesn't have an existing history
  if (!existingHistoryIdForMultiContent) {
    return {
      errors: {
        fieldErrors: {
          general: 'Space not found',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const { request } = args

  const formData = await request.formData()
  if (!formData) {
    return {
      errors: {
        fieldErrors: {
          general: 'Form Data was missing. This is not an expected error',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const name: FormDataEntryValue | null = formData.get('name')

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

  const description: FormDataEntryValue | null = formData.get('description')

  if (!description || description === '') {
    return {
      errors: {
        fieldErrors: {
          description: 'Description cannot be empty',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const newHistoryId = crypto.randomUUID()

  const transactions: Prisma.PrismaPromise<unknown>[] = [
    db.space.update({
      where: {
        user_id: user.id,
        id: space.id,
      },
      data: {
        name: name.toString(),
        description: description.toString(),
        content: 'Now handled by Multi Contents',
      },
    }),
    db.pkmHistory.update({
      where: {
        history_id: existingHistoryIdForMultiContent,
        is_current: true,
      },
      data: {
        is_current: false,
      },
    }),
    db.pkmHistory.create({
      data: {
        history_id: newHistoryId,
        model_id: space.id,
        model_type: 'SpaceContents',
        is_current: true,
        user_id: user.id,
        suite_id: null,
        storey_id: null,
        space_id: space.id,
      },
    }),
  ]

  try {
    const incomingContents = await determineSyncContentsTransactionsByFormData({
      formData,
      modelId: spaceId,
      historyId: newHistoryId,
      modelType: 'SpaceContents',
      userId: user.id,
    })

    if (incomingContents.error) {
      return {
        errors: {
          fieldErrors: {
            general: incomingContents.error,
          },
        },
        success: false,
        redirect: null,
      }
    }

    incomingContents.transactions.forEach((transaction) => {
      transactions.push(transaction)
    })
  } catch {
    return {
      errors: {
        fieldErrors: {
          general: `Failed to update Space. Please try again. [1]`,
        },
      },
      success: false,
      redirect: null,
    }
  }

  try {
    await db.$transaction(transactions)

    return {
      errors: {
        fieldErrors: {},
      },
      success: true,
      redirect: `/suite/${suiteId}/storey/${storeyId}/space/${spaceId}/config`,
    }
  } catch {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update Space. Please try again. [2]',
        },
      },
      success: false,
      redirect: null,
    }
  }
}

export const spaceConfigLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const space_id = args.params.space_id
  if (!space_id) {
    return redirect('/')
  }

  const space = await getSpaceConfig({
    spaceId: space_id,
    userId: user.id,
  })

  if (!space) {
    return redirect('/')
  }

  // A space can have multiple pkm_history, but for the sake of getting its Multi Contents
  //    we need the History Item that's current and belongs specifically to the Suite
  const historyIdForMultiContent = space.pkm_history[0]?.history_id ?? null

  const suiteMultiContents: MultiContentReducerItem[] = []
  const resolvedMultiContents: string[] = []

  if (historyIdForMultiContent) {
    const multiContents = await db.pkmContents.findMany({
      where: {
        history_id: historyIdForMultiContent,
        model_id: space.id,
      },
      orderBy: {
        sort_order: 'asc',
      },
    })

    for (const multiContent of multiContents) {
      suiteMultiContents.push({
        id: multiContent.content_id,
        sortOrder: multiContent.sort_order,
        content: multiContent.content,
        status: 'active',
        originalStatus: 'active',
      })

      const content = await displayContent(multiContent.content, user)
      resolvedMultiContents.push(
        `<a id="${multiContent.content_id}">&nbsp;</a><br />${content}`,
      )
    }
  }

  // BTTODO - Reception Space won't be unique. Reception Suite and Reception Storey will have the same id
  const images = await getImagesForItem({
    modelId: space.id,
    userId: user.id,
  })

  return {
    id: space.id,
    content: space.content,
    resolvedContent:
      '<div class="*:mb-2"><div>' +
      resolvedMultiContents.join('</div><div>') +
      '</div></div>',
    multiContents: suiteMultiContents,
    description: space.description,
    name: space.name,
    suiteId: space.storey.suite.id,
    suiteName: space.storey.suite.name,
    storeyId: space.storey.id,
    storeyName: space.storey.name,
    historyIdForMultiContent,
    images,
  }
}

export const spaceDashboardLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const storeyId = args.params.storey_id
  if (!storeyId) {
    return redirect('/')
  }

  const spaceId = args.params.space_id
  if (!spaceId) {
    return redirect('/')
  }

  const spaceConfig = await getSpaceConfig({
    spaceId,
    userId: user.id,
  })

  if (!spaceConfig) {
    return redirect('/')
  }

  const historyIdForMultiContent = spaceConfig.pkm_history[0]?.history_id

  if (!historyIdForMultiContent) {
    return redirect('/')
  }

  const spaceDashboard = await getSpaceDashboard({
    storeyId,
    spaceId,
    userId: user.id,
  })

  if (!spaceDashboard) {
    return redirect('/')
  }

  const spaceItemCounts = await getSpaceItemCounts({
    storeyId,
    userId: user.id,
  })

  const url = new URL(args.request.url)
  const tab = url.searchParams.get('tab')

  const resolvedContent = await displaySpaceContent({
    space: {
      id: spaceDashboard.id,
      name: spaceDashboard.name,
      description: spaceDashboard.description,
      content: spaceDashboard.content,
      storey: {
        id: spaceDashboard.storey_id,
        name: spaceDashboard.storey.name,
        description: spaceDashboard.storey.description,
        suite: {
          id: spaceDashboard.storey.suite.id,
          name: spaceDashboard.storey.suite.id,
          description: spaceDashboard.storey.suite.description,
        },
      },
    },
    historyIdForMultiContent,
    user,
  })

  return {
    resolvedContent,
    spaceDashboard,
    spaceItemCounts,
    tab: tab ?? 'content',
  }
}

export const spaceConfigNewLoader = async (args: ActionFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suiteId = args.params.suite_id
  if (!suiteId) {
    return redirect('/')
  }

  const suite = await getSuiteForUser({
    suiteId,
    userId: user.id,
  })

  if (!suite) {
    return redirect('/')
  }

  const storeyId = args.params.storey_id
  if (!storeyId) {
    return redirect('/')
  }

  const storey = await getStoreyForUser({
    suiteId,
    storeyId,
    userId: user.id,
  })

  if (!storey) {
    return redirect('/')
  }

  return {
    suiteId: suite.id,
    suiteName: suite.name,
    storeyId: storey.id,
    storeyName: storey.name,
  }
}

export const spaceConfigNewAction = async (
  args: ActionFunctionArgs,
): Promise<SpaceConfigActionResponse> => {
  const user = await getUserAuth(args)
  if (!user) {
    return {
      errors: {
        fieldErrors: {
          general:
            'Your session has expired. Please log in again in another window to avoid losing your work',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const suiteId = args.params.suite_id
  if (!suiteId) {
    return {
      errors: {
        fieldErrors: {
          general: 'Suite not found',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const suite = await getSuiteConfig({
    suiteId,
    userId: user.id,
  })

  if (!suite) {
    return {
      errors: {
        fieldErrors: {
          general: 'Suite not found',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const storeyId = args.params.storey_id
  if (!storeyId) {
    return {
      errors: {
        fieldErrors: {
          general: 'Storey not found',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const storey = await getStoreyConfig({
    storeyId: storeyId,
    userId: user.id,
  })

  if (!storey || storey.suite_id !== suite.id) {
    return {
      errors: {
        fieldErrors: {
          general: 'Storey not found',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const { request } = args

  const formData = await request.formData()
  if (!formData) {
    return {
      errors: {
        fieldErrors: {
          general: 'Form Data was missing. This is not an expected error',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const name: FormDataEntryValue | null = formData.get('name')

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

  const description: FormDataEntryValue | null = formData.get('description')

  if (!description || description === '') {
    return {
      errors: {
        fieldErrors: {
          description: 'Description cannot be empty',
        },
      },
      success: false,
      redirect: null,
    }
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = []

  const newSpaceId = crypto.randomUUID()

  transactions.push(
    db.space.create({
      data: {
        id: newSpaceId,
        storey_id: storeyId,
        content: 'Now handled by Multi Contents',
        description: description.toString(),
        name: name.toString(),
        user_id: user.id,
      },
    }),
  )

  const newHistoryId = crypto.randomUUID()

  transactions.push(
    db.pkmHistory.create({
      data: {
        history_id: newHistoryId,
        model_id: newSpaceId,
        model_type: 'SpaceContents',
        is_current: true,
        user_id: user.id,
        suite_id: null,
        storey_id: null,
        space_id: newSpaceId,
      },
    }),
  )

  try {
    const incomingContents = await determineSyncContentsTransactionsByFormData({
      formData,
      modelId: newSpaceId,
      historyId: newHistoryId,
      modelType: 'SpaceContents',
      userId: user.id,
    })

    if (incomingContents.error) {
      return {
        errors: {
          fieldErrors: {
            general: incomingContents.error,
          },
        },
        success: false,
        redirect: null,
      }
    }

    incomingContents.transactions.forEach((transaction) => {
      transactions.push(transaction)
    })
  } catch {
    return {
      errors: {
        fieldErrors: {
          general:
            'Failed to create Space. Please try again in a new window to avoid losing your work. You can copy across the Name, Description, and Contents. You will have to re-upload your images and update the Contents to refer to the new imag locations instead. Apologies for the inconvenience. [1]',
        },
      },
      success: false,
      redirect: null,
    }
  }

  try {
    await db.$transaction(transactions)

    return {
      errors: {
        fieldErrors: {},
      },
      success: true,
      redirect: `/suite/${suiteId}/storey/${storeyId}/space/${newSpaceId}/config`,
    }
  } catch {
    return {
      errors: {
        fieldErrors: {
          general:
            'Failed to create Space. Please try again in a new window to avoid losing your work. You can copy across the Name, Description, and Contents. You will have to re-upload your images and update the Contents to refer to the new imag locations instead. Apologies for the inconvenience. [2]',
        },
      },
      success: false,
      redirect: null,
    }
  }
}

export const spaceWreckAction = async (args: ActionFunctionArgs) => {
  const suiteId = args.params.suite_id
  const storeyId = args.params.storey_id
  const spaceId = args.params.space_id

  if (!suiteId || !storeyId || !spaceId) {
    return {
      success: false,
      error: 'Space not found',
      redirect: '/',
    }
  }

  const user = await getUserAuth(args)
  if (!user) {
    return {
      errors: {
        fieldErrors: {
          general:
            'Your session has expired. Please log in again in another window to avoid losing your work',
        },
      },
      success: false,
      redirect: null,
    }
  }

  return await wreckSpace({
    suiteId,
    storeyId,
    spaceId,
    userId: user.id,
  })
}
