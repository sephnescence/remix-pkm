import { useLoaderData } from '@remix-run/react'
import SuiteForm from '~/components/Suites/forms/SuiteForm'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import { spaceConfigLoader } from '~/controllers/SpaceController'

export const loader = spaceConfigLoader

export default function SpaceConfigEditRoute() {
  const space = useLoaderData<typeof loader>()

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
        pageTitle="Edit Space Configuration"
        apiEndpoint={`/api/history/suite/edit/eSuiteId/${space.suiteId}/eStoreyId/${space.storeyId}/eHistoryId/${space.historyIdForMultiContent}`}
        cancelUrl={`/suite/${space.suiteId}/storey/${space.storeyId}/space/${space.id}/config`}
        defaultName={space.name}
        defaultDescription={space.description}
        existingMultiContents={space.multiContents}
      />
    </>
  )
}
