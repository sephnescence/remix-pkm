import { LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getClerkId } from '@/utils/auth'
import { getUserDashboardByClerkId } from '~/repositories/PkmUserRepository'
import { sessionStorage } from '~/session/session.server'

export const receptionLoader = async (args: LoaderFunctionArgs) => {
  const clerkId = await getClerkId(args)
  if (!clerkId) {
    return redirect('/')
  }

  const cookieSession = await sessionStorage.getSession(
    args.request.headers.get('cookie'),
  )

  const userId = cookieSession.get('userId')

  if (!userId) {
    return redirect('/')
  }

  const user = await getUserDashboardByClerkId(clerkId)

  if (!user) {
    return redirect('/')
  }

  return redirect(
    `/suite/${userId}/storey/${userId}/space/${userId}/dashboard?tab=content`,
  )
}
