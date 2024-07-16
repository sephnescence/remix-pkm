import { getUserAuth } from '@/utils/auth'
import { displayContent, displaySuiteContent } from '@/utils/content'
import { db } from '@/utils/db'
import { Prisma } from '@prisma/client'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { MultiContentReducerItem } from '~/hooks/useMultiContentsReducer'
import { getImagesForItem } from '~/repositories/PkmImageRepository'
import { getStoreyItemCounts } from '~/repositories/PkmStoreyRepository'
import {
  getSuiteConfig,
  getSuiteDashboard,
} from '~/repositories/PkmSuiteRepository'
import { determineSyncContentsTransactionsByFormData } from '~/services/PkmContentService'
import { wreckSuite } from '~/services/WreckerService'

export type SuiteConfigActionResponse = {
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

export const suiteUpdateConfigAction = async (
  args: ActionFunctionArgs,
): Promise<SuiteConfigActionResponse> => {
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

  const existingHistoryIdForMultiContent =
    suite.pkm_history[0]?.history_id ?? null

  // When loading a Suite now, it should auto heal if it doesn't have an existing history
  if (!existingHistoryIdForMultiContent) {
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

  const newHistoryId = crypto.randomUUID()

  const transactions: Prisma.PrismaPromise<unknown>[] = [
    db.suite.update({
      where: {
        user_id: user.id,
        id: suite.id,
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
        model_id: suite.id,
        model_type: 'SuiteContents',
        is_current: true,
        user_id: user.id,
        suite_id: suite.id,
        storey_id: null,
        space_id: null,
      },
    }),
  ]

  try {
    const incomingContents = await determineSyncContentsTransactionsByFormData({
      formData,
      modelId: suiteId,
      historyId: newHistoryId,
      modelType: 'SuiteContents',
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
          general: `Failed to update Suite. Please try again. [1]`,
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
      redirect: `/suite/${suiteId}/config`,
    }
  } catch {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update Suite. Please try again. [2]',
        },
      },
      success: false,
      redirect: null,
    }
  }
}

export const suiteConfigLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suiteId = args.params.suite_id
  if (!suiteId) {
    return redirect('/')
  }

  const suite = await getSuiteConfig({
    suiteId,
    userId: user.id,
  })

  if (!suite) {
    return redirect('/')
  }

  // A suite can have multiple pkm_history, but for the sake of getting its Multi Contents
  //    we need the History Item that's current and belongs specifically to the Suite
  const historyIdForMultiContent = suite.pkm_history[0]?.history_id ?? null

  const suiteMultiContents: MultiContentReducerItem[] = []
  const resolvedMultiContents: string[] = []

  if (historyIdForMultiContent) {
    const multiContents = await db.pkmContents.findMany({
      where: {
        history_id: historyIdForMultiContent,
        model_id: suite.id,
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

  // BTTODO - Reception Suite won't be unique. Reception Storey and Reception Space will have the same id
  const images = await getImagesForItem({
    modelId: suite.id,
    userId: user.id,
  })

  return {
    id: suite.id,
    content: suite.content,
    // Interesting when you put it this way. It _does_ make sense to define the glue between multi contents
    resolvedContent:
      '<div class="*:mb-2"><div>' +
      resolvedMultiContents.join('</div><div>') +
      '</div></div>',
    multiContents: suiteMultiContents,
    description: suite.description,
    name: suite.name,
    historyIdForMultiContent,
    images,
  }
}

export const suiteDashboardLoader = async (args: LoaderFunctionArgs) => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suiteId = args.params.suite_id
  if (!suiteId) {
    return redirect('/')
  }

  const suiteConfig = await getSuiteConfig({
    suiteId,
    userId: user.id,
  })

  if (!suiteConfig) {
    return redirect('/')
  }

  const historyIdForMultiContent = suiteConfig.pkm_history[0]?.history_id

  if (!historyIdForMultiContent) {
    return redirect('/')
  }

  const suite = await getSuiteDashboard({
    suiteId,
    userId: user.id,
  })

  if (!suite) {
    return redirect('/')
  }

  const suiteItemCounts = await getStoreyItemCounts({
    suiteId,
    userId: user.id,
  })

  const url = new URL(args.request.url)
  const tab = url.searchParams.get('tab')

  const resolvedContent = await displaySuiteContent({
    suite: {
      id: suite.id,
      name: suite.name,
      description: suite.description,
      content: suite.content,
      storeys: suite.storeys.map((storey) => {
        return {
          id: storey.id,
          name: storey.name,
          description: storey.description,
          content: storey.content,
          suite_id: storey.suite_id,
          spaces: storey.spaces.map((space) => {
            return {
              id: space.id,
              name: space.name,
              description: space.description,
              content: space.content,
              storey_id: storey.id,
            }
          }),
        }
      }),
    },
    historyIdForMultiContent,
    user,
  })

  return {
    suiteDashboard: suite,
    resolvedContent,
    suiteItemCounts,
    tab: tab ?? 'content',
  }
}

export const suiteConfigNewAction = async (
  args: ActionFunctionArgs,
): Promise<SuiteConfigActionResponse> => {
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

  const newSuiteId = crypto.randomUUID()

  transactions.push(
    db.suite.create({
      data: {
        id: newSuiteId,
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
        model_id: newSuiteId,
        model_type: 'SuiteContents',
        is_current: true,
        user_id: user.id,
        suite_id: newSuiteId,
        storey_id: null,
        space_id: null,
      },
    }),
  )

  try {
    const incomingContents = await determineSyncContentsTransactionsByFormData({
      formData,
      modelId: newSuiteId,
      historyId: newHistoryId,
      modelType: 'SuiteContents',
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
          general: `Failed to store Suite. Please try again. [1]`,
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
      redirect: `/suite/${newSuiteId}/config`,
    }
  } catch {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to store Suite. Please try again. [2]',
        },
      },
      success: false,
      redirect: null,
    }
  }
}

export const suiteWreckAction = async (args: ActionFunctionArgs) => {
  const suiteId = args.params.suite_id

  if (!suiteId) {
    return {
      success: false,
      error: 'Suite not found',
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

  return await wreckSuite({
    suiteId,
    userId: user.id,
  })
}
