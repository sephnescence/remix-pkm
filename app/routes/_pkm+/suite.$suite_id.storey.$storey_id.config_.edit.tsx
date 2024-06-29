import { useActionData, useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import {
  StoreyUpdateConfigActionResponse,
  storeyConfigLoader,
  storeyUpdateConfigAction,
} from '~/controllers/StoreyController'

export const action = storeyUpdateConfigAction
export const loader = storeyConfigLoader

export default function StoreyConfigEditRoute() {
  const storey = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <>
      <StoreyBreadcrumbs
        suiteId={storey.suiteId}
        suiteName={storey.suiteName}
        storeyId={storey.id}
        storeyName={storey.name}
      />
      <SuiteForm
        actionData={actionData as StoreyUpdateConfigActionResponse}
        pageTitle="Edit Storey Configuration"
        cancelUrl={`/suite/${storey.suiteId}/storey/${storey.id}/config`}
        defaultName={storey.name}
        defaultDescription={storey.description}
        defaultMultiContents={storey.multiContents}
      />
    </>
  )
}
