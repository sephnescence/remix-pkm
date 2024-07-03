import SuiteForm from '~/components/Suites/forms/SuiteForm'
import SuiteTopLevelBreadcrumbs from '~/components/nav/SuiteTopLevelBreadcrumbs'

export default function SuiteConfigNewRoute() {
  return (
    <>
      <SuiteTopLevelBreadcrumbs />
      <SuiteForm
        pageTitle="Configure New Suite"
        apiEndpoint={`/api/history/suite/create`}
        cancelUrl="/suites"
      />
    </>
  )
}
