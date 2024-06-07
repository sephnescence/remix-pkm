'use server'

import SuiteTilePreview from '~/components/Suites/forms/SuiteTilePreview'
import {
  getSuiteItemCounts,
  getSuitesForUser,
} from '~/repositories/PkmSuiteRepository'

const MoveFromSuiteToAnotherSuite = async ({
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
  const suiteDashboard = await getSuitesForUser({
    userId,
  })

  const suiteItemCounts = await getSuiteItemCounts({
    userId,
  })

  const otherSuites = suiteDashboard.filter((suite) => suite.id !== suiteId)

  if (otherSuites.length === 0) {
    return null
  }

  const eHistoryItemUrlPart = `/api/history/move/eSuiteId/${suiteId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      <div className="">
        <div className="mb-2 leading-3">Move to Another Suite</div>
        <div className="flex overflow-x-scroll">
          {otherSuites.map((suite) => {
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
                        suiteId={suiteId}
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
      </div>
    </>
  )
}

export default MoveFromSuiteToAnotherSuite
