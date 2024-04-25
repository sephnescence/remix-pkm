import { useActionData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import {
  SuiteUpdateConfigActionResponse,
  suiteConfigNewAction,
} from '~/controllers/SuiteController'

export const action = suiteConfigNewAction

export default function SuiteConfigNewRoute() {
  const actionData = useActionData<typeof action>()

  return (
    <SuiteForm
      actionData={actionData as SuiteUpdateConfigActionResponse}
      pageTitle="Configure New Suite"
      pageSubtitle={null}
      cancelUrl="/suites"
    />
  )
}
