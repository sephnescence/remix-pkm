/*
  Differences to move.ts:
  - It takes no nSuiteId, nStoreyId, or nSpaceId parameters as we're not moving anything
  - You _can_ specify eSuiteId, eStoreyId, and eSpaceId parameters at once. The UI URL to view Items contains all
      three, so it's up to this endpoint to simply not return the Suite ID if Story and Space are also specified
*/
export const getNewItemSuiteStoreyAndSpaceIds = ({
  eSuiteId,
  eStoreyId,
  eSpaceId,
}: {
  eSuiteId: string | null
  eStoreyId: string | null
  eSpaceId: string | null
}) => {
  // Reject obviously invalid parameters

  // Validation to find the existing Suite, Storey, and Space Item
  if (!eSuiteId && !eStoreyId && !eSpaceId) {
    throw new Error(
      'Not enough information. You MUST specify eSuiteId, or eSuiteId and eStoreyId, or eStoreyId, and eSpace',
    )
  }

  if (eSuiteId && !eStoreyId && eSpaceId) {
    throw new Error(
      'Items cannot belong to a Space inside a Suite directly. A Space belongs to a Storey',
    )
  }

  if (!eSuiteId && eStoreyId && !eSpaceId) {
    throw new Error(
      'Items cannot belong to a Storey in isolation. You MUST additionally specify EITHER eSuiteId OR eSpaceId',
    )
  }

  if (!eSuiteId && !eStoreyId && eSpaceId) {
    throw new Error(
      'Items cannot belong to a Space in isolation. You MUST additionally specify eStoreyId',
    )
  }

  return {
    suiteId: eStoreyId && eSpaceId ? null : eSuiteId,
    storeyId: eStoreyId,
    spaceId: eSpaceId,
    message:
      'Moving within the existing Suite, Storey, or Space that the Item is already in',
  }
}
