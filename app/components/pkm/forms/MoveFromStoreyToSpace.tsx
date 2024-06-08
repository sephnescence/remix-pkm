'use server'

import SpaceTilePreview from '~/components/Suites/forms/SpaceTilePreview'
import { SpaceForMove } from '~/repositories/PkmSpaceRepository'

const MoveFromStoreyToSpace = ({
  suiteId,
  storeyId,
  modelType,
  modelItemId,
  historyItemId,
  destinationSpaces,
}: {
  suiteId: string
  storeyId: string
  modelType: string
  modelItemId: string
  historyItemId: string
  destinationSpaces: SpaceForMove[]
}) => {
  const eHistoryItemUrlPart = `/api/history/move/eSuiteId/${suiteId}/eStoreyId/${storeyId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      <div className="mb-2">
        <div className="mb-2 leading-3">Move to child Space</div>
        <div className="flex overflow-x-scroll">
          {destinationSpaces.map((destinationSpace) => {
            if (
              !destinationSpace ||
              !destinationSpace.id ||
              !destinationSpace.name ||
              !destinationSpace.description ||
              !destinationSpace.storeyId
            ) {
              return null
            }

            return (
              <div key={destinationSpace.id} className="flex-shrink-0">
                <form
                  action={`${eHistoryItemUrlPart}/nStoreyId/${destinationSpace.storeyId}/nSpaceId/${destinationSpace.id}`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className="text-left"
                    title={`Move to ${destinationSpace.name}`}
                  >
                    <div className="opacity-80 hover:opacity-100 cursor-pointer">
                      <SpaceTilePreview
                        suiteId={suiteId}
                        storeyId={storeyId}
                        name={destinationSpace.name}
                        description={destinationSpace.description}
                        spaceItemCount={destinationSpace.counts}
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

export default MoveFromStoreyToSpace
