'use server'

import StoreyTilePreview from '~/components/Suites/forms/StoreyTilePreview'
import {
  GetStoreysForUserResults,
  ItemCountRow,
} from '~/repositories/PkmStoreyRepository'

const MoveFromSpaceToStoreyChild = ({
  suiteId,
  storeyId,
  spaceId,
  modelType,
  modelItemId,
  historyItemId,
  storeys,
  storeyItemCounts,
}: {
  suiteId: string
  storeyId: string
  spaceId: string
  modelType: string
  modelItemId: string
  historyItemId: string
  storeys: GetStoreysForUserResults[]
  storeyItemCounts: { [key: string]: ItemCountRow }
}) => {
  const eHistoryItemUrlPart = `/api/history/move/eStoreyId/${storeyId}/eSpaceId/${spaceId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
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
                      storeyId={storeyId}
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
    </>
  )
}

export default MoveFromSpaceToStoreyChild
