'use server'

import StoreyTilePreview from '~/components/Suites/forms/StoreyTilePreview'
import { StoreyForMove } from '~/repositories/PkmStoreyRepository'

const MoveFromStoreyToAnotherStorey = ({
  suiteId,
  storeyId,
  modelType,
  modelItemId,
  historyItemId,
  destinationStoreys,
}: {
  suiteId: string
  storeyId: string
  modelType: string
  modelItemId: string
  historyItemId: string
  destinationStoreys: StoreyForMove[]
}) => {
  const otherStoreys = destinationStoreys.filter(
    (storey) => storey.id !== storeyId,
  )

  if (otherStoreys.length === 0) {
    return null
  }

  const eHistoryItemUrlPart = `/api/history/move/eSuiteId/${suiteId}/eStoreyId/${storeyId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      <div className="mb-2">
        <div className="mb-2 leading-3">Move to Another Storey</div>
        <div className="flex overflow-x-scroll">
          {otherStoreys.map((storey) => {
            if (
              !storey ||
              !storey.id ||
              !storey.name ||
              !storey.description ||
              !storey.suiteId
            ) {
              return null
            }

            return (
              <div key={storey.id} className="flex-shrink-0">
                <form
                  action={`${eHistoryItemUrlPart}/nSuiteId/${storey.suiteId}/nStoreyId/${storey.id}`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className="text-left"
                    title={`Move to ${storey.name}`}
                  >
                    <div className="opacity-80 hover:opacity-100 cursor-pointer">
                      <StoreyTilePreview
                        suiteId={suiteId}
                        storeyId={storeyId}
                        name={storey.name}
                        description={storey.description}
                        spaceCount={storey.spaces}
                        storeyItemCount={storey.counts}
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
