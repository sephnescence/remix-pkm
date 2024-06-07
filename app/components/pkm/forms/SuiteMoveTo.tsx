import { feModelTypeMap } from '@/utils/apiUtils'
import MoveTo from './MoveTo'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import MoveFromSuiteToAnotherSuite from './MoveFromSuiteToAnotherSuite'
import MoveFromSuiteToStorey from './MoveFromSuiteToStorey'

const SuiteMoveTo = async ({
  userId,
  suiteId,
  suite: { name: suiteName },
  modelId,
  modelType,
  historyId,
}: {
  userId: string
  suiteId: string
  suite: {
    name: string
  }
  modelId: string
  modelType:
    | 'inbox'
    | 'epiphany'
    | 'passing-thought'
    | 'todo'
    | 'trash'
    | 'void'
  historyId: string
}) => {
  return (
    <div>
      <SuiteBreadcrumbs suiteId={suiteId} suiteName={suiteName} />
      <div className="text-4xl mb-2">
        Move Suite {feModelTypeMap[modelType]} Item
      </div>
      <MoveTo
        suiteId={suiteId}
        modelItemId={modelId}
        modelType={modelType}
        historyItemId={historyId}
        moveToText={'Move within the Suite'}
      />
      <MoveFromSuiteToAnotherSuite
        userId={userId}
        suiteId={suiteId}
        modelType={modelType}
        modelItemId={modelId}
        historyItemId={historyId}
      />
      <MoveFromSuiteToStorey
        userId={userId}
        suiteId={suiteId}
        modelType={modelType}
        modelItemId={modelId}
        historyItemId={historyId}
      />
    </div>
  )
}

export default SuiteMoveTo
