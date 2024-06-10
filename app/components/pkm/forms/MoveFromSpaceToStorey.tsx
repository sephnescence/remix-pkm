'use server'

import { StoreyForMove } from '~/repositories/PkmStoreyRepository'
import MoveFromSpaceToStoreyChild from './MoveFromSpaceToStoreyChild'

const MoveFromSpaceToStorey = ({
  interactive,
  submitting,
  setSubmitting,
  eSuiteId,
  eStoreyId,
  eSpaceId,
  eModelType,
  eModelId,
  eHistoryId,
  destinationStoreys,
}: {
  interactive: boolean
  submitting: boolean
  setSubmitting: (submitting: boolean) => void
  eSuiteId: string
  eStoreyId: string
  eSpaceId: string
  eModelType: string
  eModelId: string
  eHistoryId: string
  destinationStoreys: StoreyForMove[]
}) => {
  const parentStorey = destinationStoreys.find(
    (storey) => storey.id === eStoreyId,
  )
  const otherStoreys = destinationStoreys.filter(
    (storey) => storey.id !== eStoreyId,
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
            interactive={interactive}
            submitting={submitting}
            setSubmitting={setSubmitting}
            eSuiteId={eSuiteId}
            eStoreyId={eStoreyId}
            eSpaceId={eSpaceId}
            eModelType={eModelType}
            eModelId={eModelId}
            eHistoryId={eHistoryId}
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
                interactive={interactive}
                submitting={submitting}
                setSubmitting={setSubmitting}
                eSuiteId={eSuiteId}
                eStoreyId={eStoreyId}
                eSpaceId={eSpaceId}
                eModelType={eModelType}
                eModelId={eModelId}
                eHistoryId={eHistoryId}
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
