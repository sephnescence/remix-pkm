import { useReducer } from 'react'
import { FIXED_NEW_MULTI_CONTENT_ID } from '~/repositories/PkmContentRepository'

const reindex = (multiContents: MultiContentReducerItem[]) => {
  return multiContents.map((multiContent, index) => ({
    ...multiContent,
    sortOrder: index + 1,
  }))
}

export type MultiContentReducerItem = {
  id: string // Note: Will be ignored when adding a new MultiContent
  sortOrder: number
  content: string
  status: string
  originalStatus: string // Tell the difference between a "new" and "active" Content. Different buttons become available
}

// defaultMultiContents will eventually be configured by the parent Suite/Storey/Space
//  Suites are the only thing I can think of that won't have this configuration
function useMultiContentsReducer({
  existingMultiContents,
  defaultMultiContents = '<div data-children></div>\n\n',
}: {
  existingMultiContents?: MultiContentReducerItem[]
  defaultMultiContents?: string
}) {
  const [multiContents, setMultiContents] = useReducer(
    (
      multiContents: MultiContentReducerItem[],
      action: {
        type: string
        payload: MultiContentReducerItem
      },
    ) => {
      if (action.type === 'add') {
        const id = crypto.randomUUID()
        return reindex([
          ...multiContents,
          { ...action.payload, status: 'new', originalStatus: 'new', id },
        ])
      }

      if (action.type === 'addBefore') {
        const id = crypto.randomUUID()
        const newMultiContent = {
          ...action.payload,
          status: 'new',
          originalStatus: 'new',
          id,
        }

        const index = multiContents.findIndex(
          (multiContent) => multiContent.sortOrder === action.payload.sortOrder,
        )
        if (index === -1) {
          return reindex([newMultiContent, ...multiContents])
        }

        return reindex([
          ...multiContents.slice(0, index),
          newMultiContent,
          ...multiContents.slice(index),
        ])
      }

      if (action.type === 'addAfter') {
        const id = crypto.randomUUID()
        const newMultiContent = {
          ...action.payload,
          status: 'new',
          originalStatus: 'new',
          id,
        }

        const index = multiContents.findIndex(
          (multiContent) => multiContent.sortOrder === action.payload.sortOrder,
        )
        if (index === -1) {
          return reindex([...multiContents, newMultiContent])
        }

        return reindex([
          ...multiContents.slice(0, index + 1),
          newMultiContent,
          ...multiContents.slice(index + 1),
        ])
      }

      if (action.type === 'update') {
        return multiContents.map((multiContent: MultiContentReducerItem) => {
          if (multiContent.id === action.payload.id) {
            // We potentially want to update the Contents of _other_ contents when this is updated, so "updated" is actually an important status
            const newStatus =
              action.payload.originalStatus === 'active' ? 'updated' : 'new'
            return {
              ...multiContent,
              status: newStatus,
              content: action.payload.content,
            }
          }

          return multiContent
        })
      }

      if (action.type === 'discard') {
        return multiContents.map((multiContent: MultiContentReducerItem) => {
          if (multiContent.id === action.payload.id) {
            return { ...multiContent, status: 'discarded' }
          }

          return multiContent
        })
      }

      if (action.type === 'removeNow') {
        // There's no going back from this
        return multiContents.filter(
          (multiContent) => multiContent.id !== action.payload.id,
        )
      }

      if (action.type === 'restore') {
        return multiContents.map((multiContent: MultiContentReducerItem) => {
          if (multiContent.id === action.payload.id) {
            return { ...multiContent, status: multiContent.originalStatus }
          }

          return multiContent
        })
      }

      return multiContents
    },
    existingMultiContents
      ? existingMultiContents
      : [
          {
            id: FIXED_NEW_MULTI_CONTENT_ID,
            sortOrder: 1,
            content: defaultMultiContents,
            status: 'new',
            originalStatus: 'new',
          },
        ],
  )

  return [multiContents, setMultiContents]
}

export default useMultiContentsReducer
