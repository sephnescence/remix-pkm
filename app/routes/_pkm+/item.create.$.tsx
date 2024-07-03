import { useLoaderData } from '@remix-run/react'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import ItemForm from '~/components/pkm/forms/ItemForm'
import {
  CreateItemLoaderResponse,
  createItemLoader,
} from '~/controllers/ItemController'

// BTTODO - Essentially just validate that the Suite, etc. exists and is owned by you
// Also this time be sure to put the controller stuff into a repo method, unlike what you did for edit
// If you can spend the time cleaning up edit as well that would be good
export const loader = createItemLoader

export default function ItemRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const {
    pageTitle,
    cancelUrl,
    apiEndpoint,
    locationName,
    suite,
    storey,
    space,
  } = loaderData as CreateItemLoaderResponse

  return (
    <>
      {locationName === 'Suite' && suite && (
        <SuiteBreadcrumbs suiteId={suite.id} suiteName={suite.name} />
      )}
      {locationName === 'Storey' && suite && storey && (
        <StoreyBreadcrumbs
          suiteId={suite.id}
          suiteName={suite.name}
          storeyId={storey.id}
          storeyName={storey.name}
        />
      )}
      {locationName === 'Space' && suite && storey && space && (
        <SpaceBreadcrumbs
          suiteId={suite.id}
          suiteName={suite.name}
          storeyId={storey.id}
          storeyName={storey.name}
          spaceId={space.id}
          spaceName={space.name}
        />
      )}
      <ItemForm
        pageTitle={pageTitle}
        cancelUrl={cancelUrl}
        apiEndpoint={apiEndpoint}
        // defaultContent={'IMPLEMENT PARENT LEVEL CONFIGURATION OF CHILDREN ITEMS'}
        // defaultName={'IMPLEMENT PARENT LEVEL CONFIGURATION OF CHILDREN ITEMS'}
        // defaultSummary={'IMPLEMENT PARENT LEVEL CONFIGURATION OF CHILDREN ITEMS'}
      />
    </>
  )
}
