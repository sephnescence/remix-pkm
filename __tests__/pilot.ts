import { randomUUID } from 'node:crypto'
import { determineSyncContentsTransactions } from '~/services/PkmContentService'

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3)
})

test('determineSyncContentsTransactions - Creating a suite returns the expected transactions', () => {
  const newContentId = randomUUID()
  const suiteId = randomUUID()

  const transactions = determineSyncContentsTransactions({
    contents: [
      {
        id: newContentId,
        content: 'Test content',
        historyId: suiteId,
        modelId: suiteId,
        sortOrder: 1,
      },
    ],
  })

  expect(transactions).toHaveLength(1)
  expect(transactions[0]).toEqual(
    expect.objectContaining({
      outcome: 'Create',
      queryDescription: `Create pkmContents - ${newContentId}`,
    }),
  )
})
