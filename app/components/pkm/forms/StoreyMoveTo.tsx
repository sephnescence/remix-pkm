import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import MoveTo from './MoveTo'
import { feModelTypeMap } from '@/utils/apiUtils'
import MoveFromStoreyToAnotherStorey from './MoveFromStoreyToAnotherStorey'
import MoveFromStoreyToSuite from './MoveFromStoreyToSuite'
import MoveFromStoreyToSpace from './MoveFromStoreyToSpace'
import { SpaceForMove } from '~/repositories/PkmSpaceRepository'
import { StoreyForMove } from '~/repositories/PkmStoreyRepository'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'
import { useEffect, useState } from 'react'

const StoreyMoveTo = ({
  eSuiteId,
  suite: { name: suiteName },
  eStoreyId,
  storey: { name: storeyName },
  eModelId,
  eModelType,
  eHistoryId,
  spacesForMove,
  storeysForMove,
  suitesForMove,
}: {
  eSuiteId: string
  suite: {
    name: string
  }
  eStoreyId: string
  storey: {
    name: string
  }
  eModelId: string
  eModelType:
    | 'inbox'
    | 'epiphany'
    | 'passing-thought'
    | 'todo'
    | 'trash'
    | 'void'
  eHistoryId: string
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
      <StoreyBreadcrumbs
        suiteId={eSuiteId}
        suiteName={suiteName}
        storeyId={eStoreyId}
        storeyName={storeyName}
      />
      <div className="text-4xl mb-2">
        Move Storey {feModelTypeMap[eModelType]} Item
      </div>
      <MoveTo
        interactive={interactive}
        submitting={submitting}
        setSubmitting={setSubmitting}
        eSuiteId={eSuiteId}
        eStoreyId={eStoreyId}
        eSpaceId={null}
        eModelType={eModelType}
        eModelId={eModelId}
        eHistoryId={eHistoryId}
        moveToText={'Move within the Storey'}
      />
      {storeysForMove && storeysForMove.length > 0 && (
        <MoveFromStoreyToAnotherStorey
          interactive={interactive}
          submitting={submitting}
          setSubmitting={setSubmitting}
          eSuiteId={eSuiteId}
          eStoreyId={eStoreyId}
          eModelType={eModelType}
          eModelId={eModelId}
          eHistoryId={eHistoryId}
          destinationStoreys={storeysForMove}
        />
      )}
      {suitesForMove && suitesForMove.length > 0 && (
        <MoveFromStoreyToSuite
          interactive={interactive}
          submitting={submitting}
          setSubmitting={setSubmitting}
          eSuiteId={eSuiteId}
          eStoreyId={eStoreyId}
          eModelType={eModelType}
          eModelId={eModelId}
          eHistoryId={eHistoryId}
          destinationSuites={suitesForMove}
        />
      )}
      {spacesForMove && spacesForMove.length > 0 && (
        <MoveFromStoreyToSpace
          interactive={interactive}
          submitting={submitting}
          setSubmitting={setSubmitting}
          eSuiteId={eSuiteId}
          eStoreyId={eStoreyId}
          eModelType={eModelType}
          eModelId={eModelId}
          eHistoryId={eHistoryId}
          destinationSpaces={spacesForMove}
        />
      )}
    </div>
  )
}

export default StoreyMoveTo
