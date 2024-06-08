import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import MoveTo from './MoveTo'
import { feModelTypeMap } from '@/utils/apiUtils'
import MoveFromStoreyToAnotherStorey from './MoveFromStoreyToAnotherStorey'
import MoveFromStoreyToSuite from './MoveFromStoreyToSuite'
// import MoveFromStoreyToSpace from './MoveFromStoreyToSpace'
import { SpaceForMove } from '~/repositories/PkmSpaceRepository'
import { StoreyForMove } from '~/repositories/PkmStoreyRepository'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'

const StoreyMoveTo = ({
  suiteId,
  suite: { name: suiteName },
  storeyId,
  storey: { name: storeyName },
  modelId,
  modelType,
  historyId,
  // spacesForMove,
  storeysForMove,
  suitesForMove,
}: {
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
  spacesForMove: SpaceForMove[] | null
  storeysForMove: StoreyForMove[] | null
  suitesForMove: SuiteForMove[] | null
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
      {storeysForMove && (
        <MoveFromStoreyToAnotherStorey
          suiteId={suiteId}
          storeyId={storeyId}
          modelType={modelType}
          modelItemId={modelId}
          historyItemId={historyId}
          destinationStoreys={storeysForMove}
        />
      )}
      {suitesForMove && (
        <MoveFromStoreyToSuite
          suiteId={suiteId}
          storeyId={storeyId}
          modelType={modelType}
          modelItemId={modelId}
          historyItemId={historyId}
          destinationSuites={suitesForMove}
        />
      )}
      {/* <MoveFromStoreyToSpace
        suiteId={suiteId}
        storeyId={storeyId}
        modelType={modelType}
        modelItemId={modelId}
        historyItemId={historyId}
      /> */}
    </div>
  )
}

export default StoreyMoveTo
