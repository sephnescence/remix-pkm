'use server'

import StoreyTilePreview from '~/components/Suites/forms/StoreyTilePreview'
import { StoreyForMove } from '~/repositories/PkmStoreyRepository'
import { handleMoveToSubmit } from './ItemForm'

const MoveFromSpaceToStoreyChild = ({
  interactive,
  submitting,
  setSubmitting,
  eSuiteId,
  eStoreyId,
  eSpaceId,
  eModelType,
  eModelId,
  eHistoryId,
  destinationStorey,
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
  destinationStorey: StoreyForMove
}) => {
  return (
    <>
      <div className="flex overflow-x-scroll">
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
                  eSpaceId,
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
      </div>
    </>
  )
}

export default MoveFromSpaceToStoreyChild
