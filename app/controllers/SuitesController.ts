import { getUserAuth } from '@/utils/auth'
import { LoaderFunctionArgs, TypedResponse, redirect } from '@remix-run/node'
import {
  ItemCountRow,
  getSuiteItemCounts,
  getSuitesForUser,
} from '~/repositories/PkmSuiteRepository'

export type SuiteConfigLoaderResponse = {
  suites: Awaited<ReturnType<typeof getSuitesForUser>>
  suiteItemCounts: { [key: string]: ItemCountRow }
}

export const suitesConfigLoader = async (
  args: LoaderFunctionArgs,
): Promise<SuiteConfigLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const suites = await getSuitesForUser({
    userId: user.id,
  })

  const suiteItemCounts = await getSuiteItemCounts({
    userId: user.id,
  })

  return { suites, suiteItemCounts }
}
