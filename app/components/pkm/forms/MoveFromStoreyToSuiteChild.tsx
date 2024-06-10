'use server'

import SuiteTilePreview from '~/components/Suites/forms/SuiteTilePreview'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'

const MoveFromStoreyToSuiteChild = ({
  suiteId,
  storeyId,
  modelType,
  modelItemId,
  historyItemId,
  suite,
}: {
  suiteId: string
  storeyId: string
  modelType: string
  modelItemId: string
  historyItemId: string
  suite: SuiteForMove
}) => {
  const eHistoryItemUrlPart = `/api/history/item/move/eSuiteId/${suiteId}/eStoreyId/${storeyId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="flex overflow-x-scroll">
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
                  suiteId={suite.id}
                  name={suite.name}
                  description={suite.description}
                  storeyCount={suite.storeys}
                  suiteItemCount={suite.counts}
                />
              </div>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default MoveFromStoreyToSuiteChild
