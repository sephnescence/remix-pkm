'use server'

import {
  getSuiteItemCounts,
  getSuitesForUser,
} from '~/repositories/PkmSuiteRepository'
import MoveFromStoreyToSuiteChild from './MoveFromStoreyToSuiteChild'

const MoveFromStoreyToSuite = async ({
  userId,
  suiteId,
  storeyId,
  modelType,
  modelItemId,
  historyItemId,
}: {
  userId: string
  suiteId: string
  storeyId: string
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

  const parentSuite = suiteDashboard.find((suite) => suite.id === suiteId)
  const otherSuites = suiteDashboard.filter((suite) => suite.id !== suiteId)

  return (
    <>
      {(parentSuite || (otherSuites && otherSuites.length > 0)) && (
        <div className="border-b-[0.5px] border-blue-900 my-3"></div>
      )}
      {parentSuite && (
        <div className="mb-2">
          <div className="mb-2 leading-3">Move to Parent Suite</div>
          <MoveFromStoreyToSuiteChild
            suiteId={suiteId}
            storeyId={storeyId}
            modelType={modelType}
            modelItemId={modelItemId}
            historyItemId={historyItemId}
            suites={[parentSuite]}
            suiteItemCounts={suiteItemCounts}
          />
        </div>
      )}

      {otherSuites && otherSuites.length > 0 && (
        <div className="mb-2">
          <div className="mb-2 leading-3">Move to Another Suite</div>
          <MoveFromStoreyToSuiteChild
            suiteId={suiteId}
            storeyId={storeyId}
            modelType={modelType}
            modelItemId={modelItemId}
            historyItemId={historyItemId}
            suites={otherSuites}
            suiteItemCounts={suiteItemCounts}
          />
        </div>
      )}
    </>
  )
}

export default MoveFromStoreyToSuite
