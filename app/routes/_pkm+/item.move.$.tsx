// In NextJS, the MoveTo and friends components determined where the Item was and loaded the appropriate data
// Can't do that in Remix, as the loader needs to load all data the the component will need

import { useLoaderData } from '@remix-run/react'
import {
  ItemMoveLoaderResponse,
  itemMoveLoader,
} from '~/controllers/ItemController'

export const loader = itemMoveLoader

export default function MoveItemRoute() {
  const loaderData = useLoaderData<typeof loader>()

  // args: ConformArrayArgsToObjectResponse
  // history: Awaited<ReturnType<typeof getCurrentHistoryItemForUser>>
  // item: {
  //   name: string
  //   content: string
  //   summary: string
  // }
  // itemLocation: string
  // suitesForMove: SuiteForMove[] | null
  // storeysForMove: StoreyForMove[] | null
  // spacesForMove: SpaceForMove[] | null
  const { args, history } = loaderData as ItemMoveLoaderResponse

  return (
    <>
      {args.itemLocationName === 'Suite' && history.historyItem!.suite && (
        <div>Suite TODO</div>
        // <SuiteMoveTo />
      )}
      {args.itemLocationName === 'Storey' && history.historyItem!.storey && (
        <div>Storey TODO</div>
        // <StoreyMoveTo />
      )}
      {args.itemLocationName === 'Space' && history.historyItem!.space && (
        <div>Space TODO</div>
        // <SpaceMoveTo />
      )}
    </>
  )
}
