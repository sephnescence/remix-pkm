import { feModelTypeMap } from '@/utils/apiUtils'
import { useLoaderData } from '@remix-run/react'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import ItemForm from '~/components/pkm/forms/ItemForm'
import { ItemLoaderResponse, itemLoader } from '~/controllers/ItemController'

export const loader = itemLoader

export default function ItemRoute() {
  const loaderData = useLoaderData<typeof loader>()

  const { args, history, images, item } = loaderData as ItemLoaderResponse

  return (
    <>
      {args.itemLocationName === 'Suite' && history.historyItem!.suite && (
        <SuiteBreadcrumbs
          suiteId={args.conformedArgs.eSuiteId ?? ''}
          suiteName={history.historyItem!.suite.name}
        />
      )}
      {args.itemLocationName === 'Storey' && history.historyItem!.storey && (
        <StoreyBreadcrumbs
          suiteId={args.conformedArgs.eSuiteId ?? ''}
          suiteName={history.historyItem!.storey.suite.name}
          storeyId={args.conformedArgs.eStoreyId ?? ''}
          storeyName={history.historyItem!.storey.name}
        />
      )}
      {args.itemLocationName === 'Space' && history.historyItem!.space && (
        <SpaceBreadcrumbs
          suiteId={args.conformedArgs.eSuiteId ?? ''}
          suiteName={`${history.historyItem!.space.storey.suite.name}`}
          storeyId={args.conformedArgs.eStoreyId ?? ''}
          storeyName={history.historyItem!.space.storey.name}
          spaceId={args.conformedArgs.eSpaceId ?? ''}
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
