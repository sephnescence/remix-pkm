import { useActionData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import SuiteTopLevelBreadcrumbs from '~/components/nav/SuiteTopLevelBreadcrumbs'
import {
  SuiteUpdateConfigActionResponse,
  suiteConfigNewAction,
} from '~/controllers/SuiteController'

export const action = suiteConfigNewAction

export default function SuiteConfigNewRoute() {
  const actionData = useActionData<typeof action>()

  return (
    <>
      <SuiteTopLevelBreadcrumbs />
      <SuiteForm
        actionData={actionData as SuiteUpdateConfigActionResponse}
        pageTitle="Configure New Suite"
        cancelUrl="/suites"
      />
    </>
  )
}
