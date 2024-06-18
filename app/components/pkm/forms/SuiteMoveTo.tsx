import { feModelTypeMap } from '@/utils/apiUtils'
import MoveTo from './MoveTo'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import MoveFromSuiteToAnotherSuite from './MoveFromSuiteToAnotherSuite'
import MoveFromSuiteToStorey from './MoveFromSuiteToStorey'
import { SpaceForMove } from '~/repositories/PkmSpaceRepository'
import { StoreyForMove } from '~/repositories/PkmStoreyRepository'
import { SuiteForMove } from '~/repositories/PkmSuiteRepository'
import { useEffect, useState } from 'react'

const SuiteMoveTo = ({
  eSuiteId,
  suite: { name: suiteName },
  eModelId,
  eModelType,
  eHistoryId,
  suitesForMove,
  storeysForMove,
}: {
  eSuiteId: string
  suite: {
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
      <SuiteBreadcrumbs suiteId={eSuiteId} suiteName={suiteName} />
      <div className="text-4xl mb-2">
        Move Suite {feModelTypeMap[eModelType]} Item
      </div>
      <MoveTo
        interactive={interactive}
        submitting={submitting}
        setSubmitting={setSubmitting}
        eModelId={eModelId}
        eModelType={eModelType}
        eHistoryId={eHistoryId}
        eSuiteId={eSuiteId}
        eStoreyId={null}
        eSpaceId={null}
        moveToText={'Move within the Suite'}
      />
      {suitesForMove && suitesForMove.length > 0 && (
        <MoveFromSuiteToAnotherSuite
          interactive={interactive}
          submitting={submitting}
          setSubmitting={setSubmitting}
          eSuiteId={eSuiteId}
          eModelType={eModelType}
          eModelId={eModelId}
          eHistoryId={eHistoryId}
          destinationSuites={suitesForMove}
        />
      )}
      {storeysForMove && storeysForMove.length > 0 && (
        <MoveFromSuiteToStorey
          interactive={interactive}
          submitting={submitting}
          setSubmitting={setSubmitting}
          eSuiteId={eSuiteId}
          eModelType={eModelType}
          eModelId={eModelId}
          eHistoryId={eHistoryId}
          destinationStoreys={storeysForMove}
        />
      )}
    </div>
  )
}

export default SuiteMoveTo
