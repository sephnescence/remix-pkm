import { useActionData, useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
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
    <>
      <SuiteBreadcrumbs suiteId={suite.id} suiteName={suite.name} />
      <SuiteForm
        actionData={actionData as SuiteUpdateConfigActionResponse}
        pageTitle="Edit Suite Configuration"
        cancelUrl={`/suite/${suite.id}/config`}
        defaultName={suite.name}
        defaultDescription={suite.description}
        defaultContent={suite.content}
      />
    </>
  )
}
