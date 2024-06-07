'use server'

import StoreyTilePreview from '~/components/Suites/forms/StoreyTilePreview'
import {
  getStoreyItemCounts,
  getStoreysForUser,
} from '~/repositories/PkmStoreyRepository'

const MoveFromSuiteToStorey = async ({
  userId,
  suiteId,
  modelType,
  modelItemId,
  historyItemId,
}: {
  userId: string
  suiteId: string
  modelType: string
  modelItemId: string
  historyItemId: string
}) => {
  const storeys = await getStoreysForUser({
    userId,
  })

  const storeyItemCounts = await getStoreyItemCounts({
    userId,
    suiteId,
  })

  if (storeys.length === 0) {
    return null
  }

  const eHistoryItemUrlPart = `/api/history/move/eSuiteId/${suiteId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      <div className="">
        <div className="mb-2 leading-3">Move to Storey</div>
        <div className="flex overflow-x-scroll">
          {storeys.map((storey) => {
            if (
              !storey ||
              !storey.id ||
              !storey.name ||
              !storey.description ||
              !storey.suite_id
            ) {
              return null
            }

            return (
              <div key={storey.id} className="flex-shrink-0">
                <form
                  action={`${eHistoryItemUrlPart}/nSuiteId/${storey.suite_id}/nStoreyId/${storey.id}`}
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
                        storeyId={storey.id}
                        name={storey.name}
                        description={storey.description}
                        spaceCount={storey._count.spaces || 0}
                        storeyItemCount={storeyItemCounts[storey.id] || null}
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

export default MoveFromSuiteToStorey
