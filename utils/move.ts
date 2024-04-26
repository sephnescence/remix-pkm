export const getNewSuiteStoreyAndSpaceIds = ({
  eSuiteId,
  eStoreyId,
  eSpaceId,
  nSuiteId,
  nStoreyId,
  nSpaceId,
}: {
  eSuiteId: string | null
  eStoreyId: string | null
  eSpaceId: string | null
  nSuiteId: string | null
  nStoreyId: string | null
  nSpaceId: string | null
}) => {
  // Reject obviously invalid parameters

  // Validation to find the existing Suite, Storey, and Space Item
  if (!eSuiteId && !eStoreyId && !eSpaceId) {
    throw new Error(
      'Not enough information. You MUST specify eSuiteId, or eSuiteId and eStoreyId, or eStoreyId, and eSpace',
    )
  }

  if (eSuiteId && eStoreyId && eSpaceId) {
    throw new Error(
      'Too much information. You MUST only specify eSuiteId, or eSuiteId and eStoreyId, or eStoreyId, and eSpace',
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

  // If specified, validate the destination Suite, Storey, or Space
  if (nSuiteId || nStoreyId || nSpaceId) {
    if (nSuiteId && nStoreyId && nSpaceId) {
      throw new Error(
        'Destination - Too much information. You MUST only specify nSuiteId, or nSuiteId and nStoreyId, or nStoreyId, and nSpace',
      )
    }
    if (nSuiteId && !nStoreyId && nSpaceId) {
      throw new Error(
        'Destination - Items cannot belong to a Space inside a Suite directly. A Space belongs to a Storey',
      )
    }

    if (!nSuiteId && nStoreyId && !nSpaceId) {
      throw new Error(
        'Destination - Items cannot belong to a Space in isolation. You MUST additionally specify nStoreyId',
      )
    }

    if (!nSuiteId && !nStoreyId && nSpaceId) {
      throw new Error(
        'Destination - Items cannot belong to a Space in isolation. You MUST additionally specify nStoreyId',
      )
    }
  }

  if (nSuiteId || nStoreyId || nSpaceId) {
    return {
      suiteId: nSuiteId,
      storeyId: nStoreyId,
      spaceId: nSpaceId,
      message: 'Moving to another Suite, Storey, or Space',
    }
  }

  return {
    suiteId: eSuiteId,
    storeyId: eStoreyId,
    spaceId: eSpaceId,
    message:
      'Moving within the existing Suite, Storey, or Space that the Item is already in',
  }
}
