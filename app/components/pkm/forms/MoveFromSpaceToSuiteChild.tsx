'use server'

import SuiteTilePreview from '~/components/Suites/forms/SuiteTilePreview'
import {
  GetSuitesForUserResults,
  ItemCountRow,
} from '~/repositories/PkmSuiteRepository'

const MoveFromSpaceToSuiteChild = ({
  storeyId,
  spaceId,
  modelType,
  modelItemId,
  historyItemId,
  suites,
  suiteItemCounts,
}: {
  suiteId: string
  storeyId: string
  spaceId: string
  modelType: string
  modelItemId: string
  historyItemId: string
  suites: GetSuitesForUserResults[]
  suiteItemCounts: { [key: string]: ItemCountRow }
}) => {
  const eHistoryItemUrlPart = `/api/history/move/eStoreyId/${storeyId}/eSpaceId/${spaceId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="flex overflow-x-scroll">
        {suites.map((suite) => {
          if (!suite || !suite.id || !suite.name || !suite.description) {
            return null
          }
          return (
            <div key={suite.id} className="flex-shrink-0">
              <form
                action={`${eHistoryItemUrlPart}/nSuiteId/${suite.id}`}
                method="POST"
              >
                <button
                  type="submit"
                  className="text-left"
                  title={`Move to ${suite.name}`}
                >
                  <div className="opacity-80 hover:opacity-100 cursor-pointer">
                    <SuiteTilePreview
                      suiteId={suite.id}
                      name={suite.name}
                      description={suite.description}
                      storeyCount={suite._count.storeys || 0}
                      suiteItemCount={suiteItemCounts[suite.id] || null}
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

export default MoveFromSpaceToSuiteChild
