import MoveTo from './MoveTo'
import { feModelTypeMap } from '@/utils/apiUtils'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import MoveFromSpaceToAnotherSpace from './MoveFromSpaceToAnotherSpace'
import MoveFromSpaceToStorey from './MoveFromSpaceToStorey'
import MoveFromSpaceToSuite from './MoveFromSpaceToSuite'
import { SpaceForMove } from '~/repositories/PkmSpaceRepository'
import { StoreyForMove } from '~/repositories/PkmStoreyRepository'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'

const SpaceMoveTo = ({
  suiteId,
  suite: { name: suiteName },
  storeyId,
  storey: { name: storeyName },
  spaceId,
  space: { name: spaceName },
  modelId,
  modelType,
  historyId,
  spacesForMove,
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
  spaceId: string
  space: {
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
      <SpaceBreadcrumbs
        suiteId={suiteId}
        suiteName={suiteName}
        storeyId={storeyId}
        storeyName={storeyName}
        spaceId={spaceId}
        spaceName={spaceName}
      />
      <div className="text-4xl mb-2">
        Move Space {feModelTypeMap[modelType]} Item
      </div>
      <MoveTo
        suiteId={suiteId}
        storeyId={storeyId}
        spaceId={spaceId}
        modelItemId={modelId}
        modelType={modelType}
        historyItemId={historyId}
        moveToText={'Move within the Space'}
      />
      {spacesForMove && (
        <MoveFromSpaceToAnotherSpace
          suiteId={suiteId}
          storeyId={storeyId}
          spaceId={spaceId}
          modelType={modelType}
          modelItemId={modelId}
          historyItemId={historyId}
          destinationSpaces={spacesForMove}
        />
      )}
      {storeysForMove && (
        <MoveFromSpaceToStorey
          suiteId={suiteId}
          storeyId={storeyId}
          spaceId={spaceId}
          modelType={modelType}
          modelItemId={modelId}
          historyItemId={historyId}
          destinationStorey={storeysForMove}
        />
      )}
      {suitesForMove && (
        <MoveFromSpaceToSuite
          suiteId={suiteId}
          storeyId={storeyId}
          spaceId={spaceId}
          modelType={modelType}
          modelItemId={modelId}
          historyItemId={historyId}
          destinationSuites={suitesForMove}
        />
      )}
    </div>
  )
}

export default SpaceMoveTo
