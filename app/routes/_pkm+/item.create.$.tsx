import { useLoaderData } from '@remix-run/react'
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
  const { pageTitle, cancelUrl, apiEndpoint } =
    loaderData as CreateItemLoaderResponse

  return (
    <>
      <ItemForm
        pageTitle={pageTitle}
        cancelUrl={cancelUrl}
        apiEndpoint={apiEndpoint}
        apiMethod="POST"
        // defaultContent={'IMPLEMENT PARENT LEVEL CONFIGURATION OF CHILDREN ITEMS'}
        // defaultName={'IMPLEMENT PARENT LEVEL CONFIGURATION OF CHILDREN ITEMS'}
        // defaultSummary={'IMPLEMENT PARENT LEVEL CONFIGURATION OF CHILDREN ITEMS'}
      />
    </>
  )
}
