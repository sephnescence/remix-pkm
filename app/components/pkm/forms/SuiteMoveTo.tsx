import { feModelTypeMap } from '@/utils/apiUtils'
import MoveTo from './MoveTo'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import MoveFromSuiteToAnotherSuite from './MoveFromSuiteToAnotherSuite'
import MoveFromSuiteToStorey from './MoveFromSuiteToStorey'
import { SpaceForMove } from '~/repositories/PkmSpaceRepository'
import { StoreyForMove } from '~/repositories/PkmStoreyRepository'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'

const SuiteMoveTo = ({
  suiteId,
  suite: { name: suiteName },
  modelId,
  modelType,
  historyId,
  suitesForMove,
  storeysForMove,
}: {
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
  spacesForMove: SpaceForMove[] | null
  storeysForMove: StoreyForMove[] | null
  suitesForMove: SuiteForMove[] | null
}) => {
  return (
    <div>
      <SuiteBreadcrumbs suiteId={suiteId} suiteName={suiteName} />
      <div className="text-4xl mb-2">
        Move Suite {feModelTypeMap[modelType]} Item
      </div>
      <MoveTo
        modelItemId={modelId}
        modelType={modelType}
        historyItemId={historyId}
        suiteId={suiteId}
        storeyId={null}
        spaceId={null}
        moveToText={'Move within the Suite'}
      />
      {suitesForMove && (
        <MoveFromSuiteToAnotherSuite
          suiteId={suiteId}
          modelType={modelType}
          modelItemId={modelId}
          historyItemId={historyId}
          destinationSuites={suitesForMove}
        />
      )}
      {storeysForMove && (
        <MoveFromSuiteToStorey
          suiteId={suiteId}
          modelType={modelType}
          modelItemId={modelId}
          historyItemId={historyId}
          destinationStoreys={storeysForMove}
        />
      )}
    </div>
  )
}

export default SuiteMoveTo
