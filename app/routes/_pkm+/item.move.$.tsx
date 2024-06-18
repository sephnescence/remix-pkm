// In NextJS, the MoveTo and friends components determined where the Item was and loaded the appropriate data
// Can't do that in Remix, as the loader needs to load all data the the component will need

import { useLoaderData } from '@remix-run/react'
import SpaceMoveTo from '~/components/pkm/forms/SpaceMoveTo'
import StoreyMoveTo from '~/components/pkm/forms/StoreyMoveTo'
import SuiteMoveTo from '~/components/pkm/forms/SuiteMoveTo'
import {
  ItemMoveLoaderResponse,
  itemMoveLoader,
} from '~/controllers/ItemController'

export const loader = itemMoveLoader

export default function MoveItemRoute() {
  const loaderData = useLoaderData<typeof loader>()

  const { args, history, spacesForMove, storeysForMove, suitesForMove } =
    loaderData as ItemMoveLoaderResponse

  return (
    <>
      {args.itemLocationName === 'Suite' && history.historyItem!.suite && (
        <SuiteMoveTo
          eSuiteId={args.conformedArgs.eSuiteId ?? 'SUITE ID UNKNOWN'}
          suite={{
            name: history.historyItem?.suite.name ?? 'SUITE NAME UNKNOWN',
          }}
          eModelId={args.conformedArgs.eModelId}
          eModelType={args.conformedArgs.eModelType}
          eHistoryId={args.conformedArgs.eHistoryId}
          spacesForMove={spacesForMove}
          storeysForMove={storeysForMove}
          suitesForMove={suitesForMove}
        />
      )}
      {args.itemLocationName === 'Storey' && history.historyItem!.storey && (
        <StoreyMoveTo
          eSuiteId={args.conformedArgs.eSuiteId ?? 'SUITE ID UNKNOWN'}
          suite={{
            name:
              history.historyItem?.storey.suite.name ?? 'SUITE NAME UNKNOWN',
          }}
          eStoreyId={args.conformedArgs.eStoreyId ?? 'STOREY ID UNKNOWN'}
          storey={{
            name: history.historyItem?.storey.name ?? 'STOREY NAME UNKNOWN',
          }}
          eModelId={args.conformedArgs.eModelId}
          eModelType={args.conformedArgs.eModelType}
          eHistoryId={args.conformedArgs.eHistoryId}
          spacesForMove={spacesForMove}
          storeysForMove={storeysForMove}
          suitesForMove={suitesForMove}
        />
      )}
      {args.itemLocationName === 'Space' && history.historyItem!.space && (
        <SpaceMoveTo
          suiteId={args.conformedArgs.eSuiteId ?? 'SUITE ID UNKNOWN'}
          suite={{
            name:
              history.historyItem?.space.storey.suite.name ??
              'SUITE NAME UNKNOWN',
          }}
          storeyId={args.conformedArgs.eStoreyId ?? 'STOREY ID UNKNOWN'}
          storey={{
            name:
              history.historyItem?.space.storey.name ?? 'STOREY NAME UNKNOWN',
          }}
          spaceId={args.conformedArgs.eSpaceId ?? 'SPACE ID UNKNOWN'}
          space={{
            name: history.historyItem?.space.name ?? 'SPACE NAME UNKNOWN',
          }}
          modelId={args.conformedArgs.eModelId}
          modelType={args.conformedArgs.eModelType}
          historyId={args.conformedArgs.eHistoryId}
          spacesForMove={spacesForMove}
          storeysForMove={storeysForMove}
          suitesForMove={suitesForMove}
        />
      )}
    </>
  )
}
