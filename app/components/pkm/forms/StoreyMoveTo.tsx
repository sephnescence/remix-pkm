import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import MoveTo from './MoveTo'
import { feModelTypeMap } from '@/utils/apiUtils'
import MoveFromStoreyToAnotherStorey from './MoveFromStoreyToAnotherStorey'
import MoveFromStoreyToSuite from './MoveFromStoreyToSuite'
import MoveFromStoreyToSpace from './MoveFromStoreyToSpace'

const StoreyMoveTo = async ({
  userId,
  suiteId,
  suite: { name: suiteName },
  storeyId,
  storey: { name: storeyName },
  modelId,
  modelType,
  historyId,
}: {
  userId: string
  suiteId: string
  suite: {
    name: string
  }
  storeyId: string
  storey: {
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
      <StoreyBreadcrumbs
        suiteId={suiteId}
        suiteName={suiteName}
        storeyId={storeyId}
        storeyName={storeyName}
      />
      <div className="text-4xl mb-2">
        Move Storey {feModelTypeMap[modelType]} Item
      </div>
      <MoveTo
        suiteId={suiteId}
        storeyId={storeyId}
        modelItemId={modelId}
        modelType={modelType}
        historyItemId={historyId}
        moveToText={'Move within the Storey'}
      />
      <MoveFromStoreyToAnotherStorey
        userId={userId}
        suiteId={suiteId}
        storeyId={storeyId}
        modelType={modelType}
        modelItemId={modelId}
        historyItemId={historyId}
      />
      <MoveFromStoreyToSuite
        userId={userId}
        suiteId={suiteId}
        storeyId={storeyId}
        modelType={modelType}
        modelItemId={modelId}
        historyItemId={historyId}
      />
      <MoveFromStoreyToSpace
        userId={userId}
        suiteId={suiteId}
        storeyId={storeyId}
        modelType={modelType}
        modelItemId={modelId}
        historyItemId={historyId}
      />
    </div>
  )
}

export default StoreyMoveTo
