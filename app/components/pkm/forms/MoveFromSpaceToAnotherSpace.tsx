'use server'

import SpaceTilePreview from '~/components/Suites/forms/SpaceTilePreview'
import {
  getSpaceItemCounts,
  getSpacesForUser,
} from '~/repositories/PkmSpaceRepository'

const MoveFromSpaceToAnotherSpace = async ({
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
  const spaceDashboard = await getSpacesForUser({
    userId: userId,
    storeyId,
  })

  const spaceItemCounts = await getSpaceItemCounts({
    userId: userId,
    storeyId,
  })

  const otherSpaces = spaceDashboard.filter((space) => space.id !== spaceId)

  if (otherSpaces.length === 0) {
    return null
  }

  const eHistoryItemUrlPart = `/api/history/move/eStoreyId/${storeyId}/eSpaceId/${spaceId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      <div className="mb-2">
        <div className="mb-2 leading-3">Move to Another Space</div>
        <div className="flex overflow-x-scroll">
          {otherSpaces.map((space) => {
            if (
              !space ||
              !space.id ||
              !space.name ||
              !space.description ||
              !space.storey_id
            ) {
              return null
            }

            return (
              <div key={space.id} className="flex-shrink-0">
                <form
                  action={`${eHistoryItemUrlPart}/nStoreyId/${space.storey_id}/nSpaceId/${space.id}`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className="text-left"
                    title={`Move to ${space.name}`}
                  >
                    <div className="opacity-80 hover:opacity-100 cursor-pointer">
                      <SpaceTilePreview
                        suiteId={suiteId}
                        storeyId={storeyId}
                        name={space.name}
                        description={space.description}
                        spaceItemCount={spaceItemCounts[space.id] || null}
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

export default MoveFromSpaceToAnotherSpace
