'use server'

import {
  getStoreyItemCounts,
  getStoreysForUser,
} from '~/repositories/PkmStoreyRepository'
import MoveFromSpaceToStoreyChild from './MoveFromSpaceToStoreyChild'

const MoveFromSpaceToStorey = async ({
  userId,
  suiteId,
  storeyId,
  spaceId,
  modelType,
  modelItemId,
  historyItemId,
}: {
  userId: string
  suiteId: string
  storeyId: string
  spaceId: string
  modelType: string
  modelItemId: string
  historyItemId: string
}) => {
  const storeyDashboard = await getStoreysForUser({
    userId,
  })

  const storeyItemCounts = await getStoreyItemCounts({
    userId,
    suiteId,
  })

  const parentStorey = storeyDashboard.find((storey) => storey.id === storeyId)
  const otherStoreys = storeyDashboard.filter(
    (storey) => storey.id !== storeyId,
  )

  return (
    <>
      {(parentStorey || (otherStoreys && otherStoreys.length > 0)) && (
        <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      )}
      {parentStorey && (
        <div className="mb-2">
          <div className="mb-2 leading-3">Move to Parent Storey</div>
          <MoveFromSpaceToStoreyChild
            suiteId={suiteId}
            storeyId={storeyId}
            spaceId={spaceId}
            modelType={modelType}
            modelItemId={modelItemId}
            historyItemId={historyItemId}
            storeys={[parentStorey]}
            storeyItemCounts={storeyItemCounts}
          />
        </div>
      )}

      {otherStoreys && otherStoreys.length > 0 && (
        <div className="mb-2">
          <div className="mb-1">Move to Another Storey</div>
          <MoveFromSpaceToStoreyChild
            suiteId={suiteId}
            storeyId={storeyId}
            spaceId={spaceId}
            modelType={modelType}
            modelItemId={modelItemId}
            historyItemId={historyItemId}
            storeys={otherStoreys}
            storeyItemCounts={storeyItemCounts}
          />
        </div>
      )}
    </>
  )
}

export default MoveFromSpaceToStorey
