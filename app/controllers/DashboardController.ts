import { getClerkId } from '@/utils/auth'
import { LoaderFunctionArgs, TypedResponse, redirect } from '@remix-run/node'
import { PkmHistoryForDashboard } from '~/repositories/PkmHistoryRepository'
import { getUserDashboardByClerkId } from '~/repositories/PkmUserRepository'

export type DashboardInboxLoaderResponse =
  | PkmHistoryForDashboard
  | TypedResponse<never>
  | null

export const dashboardIndexLoader = async (
  args: LoaderFunctionArgs,
): Promise<DashboardInboxLoaderResponse> => {
  const clerkId = await getClerkId(args)
  if (!clerkId) {
    return redirect('/')
  }

  const user = await getUserDashboardByClerkId(clerkId)

  if (!user) {
    return redirect('/')
  }

  return { history: user.pkm_history }
}
