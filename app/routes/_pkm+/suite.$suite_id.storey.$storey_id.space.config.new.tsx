import { useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import { spaceConfigNewLoader } from '~/controllers/SpaceController'

export const loader = spaceConfigNewLoader

export default function StoreyConfigNewRoute() {
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
        pageTitle="Configure New Space"
        apiEndpoint={`/api/history/suite/${suiteId}/storey/${storeyId}/space/create`}
        cancelUrl={`/suite/${suiteId}/storey/${storeyId}/dashboard?tab=spaces`}
      />
    </>
  )
}
