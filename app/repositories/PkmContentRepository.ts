// For some reason - refreshing the page will prevent codemirror from attaching so we must generate a fixed uuid
export const FIXED_NEW_MULTI_CONTENT_ID = 'd1c6045d-d304-4cd8-a65b-636771e2a68c'

export type PkmContentInput = {
  id: string
  sortOrder: number
  content: string
  modelId: string
  historyId: string
}
