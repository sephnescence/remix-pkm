import { db } from '@/utils/db'
import { Prisma } from '@prisma/client'

// For some reason - refreshing the page will prevent codemirror from attaching so we must generate a fixed uuid
export const FIXED_NEW_MULTI_CONTENT_ID = 'd1c6045d-d304-4cd8-a65b-636771e2a68c'

export type PkmContentInput = {
  id: string
  sortOrder: number
  content: string
  modelId: string
  historyId: string
}

export const getContentsByModelId = async ({
  modelId,
  userId,
}: {
  modelId: string
  userId: string
}) => {
  const query = Prisma.sql`
    select
	    c.content
    from "PkmHistory" h
    join "PkmContents" c on c.history_id = h.history_id and c.model_id = h.model_id
    where h.is_current is true
      and h.model_id = ${modelId}::uuid
      and h.user_id = ${userId}::uuid
    order by c.sort_order asc
  `

  const results: [] = await db.$queryRaw(query)

  return results
}

export const getContentsByAlwaysLatestContentId = async ({
  alwaysLatestContentId,
  userId,
}: {
  alwaysLatestContentId: string
  userId: string
}) => {
  const query = Prisma.sql`
    select
	    c.content
    from "PkmHistory" h
    join "PkmContents" c on c.history_id = h.history_id and c.model_id = h.model_id
    where h.is_current is true
      and c.content_id = ${alwaysLatestContentId}::uuid
      and h.user_id = ${userId}::uuid
    order by c.sort_order asc
  `

  const results: [] = await db.$queryRaw(query)

  return results
}

export const getContentsByPermalinkId = async ({
  permalinkId,
  userId,
}: {
  permalinkId: string
  userId: string
}) => {
  const query = Prisma.sql`
    select
	    c.content
    from "PkmHistory" h
    join "PkmContents" c on c.history_id = h.history_id and c.model_id = h.model_id
    where c.id = ${permalinkId}::uuid
      and h.user_id = ${userId}::uuid
    order by c.sort_order asc
  `

  const results: [] = await db.$queryRaw(query)

  return results
}
