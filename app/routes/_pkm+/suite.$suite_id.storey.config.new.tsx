import { useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import { storeyConfigNewLoader } from '~/controllers/StoreyController'

export const loader = storeyConfigNewLoader

export default function StoreyConfigNewRoute() {
  const { suiteId, suiteName } = useLoaderData<typeof loader>()

  return (
    <>
      <SuiteBreadcrumbs suiteId={suiteId} suiteName={suiteName} />
      <SuiteForm
        pageTitle="Configure New Storey"
        apiEndpoint={`/api/history/suite/create/eSuiteId/${suiteId}`}
        cancelUrl={`/suite/${suiteId}/dashboard?tab=storeys`}
      />
    </>
  )
}
