'use server'

import SuiteTilePreview from '~/components/Suites/forms/SuiteTilePreview'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'

const MoveFromSpaceToSuiteChild = ({
  storeyId,
  spaceId,
  modelType,
  modelItemId,
  historyItemId,
  suite,
}: {
  suiteId: string
  storeyId: string
  spaceId: string
  modelType: string
  modelItemId: string
  historyItemId: string
  suite: SuiteForMove
}) => {
  const eHistoryItemUrlPart = `/api/history/move/eStoreyId/${storeyId}/eSpaceId/${spaceId}/eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="flex overflow-x-scroll">
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

export default MoveFromSpaceToSuiteChild
