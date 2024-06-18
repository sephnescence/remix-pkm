'use server'

import { SuiteForMove } from '~/repositories/PkmSuiteRepository'
import MoveFromSpaceToSuiteChild from './MoveFromSpaceToSuiteChild'

const MoveFromSpaceToSuite = ({
  interactive,
  submitting,
  setSubmitting,
  eSuiteId,
  eStoreyId,
  eSpaceId,
  eModelType,
  eModelId,
  eHistoryId,
  destinationSuites,
}: {
  interactive: boolean
  submitting: boolean
  setSubmitting: (submitting: boolean) => void
  eSuiteId: string
  eStoreyId: string
  eSpaceId: string
  eModelType: string
  eModelId: string
  eHistoryId: string
  destinationSuites: SuiteForMove[]
}) => {
  const parentSuite = destinationSuites.find((suite) => suite.id === eSuiteId)
  const otherSuites = destinationSuites.filter((suite) => suite.id !== eSuiteId)

  return (
    <>
      {(parentSuite || (otherSuites && otherSuites.length > 0)) && (
        <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      )}
      {parentSuite && (
        <div className="mb-2">
          <div className="mb-2 leading-3">Move to parent Suite</div>
          <MoveFromSpaceToSuiteChild
            interactive={interactive}
            submitting={submitting}
            setSubmitting={setSubmitting}
            eSuiteId={eSuiteId}
            eStoreyId={eStoreyId}
            eSpaceId={eSpaceId}
            eModelType={eModelType}
            eModelId={eModelId}
            eHistoryId={eHistoryId}
            destinationSuite={parentSuite}
          />
        </div>
      )}

      {otherSuites && otherSuites.length > 0 && (
        <div className="mb-2">
          <div className="mb-2 leading-3">Move to another Suite</div>
          {otherSuites.map((otherSuite) => (
            <div key={otherSuite.id}>
              <MoveFromSpaceToSuiteChild
                interactive={interactive}
                submitting={submitting}
                setSubmitting={setSubmitting}
                eSuiteId={eSuiteId}
                eStoreyId={eStoreyId}
                eSpaceId={eSpaceId}
                eModelType={eModelType}
                eModelId={eModelId}
                eHistoryId={eHistoryId}
                destinationSuite={otherSuite}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default MoveFromSpaceToSuite
