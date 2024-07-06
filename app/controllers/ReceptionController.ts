import { redirect } from '@remix-run/node'
import {
  defaultSpaceId,
  defaultStoreyId,
  defaultSuiteId,
} from '~/repositories/PkmUserRepository'

export const receptionLoader = () => {
  return redirect(
    `/suite/${defaultSuiteId}/storey/${defaultStoreyId}/space/${defaultSpaceId}/dashboard?tab=content`,
  )
}
