'use server'

import { SuiteForMove } from '~/repositories/PkmSuiteRepository'
import MoveFromStoreyToSuiteChild from './MoveFromStoreyToSuiteChild'

const MoveFromStoreyToSuite = ({
  interactive,
  submitting,
  setSubmitting,
  eSuiteId,
  eStoreyId,
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
          <MoveFromStoreyToSuiteChild
            interactive={interactive}
            submitting={submitting}
            setSubmitting={setSubmitting}
            eSuiteId={eSuiteId}
            eStoreyId={eStoreyId}
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
              <MoveFromStoreyToSuiteChild
                interactive={interactive}
                submitting={submitting}
                setSubmitting={setSubmitting}
                eSuiteId={eSuiteId}
                eStoreyId={eStoreyId}
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

export default MoveFromStoreyToSuite
