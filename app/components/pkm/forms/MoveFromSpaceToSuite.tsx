'use server'

import { SuiteForMove } from '~/repositories/PkmSuiteRepository'
import MoveFromSpaceToSuiteChild from './MoveFromSpaceToSuiteChild'

const MoveFromSpaceToSuite = ({
  suiteId,
  storeyId,
  spaceId,
  modelType,
  modelItemId,
  historyItemId,
  destinationSuites,
}: {
  suiteId: string
  storeyId: string
  spaceId: string
  modelType: string
  modelItemId: string
  historyItemId: string
  destinationSuites: SuiteForMove[]
}) => {
  const parentSuite = destinationSuites.find((suite) => suite.id === suiteId)
  const otherSuites = destinationSuites.filter((suite) => suite.id !== suiteId)

  return (
    <>
      {(parentSuite || (otherSuites && otherSuites.length > 0)) && (
        <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      )}
      {parentSuite && (
        <div className="mb-2">
          <div className="mb-2 leading-3">Move to parent Suite</div>
          <MoveFromSpaceToSuiteChild
            suiteId={suiteId}
            storeyId={storeyId}
            spaceId={spaceId}
            modelType={modelType}
            modelItemId={modelItemId}
            historyItemId={historyItemId}
            suite={parentSuite}
          />
        </div>
      )}

      {otherSuites && otherSuites.length > 0 && (
        <div className="mb-2">
          <div className="mb-2 leading-3">Move to another Suite</div>
          {otherSuites.map((otherSuite) => (
            <div key={otherSuite.id}>
              <MoveFromSpaceToSuiteChild
                suiteId={suiteId}
                storeyId={storeyId}
                spaceId={spaceId}
                modelType={modelType}
                modelItemId={modelItemId}
                historyItemId={historyItemId}
                suite={otherSuite}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default MoveFromSpaceToSuite
