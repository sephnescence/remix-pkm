'use server'

import SpaceTilePreview from '~/components/Suites/forms/SpaceTilePreview'
import { SpaceForMove } from '~/repositories/PkmSpaceRepository'
import { handleMoveToSubmit } from './ItemForm'

const MoveFromStoreyToSpace = ({
  interactive,
  submitting,
  setSubmitting,
  eSuiteId,
  eStoreyId,
  eModelType,
  eModelId,
  eHistoryId,
  destinationSpaces,
}: {
  interactive: boolean
  submitting: boolean
  setSubmitting: (submitting: boolean) => void
  eSuiteId: string
  eStoreyId: string
  eModelType: string
  eModelId: string
  eHistoryId: string
  destinationSpaces: SpaceForMove[]
}) => {
  return (
    <>
      <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      <div className="mb-2">
        <div className="mb-2 leading-3">Move to child Space</div>
        <div className="flex overflow-x-scroll">
          {destinationSpaces.map((destinationSpace) => {
            return (
              <div key={destinationSpace.id} className="flex-shrink-0">
                <form
                  id={`move-to-space-${destinationSpace.id}`}
                  onSubmit={() => false}
                >
                  <button
                    type="button"
                    className="text-left"
                    title={`Move to ${destinationSpace.name}`}
                    onClick={() => {
                      handleMoveToSubmit({
                        formId: `move-to-space-${destinationSpace.id}`,
                        eHistoryId,
                        eModelType,
                        eModelId,
                        nModelType: eModelType, // Utilise the icons to drop straight into the desired Model Type
                        setSubmitting,
                        eSuiteId,
                        eStoreyId,
                        eSpaceId: null,
                        nSuiteId: null,
                        nStoreyId: destinationSpace.storeyId,
                        nSpaceId: destinationSpace.id,
                      })
                    }}
                    disabled={!interactive || submitting}
                  >
                    <div className="opacity-80 hover:opacity-100 cursor-pointer">
                      <SpaceTilePreview
                        suiteId={eSuiteId}
                        storeyId={eStoreyId}
                        name={destinationSpace.name}
                        description={destinationSpace.description}
                        spaceItemCount={destinationSpace.counts}
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

export default MoveFromStoreyToSpace
