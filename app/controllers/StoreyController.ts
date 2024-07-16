import { getUserAuth } from '@/utils/auth'
import { displayContent, displayStoreyContent } from '@/utils/content'
import { db } from '@/utils/db'
import { Prisma } from '@prisma/client'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { MultiContentReducerItem } from '~/hooks/useMultiContentsReducer'
import { getImagesForItem } from '~/repositories/PkmImageRepository'
import { getSpaceItemCounts } from '~/repositories/PkmSpaceRepository'
import {
  getStoreyConfig,
  getStoreyDashboard,
} from '~/repositories/PkmStoreyRepository'
import {
  getSuiteConfig,
  getSuiteForUser,
} from '~/repositories/PkmSuiteRepository'
import { determineSyncContentsTransactionsByFormData } from '~/services/PkmContentService'
import { wreckStorey } from '~/services/WreckerService'

export type StoreyConfigActionResponse = {
  errors: {
    fieldErrors: {
      general?: string
      content?: string
      description?: string
      name?: string
    }
  }
  success: boolean
  redirect: string | null
}

export const storeyUpdateConfigAction = async (
  args: ActionFunctionArgs,
): Promise<StoreyConfigActionResponse> => {
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

  const existingHistoryIdForMultiContent =
    storey.pkm_history[0]?.history_id ?? null

  // When loading a Storey now, it should auto heal if it doesn't have an existing history
  if (!existingHistoryIdForMultiContent) {
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

  const newHistoryId = crypto.randomUUID()

  const transactions: Prisma.PrismaPromise<unknown>[] = [
    db.storey.update({
      where: {
        user_id: user.id,
        id: storey.id,
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
        model_id: storey.id,
        model_type: 'StoreyContents',
        is_current: true,
        user_id: user.id,
        suite_id: null,
        storey_id: storey.id,
        space_id: null,
      },
    }),
  ]

  try {
    const incomingContents = await determineSyncContentsTransactionsByFormData({
      formData,
      modelId: storeyId,
      historyId: newHistoryId,
      modelType: 'StoreyContents',
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
          general: `Failed to update Storey. Please try again. [1]`,
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
      redirect: `/suite/${suiteId}/storey/${storeyId}/config`,
    }
  } catch {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update Storey. Please try again. [2]',
        },
      },
      success: false,
      redirect: null,
    }
  }
}

export const storeyConfigLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const storey_id = args.params.storey_id
  if (!storey_id) {
    return redirect('/')
  }

  const storey = await getStoreyConfig({
    storeyId: storey_id,
    userId: user.id,
  })

  if (!storey) {
    return redirect('/')
  }

  // A storey can have multiple pkm_history, but for the sake of getting its Multi Contents
  //    we need the History Item that's current and belongs specifically to the Suite
  const historyIdForMultiContent = storey.pkm_history[0]?.history_id ?? null

  const storeyMultiContents: MultiContentReducerItem[] = []
  const resolvedMultiContents: string[] = []

  if (historyIdForMultiContent) {
    const multiContents = await db.pkmContents.findMany({
      where: {
        history_id: historyIdForMultiContent,
        model_id: storey.id,
      },
      orderBy: {
        sort_order: 'asc',
      },
    })

    for (const multiContent of multiContents) {
      storeyMultiContents.push({
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

  // BTTODO - Reception Storey won't be unique. Reception Suite and Reception Space will have the same id
  const images = await getImagesForItem({
    modelId: storey.id,
    userId: user.id,
  })

  return {
    id: storey.id,
    suiteId: storey.suite_id,
    suiteName: storey.suite.name,
    content: storey.content,
    resolvedContent:
      '<div class="*:mb-2"><div>' +
      resolvedMultiContents.join('</div><div>') +
      '</div></div>',
    multiContents: storeyMultiContents,
    description: storey.description,
    name: storey.name,
    historyIdForMultiContent,
    images,
  }
}

export const storeyDashboardLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suite_id = args.params.suite_id
  if (!suite_id) {
    return redirect('/')
  }

  const storey_id = args.params.storey_id
  if (!storey_id) {
    return redirect('/')
  }

  const storeyConfig = await getStoreyConfig({
    storeyId: storey_id,
    userId: user.id,
  })

  if (!storeyConfig) {
    return redirect('/')
  }

  const historyIdForMultiContent = storeyConfig.pkm_history[0]?.history_id

  if (!historyIdForMultiContent) {
    return redirect('/')
  }

  const storeyDashboard = await getStoreyDashboard({
    suiteId: suite_id,
    storeyId: storey_id,
    userId: user.id,
  })

  if (!storeyDashboard) {
    return redirect('/')
  }

  const storeyItemCounts = await getSpaceItemCounts({
    storeyId: storey_id,
    userId: user.id,
  })

  const url = new URL(args.request.url)
  const tab = url.searchParams.get('tab')

  const resolvedContent = await displayStoreyContent({
    storey: {
      id: storeyDashboard.id,
      name: storeyDashboard.name,
      description: storeyDashboard.description,
      content: storeyDashboard.content,
      suite_id: storeyDashboard.suite_id,
      spaces: storeyDashboard.spaces.map((space) => {
        return {
          id: space.id,
          name: space.name,
          description: space.description,
          content: space.content,
          storey_id: storeyDashboard.id,
        }
      }),
    },
    historyIdForMultiContent,
    user,
  })

  return {
    resolvedContent,
    storeyDashboard,
    storeyItemCounts,
    tab: tab ?? 'content',
  }
}

export const storeyConfigNewLoader = async (args: ActionFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suiteId = args.params.suite_id
  if (!suiteId) {
    return redirect('/')
  }

  const suite = await getSuiteForUser({
    userId: user.id,
    suiteId,
  })

  if (!suite) {
    return redirect('/')
  }

  return {
    suiteId: suite.id,
    suiteName: suite.name,
  }
}

export const storeyConfigNewAction = async (
  args: ActionFunctionArgs,
): Promise<StoreyConfigActionResponse> => {
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

  const newStoreyId = crypto.randomUUID()

  transactions.push(
    db.storey.create({
      data: {
        id: newStoreyId,
        suite_id: suiteId,
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
        model_id: newStoreyId,
        model_type: 'StoreyContents',
        is_current: true,
        user_id: user.id,
        suite_id: null,
        storey_id: newStoreyId,
        space_id: null,
      },
    }),
  )

  try {
    const incomingContents = await determineSyncContentsTransactionsByFormData({
      formData,
      modelId: newStoreyId,
      historyId: newHistoryId,
      modelType: 'StoreyContents',
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
            'Failed to create Storey. Please try again in a new window to avoid losing your work. You can copy across the Name, Description, and Contents. You will have to re-upload your images and update the Contents to refer to the new imag locations instead. Apologies for the inconvenience. [1]',
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
      redirect: `/suite/${suiteId}/storey/${newStoreyId}/config`,
    }
  } catch {
    return {
      errors: {
        fieldErrors: {
          general:
            'Failed to create Storey. Please try again in a new window to avoid losing your work. You can copy across the Name, Description, and Contents. You will have to re-upload your images and update the Contents to refer to the new imag locations instead. Apologies for the inconvenience. [2]',
        },
      },
      success: false,
      redirect: null,
    }
  }
}

export const storeyWreckAction = async (args: ActionFunctionArgs) => {
  const suiteId = args.params.suite_id
  const storeyId = args.params.storey_id

  if (!suiteId || !storeyId) {
    return {
      success: false,
      error: 'Storey not found',
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

  return await wreckStorey({
    suiteId,
    storeyId,
    userId: user.id,
  })
}
