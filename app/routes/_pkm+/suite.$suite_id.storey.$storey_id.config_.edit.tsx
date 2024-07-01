import { useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import { storeyConfigLoader } from '~/controllers/StoreyController'

export const loader = storeyConfigLoader

export default function StoreyConfigEditRoute() {
  const storey = useLoaderData<typeof loader>()

  return (
    <>
      <StoreyBreadcrumbs
        suiteId={storey.suiteId}
        suiteName={storey.suiteName}
        storeyId={storey.id}
        storeyName={storey.name}
      />
      <SuiteForm
        pageTitle="Edit Storey Configuration"
        apiEndpoint={`/api/history/suite/edit/eSuiteId/${storey.suiteId}/eStoreyId/${storey.id}/eHistoryId/${storey.historyIdForMultiContent}`}
        cancelUrl={`/suite/${storey.suiteId}/storey/${storey.id}/config`}
        defaultName={storey.name}
        defaultDescription={storey.description}
        existingMultiContents={storey.multiContents}
      />
    </>
  )
}
