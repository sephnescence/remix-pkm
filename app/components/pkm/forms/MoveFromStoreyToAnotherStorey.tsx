'use server'

import StoreyTilePreview from '~/components/Suites/forms/StoreyTilePreview'
import { StoreyForMove } from '~/repositories/PkmStoreyRepository'
import { handleMoveToSubmit } from './ItemForm'

const MoveFromStoreyToAnotherStorey = ({
  interactive,
  submitting,
  setSubmitting,
  eSuiteId,
  eStoreyId,
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
  eModelType: string
  eModelId: string
  eHistoryId: string
  destinationStoreys: StoreyForMove[]
}) => {
  const otherStoreys = destinationStoreys.filter(
    (storey) => storey.id !== eStoreyId,
  )

  if (otherStoreys.length === 0) {
    return null
  }

  return (
    <>
      <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      <div className="mb-2">
        <div className="mb-2 leading-3">Move to another Storey</div>
        <div className="flex overflow-x-scroll">
          {otherStoreys.map((destinationStorey) => {
            return (
              <div key={destinationStorey.id} className="flex-shrink-0">
                <form
                  id={`move-to-storey-${destinationStorey.id}`}
                  onSubmit={() => false}
                >
                  <button
                    type="button"
                    className="text-left"
                    title={`Move to ${destinationStorey.name}`}
                    onClick={() => {
                      handleMoveToSubmit({
                        formId: `move-to-storey-${destinationStorey.id}`,
                        eHistoryId,
                        eModelType,
                        eModelId,
                        nModelType: eModelType, // Utilise the icons to drop straight into the desired Model Type
                        setSubmitting,
                        eSuiteId,
                        eStoreyId,
                        eSpaceId: null,
                        nSuiteId: destinationStorey.suiteId,
                        nStoreyId: destinationStorey.id,
                        nSpaceId: null,
                      })
                    }}
                    disabled={!interactive || submitting}
                  >
                    <div className="opacity-80 hover:opacity-100 cursor-pointer">
                      <StoreyTilePreview
                        suiteId={eSuiteId}
                        storeyId={eStoreyId}
                        name={destinationStorey.name}
                        description={destinationStorey.description}
                        spaceCount={destinationStorey.spaces}
                        storeyItemCount={destinationStorey.counts}
                      />
                    </div>
                  </button>
                </form>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default MoveFromStoreyToAnotherStorey
