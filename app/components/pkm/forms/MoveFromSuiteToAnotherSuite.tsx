'use server'

import SuiteTilePreview from '~/components/Suites/forms/SuiteTilePreview'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'
import { handleMoveToSubmit } from './ItemForm'

const MoveFromSuiteToAnotherSuite = ({
  interactive,
  submitting,
  setSubmitting,
  eSuiteId,
  eModelType,
  eModelId,
  eHistoryId,
  destinationSuites,
}: {
  interactive: boolean
  submitting: boolean
  setSubmitting: (submitting: boolean) => void
  eSuiteId: string
  eModelType: string
  eModelId: string
  eHistoryId: string
  destinationSuites: SuiteForMove[]
}) => {
  const otherSuites = destinationSuites.filter((suite) => suite.id !== eSuiteId)

  if (otherSuites.length === 0) {
    return null
  }

  return (
    <>
      <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      <div className="">
        <div className="mb-2 leading-3">Move to another Suite</div>
        <div className="flex overflow-x-scroll">
          {otherSuites.map((destinationSuite) => {
            return (
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
                        eStoreyId: null,
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
                        suiteId={eSuiteId}
                        name={destinationSuite.name}
                        description={destinationSuite.description}
                        storeyCount={destinationSuite.storeys}
                        suiteItemCount={destinationSuite.counts}
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
