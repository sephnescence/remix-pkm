'use server'

import SuiteTilePreview from '~/components/Suites/forms/SuiteTilePreview'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'
import { handleMoveToSubmit } from './ItemForm'

const MoveFromStoreyToSuiteChild = ({
  interactive,
  submitting,
  setSubmitting,
  eSuiteId,
  eStoreyId,
  eModelType,
  eModelId,
  eHistoryId,
  destinationSuite,
}: {
  interactive: boolean
  submitting: boolean
  setSubmitting: (submitting: boolean) => void
  eSuiteId: string
  eStoreyId: string
  eModelType: string
  eModelId: string
  eHistoryId: string
  destinationSuite: SuiteForMove
}) => {
  return (
    <>
      <div className="flex overflow-x-scroll">
        <div key={destinationSuite.id} className="flex-shrink-0">
          <form
            id={`move-to-suite-${destinationSuite.id}`}
            onSubmit={() => false}
          >
            <button
              type="button"
              className="text-left"
              title={`Move to ${destinationSuite.name}`}
              onClick={() => {
                handleMoveToSubmit({
                  formId: `move-to-suite-${destinationSuite.id}`,
                  eHistoryId,
                  eModelType,
                  eModelId,
                  nModelType: eModelType, // Utilise the icons to drop straight into the desired Model Type
                  setSubmitting,
                  eSuiteId,
                  eStoreyId,
                  eSpaceId: null,
                  nSuiteId: destinationSuite.id,
                  nStoreyId: null,
                  nSpaceId: null,
                })
              }}
              disabled={!interactive || submitting}
            >
              <div className="opacity-80 hover:opacity-100 cursor-pointer">
                <SuiteTilePreview
                  suiteId={destinationSuite.id}
                  name={destinationSuite.name}
                  description={destinationSuite.description}
                  storeyCount={destinationSuite.storeys}
                  suiteItemCount={destinationSuite.counts}
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
