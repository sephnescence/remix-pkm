import { useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import { suiteConfigLoader } from '~/controllers/SuiteController'

export const loader = suiteConfigLoader

export default function SuiteConfigEditRoute() {
  const suite = useLoaderData<typeof loader>()

  return (
    <>
      <SuiteBreadcrumbs suiteId={suite.id} suiteName={suite.name} />
      <SuiteForm
        pageTitle="Edit Suite Configuration"
        apiEndpoint={`/api/history/suite/edit/eSuiteId/${suite.id}/eHistoryId/${suite.historyIdForMultiContent}`}
        cancelUrl={`/suite/${suite.id}/config`}
        defaultName={suite.name}
        defaultDescription={suite.description}
        existingMultiContents={suite.multiContents}
      />
    </>
  )
}
