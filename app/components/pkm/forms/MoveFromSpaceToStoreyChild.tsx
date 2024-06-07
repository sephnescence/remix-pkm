'use server'

import StoreyTilePreview from '~/components/Suites/forms/StoreyTilePreview'
import { StoreyForMove } from '~/repositories/PkmStoreyRepository'

const MoveFromSpaceToStoreyChild = ({
  suiteId,
  storeyId,
  spaceId,
  modelType,
  modelItemId,
  historyItemId,
  destinationStorey,
}: {
  suiteId: string
  storeyId: string
  spaceId: string
  modelType: string
  modelItemId: string
  historyItemId: string
  destinationStorey: StoreyForMove
}) => {
  const eHistoryItemUrlPart = `/api/history/move/eStoreyId/${storeyId}/eSpaceId/${spaceId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="flex overflow-x-scroll">
        <div key={destinationStorey.id} className="flex-shrink-0">
          <form
            action={`${eHistoryItemUrlPart}/nSuiteId/${destinationStorey.suiteId}/nStoreyId/${destinationStorey.id}`}
            method="POST"
          >
            <button
              type="submit"
              className="text-left"
              title={`Move to ${destinationStorey.name}`}
            >
              <div className="opacity-80 hover:opacity-100 cursor-pointer">
                <StoreyTilePreview
                  suiteId={suiteId}
                  storeyId={storeyId}
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
