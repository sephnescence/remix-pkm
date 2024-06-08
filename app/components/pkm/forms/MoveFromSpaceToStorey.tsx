'use server'

import { StoreyForMove } from '~/repositories/PkmStoreyRepository'
import MoveFromSpaceToStoreyChild from './MoveFromSpaceToStoreyChild'

const MoveFromSpaceToStorey = ({
  suiteId,
  storeyId,
  spaceId,
  modelType,
  modelItemId,
  historyItemId,
  destinationStoreys,
}: {
  suiteId: string
  storeyId: string
  spaceId: string
  modelType: string
  modelItemId: string
  historyItemId: string
  destinationStoreys: StoreyForMove[]
}) => {
  const parentStorey = destinationStoreys.find(
    (storey) => storey.id === storeyId,
  )
  const otherStoreys = destinationStoreys.filter(
    (storey) => storey.id !== storeyId,
  )

  return (
    <>
      {(parentStorey || (otherStoreys && otherStoreys.length > 0)) && (
        <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      )}
      {parentStorey && (
        <div className="mb-2">
          <div className="mb-2 leading-3">Move to parent Storey</div>
          <MoveFromSpaceToStoreyChild
            suiteId={suiteId}
            storeyId={storeyId}
            spaceId={spaceId}
            modelType={modelType}
            modelItemId={modelItemId}
            historyItemId={historyItemId}
            destinationStorey={parentStorey}
          />
        </div>
      )}

      {otherStoreys && otherStoreys.length > 0 && (
        <div className="mb-2">
          <div className="mb-1">Move to another Storey</div>
          {otherStoreys.map((otherStorey) => (
            <div key={otherStorey.id}>
              <MoveFromSpaceToStoreyChild
                suiteId={suiteId}
                storeyId={storeyId}
                spaceId={spaceId}
                modelType={modelType}
                modelItemId={modelItemId}
                historyItemId={historyItemId}
                destinationStorey={otherStorey}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default MoveFromSpaceToStorey
