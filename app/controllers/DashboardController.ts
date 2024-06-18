import { getClerkId } from '@/utils/auth'
import { LoaderFunctionArgs, TypedResponse, redirect } from '@remix-run/node'
import { PkmHistoryForDashboard } from '~/repositories/PkmHistoryRepository'
import { getUserDashboardByClerkId } from '~/repositories/PkmUserRepository'
// import { sessionStorage } from '~/session/session.server'

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

  // const cookieSession = await sessionStorage.getSession(
  //   args.request.headers.get('cookie'),
  // )
  // const userId = cookieSession.get('userId')
  // console.log('User ID from cookie', userId)

  const user = await getUserDashboardByClerkId(clerkId)

  if (!user) {
    return redirect('/')
  }

  return { history: user.pkm_history }
}
