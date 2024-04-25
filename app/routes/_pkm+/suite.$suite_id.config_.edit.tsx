import { useActionData, useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import {
  SuiteUpdateConfigActionResponse,
  suiteConfigLoader,
  suiteUpdateConfigAction,
} from '~/controllers/SuiteController'

export const action = suiteUpdateConfigAction
export const loader = suiteConfigLoader

export default function SuiteConfigEditRoute() {
  const suite = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <SuiteForm
      actionData={actionData as SuiteUpdateConfigActionResponse}
      pageTitle="Edit Suite Configuration"
      pageSubtitle={suite.name}
      cancelUrl={`/suite/${suite.id}/config`}
      defaultName={suite.name}
      defaultDescription={suite.description}
      defaultContent={suite.content}
    />
  )
}
