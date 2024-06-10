'use server'

import SuiteTilePreview from '~/components/Suites/forms/SuiteTilePreview'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'

const MoveFromSuiteToAnotherSuite = ({
  suiteId,
  modelType,
  modelItemId,
  historyItemId,
  destinationSuites,
}: {
  suiteId: string
  modelType: string
  modelItemId: string
  historyItemId: string
  destinationSuites: SuiteForMove[]
}) => {
  const otherSuites = destinationSuites.filter((suite) => suite.id !== suiteId)

  if (otherSuites.length === 0) {
    return null
  }

  const eHistoryItemUrlPart = `/api/history/item/move/eSuiteId/${suiteId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      <div className="">
        <div className="mb-2 leading-3">Move to another Suite</div>
        <div className="flex overflow-x-scroll">
          {otherSuites.map((suite) => {
            if (!suite || !suite.id || !suite.name || !suite.description) {
              return null
            }

            return (
              <div key={suite.id} className="flex-shrink-0">
                <form
                  // action={`${eHistoryItemUrlPart}/nSuiteId/${suite.id}`}
                  id={`move-to-suite-${suite.id}`}
                  onSubmit={() => false}
                >
                  <button
                    type="button"
                    className="text-left"
                    title={`Move to ${suite.name}`}
                  >
                    <div className="opacity-80 hover:opacity-100 cursor-pointer">
                      <SuiteTilePreview
                        suiteId={suiteId}
                        name={suite.name}
                        description={suite.description}
                        storeyCount={suite.storeys || 0}
                        suiteItemCount={suite.counts}
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
