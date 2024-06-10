import MoveTo from './MoveTo'
import { feModelTypeMap } from '@/utils/apiUtils'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import MoveFromSpaceToAnotherSpace from './MoveFromSpaceToAnotherSpace'
import MoveFromSpaceToStorey from './MoveFromSpaceToStorey'
import MoveFromSpaceToSuite from './MoveFromSpaceToSuite'
import { SpaceForMove } from '~/repositories/PkmSpaceRepository'
import { StoreyForMove } from '~/repositories/PkmStoreyRepository'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'
import { useEffect, useState } from 'react'

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
  const [interactive, setInteractive] = useState(() => false)
  const [submitting, setSubmitting] = useState(() => false)

  // Prevent form interaction while submitting and while the page is rendering
  useEffect(() => {
    setInteractive(true)
  }, [interactive])

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
        interactive={interactive}
        submitting={submitting}
        setSubmitting={setSubmitting}
        eModelId={modelId}
        eModelType={modelType}
        eHistoryId={historyId}
        eSuiteId={suiteId}
        eStoreyId={storeyId}
        eSpaceId={spaceId}
        moveToText={'Move within the Space'}
      />
      {spacesForMove && spacesForMove.length > 0 && (
        <MoveFromSpaceToAnotherSpace
          interactive={interactive}
          submitting={submitting}
          setSubmitting={setSubmitting}
          eSuiteId={suiteId}
          eStoreyId={storeyId}
          eSpaceId={spaceId}
          eModelType={modelType}
          eModelId={modelId}
          eHistoryId={historyId}
          destinationSpaces={spacesForMove}
        />
      )}
      {storeysForMove && storeysForMove.length > 0 && (
        <MoveFromSpaceToStorey
          interactive={interactive}
          submitting={submitting}
          setSubmitting={setSubmitting}
          eSuiteId={suiteId}
          eStoreyId={storeyId}
          eSpaceId={spaceId}
          eModelType={modelType}
          eModelId={modelId}
          eHistoryId={historyId}
          destinationStoreys={storeysForMove}
        />
      )}
      {suitesForMove && suitesForMove.length > 0 && (
        <MoveFromSpaceToSuite
          interactive={interactive}
          submitting={submitting}
          setSubmitting={setSubmitting}
          eSuiteId={suiteId}
          eStoreyId={storeyId}
          eSpaceId={spaceId}
          eModelType={modelType}
          eModelId={modelId}
          eHistoryId={historyId}
          destinationSuites={suitesForMove}
        />
      )}
    </div>
  )
}

export default SpaceMoveTo
