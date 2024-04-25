import { useActionData, useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import {
  StoreyUpdateConfigActionResponse,
  storeyConfigNewAction,
  storeyConfigNewLoader,
} from '~/controllers/StoreyController'

export const action = storeyConfigNewAction
export const loader = storeyConfigNewLoader

export default function StoreyConfigNewRoute() {
  const actionData = useActionData<typeof action>()
  const { suiteId, suiteName } = useLoaderData<typeof loader>()

  return (
    <>
      <SuiteBreadcrumbs suiteId={suiteId} suiteName={suiteName} />
      <SuiteForm
        actionData={actionData as StoreyUpdateConfigActionResponse}
        pageTitle="Configure New Storey"
        cancelUrl={`/suite/${suiteId}/dashboard?tab=storeys`}
      />
    </>
  )
}
