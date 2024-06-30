import { useActionData, useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import {
  SpaceUpdateConfigActionResponse,
  spaceConfigLoader,
  spaceUpdateConfigAction,
} from '~/controllers/SpaceController'

export const action = spaceUpdateConfigAction
export const loader = spaceConfigLoader

export default function SpaceConfigEditRoute() {
  const space = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <>
      <SpaceBreadcrumbs
        suiteId={space.suiteId}
        suiteName={space.suiteName}
        storeyId={space.storeyId}
        storeyName={space.storeyName}
        spaceId={space.id}
        spaceName={space.name}
      />
      <SuiteForm
        actionData={actionData as SpaceUpdateConfigActionResponse}
        pageTitle="Edit Space Configuration"
        cancelUrl={`/suite/${space.suiteId}/storey/${space.storeyId}/space/${space.id}/config`}
        defaultName={space.name}
        defaultDescription={space.description}
        defaultMultiContents={space.multiContents}
      />
    </>
  )
}
