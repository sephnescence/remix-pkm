import { useActionData, useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import {
  SpaceUpdateConfigActionResponse,
  spaceConfigNewAction,
  spaceConfigNewLoader,
} from '~/controllers/SpaceController'

export const action = spaceConfigNewAction
export const loader = spaceConfigNewLoader

export default function StoreyConfigNewRoute() {
  const actionData = useActionData<typeof action>()
  const { suiteId, suiteName, storeyId, storeyName } =
    useLoaderData<typeof loader>()

  return (
    <>
      <StoreyBreadcrumbs
        suiteId={suiteId}
        suiteName={suiteName}
        storeyId={storeyId}
        storeyName={storeyName}
      />
      <SuiteForm
        actionData={actionData as SpaceUpdateConfigActionResponse}
        pageTitle="Configure New Space"
        cancelUrl={`/suite/${suiteId}/storey/${storeyId}/dashboard?tab=spaces`}
      />
    </>
  )
}
