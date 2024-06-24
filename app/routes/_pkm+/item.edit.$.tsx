import { feModelTypeMap } from '@/utils/apiUtils'
import { useLoaderData } from '@remix-run/react'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import ItemForm from '~/components/pkm/forms/ItemForm'
import { ItemLoaderResponse, itemLoader } from '~/controllers/ItemController'

export const loader = itemLoader

export default function EditItemRoute() {
  const loaderData = useLoaderData<typeof loader>()

  const { args, history, images, item } = loaderData as ItemLoaderResponse

  return (
    <>
      {args.itemLocationName === 'Suite' && history.historyItem!.suite && (
        <SuiteBreadcrumbs
          suiteId={history.historyItem!.suite.id}
          suiteName={history.historyItem!.suite.name}
        />
      )}
      {args.itemLocationName === 'Storey' && history.historyItem!.storey && (
        <StoreyBreadcrumbs
          suiteId={history.historyItem!.storey.suite.id}
          suiteName={history.historyItem!.storey.suite.name}
          storeyId={history.historyItem!.storey.id}
          storeyName={history.historyItem!.storey.name}
        />
      )}
      {args.itemLocationName === 'Space' && history.historyItem!.space && (
        <SpaceBreadcrumbs
          suiteId={`${history.historyItem!.space.storey.suite.id}`}
          suiteName={`${history.historyItem!.space.storey.suite.name}`}
          storeyId={history.historyItem!.space.storey.id}
          storeyName={history.historyItem!.space.storey.name}
          spaceId={history.historyItem!.space.id}
          spaceName={history.historyItem!.space.name}
        />
      )}
      <ItemForm
        pageTitle={`Edit ${args.itemLocationName} ${feModelTypeMap[args.conformedArgs.eModelType]}  Item`}
        cancelUrl={args.feViewUrl}
        apiEndpoint={args.apiEditUrl}
        apiMethod="POST"
        defaultContent={item.content}
        defaultName={item.name}
        defaultSummary={item.summary}
        images={images}
      />
    </>
  )
}
