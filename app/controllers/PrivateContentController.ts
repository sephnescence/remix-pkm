import { getUserAuth } from '@/utils/auth'
import {
  autoResolveContent,
  looselyCheckArrayParamsAreValid,
} from '@/utils/content'
import { LoaderFunctionArgs, redirect } from '@remix-run/node'

export const privateContentViewLoader = async (
  loaderArgs: LoaderFunctionArgs,
) => {
  // Would like the pseudo code below, but autoResolveContent gives a lot for free, though
  //  I guess there's nothing stopping me from getting the necessary arguments out of the db. For now

  // Drastically simplified URLs
  // | It will take eSuiteId/id,
  // | It will take eSpaceId/id,
  // | It will take eStoreyId/id,
  // |--> The endpoint will note that it's missing eModelId and instead return the content from a Suite, Storey, or Space
  // |--> If I ever allow for moving Suites/Storeys/Spaces, this functionality will break
  // | It will take eModelId/id,
  // |--> Always-Latest
  // | It will take eHistoryId/id,
  // |--> Permalink

  const user = await getUserAuth(loaderArgs)
  if (!user) return redirect('/')

  const params = loaderArgs.params['*']
  if (!params) return redirect('/')

  try {
    const args = looselyCheckArrayParamsAreValid(params.split('/'))
    const resolvedContent = await autoResolveContent(args, user)

    return {
      resolvedContent,
    }
  } catch {
    redirect('/')
  }
}
