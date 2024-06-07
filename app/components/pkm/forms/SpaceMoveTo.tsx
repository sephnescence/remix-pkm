import MoveTo from './MoveTo'
import { feModelTypeMap } from '@/utils/apiUtils'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import MoveFromSpaceToAnotherSpace from './MoveFromSpaceToAnotherSpace'
import MoveFromSpaceToStorey from './MoveFromSpaceToStorey'
import MoveFromSpaceToSuite from './MoveFromSpaceToSuite'

const SpaceMoveTo = async ({
  userId,
  suiteId,
  suite: { name: suiteName },
  storeyId,
  storey: { name: storeyName },
  spaceId,
  space: { name: spaceName },
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
      <MoveFromSpaceToAnotherSpace
        userId={userId}
        suiteId={suiteId}
        storeyId={storeyId}
        spaceId={spaceId}
        modelType={modelType}
        modelItemId={modelId}
        historyItemId={historyId}
      />
      <MoveFromSpaceToStorey
        userId={userId}
        suiteId={suiteId}
        storeyId={storeyId}
        spaceId={spaceId}
        modelType={modelType}
        modelItemId={modelId}
        historyItemId={historyId}
      />
      <MoveFromSpaceToSuite
        userId={userId}
        suiteId={suiteId}
        storeyId={storeyId}
        spaceId={spaceId}
        modelType={modelType}
        modelItemId={modelId}
        historyItemId={historyId}
      />
    </div>
  )
}

export default SpaceMoveTo
