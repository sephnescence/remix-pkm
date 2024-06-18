import { Prisma } from '@prisma/client'
import { db } from '../db'

export type DetailsForBreadcrumbs = {
  suiteId: string
  suiteName: string
  storeyId: string
  storeyName: string
  spaceId: string
  spaceName: string
}

export const getDetailsForBreadcrumbs = async ({
  userId,
  suiteId,
  storeyId,
  spaceId,
}: {
  userId: string
  suiteId: string | null
  storeyId: string | null
  spaceId: string | null
}) => {
  // Random. I have to wrap "spaceId" in the double quotes or what comes back is "spaceid". It makes it lower case

  // This query runs in 0.001s, so I'm confident it's performant, especially as a quick check to assert the user
  //    That was passed in owns the Suite, Storey, or Space
  const query =
    storeyId === null
      ? Prisma.sql`
        select
            "Suite".id as "suiteId",
            "Suite".name as "suiteName",
            '' as "storeyId",
            '' as "storeyName",
            '' as "spaceId",
            '' as "spaceName"
        from "Suite"
        where "Suite".id = ${suiteId}::uuid
            and "Suite".user_id = ${userId}::uuid
    `
      : spaceId === null
        ? Prisma.sql`
            select
                "Suite".id as "suiteId",
                "Suite".name as "suiteName",
                "Storey".id as "storeyId",
                "Storey".name as "storeyName",
                '' as "spaceId",
                '' as "spaceName"
            from "Storey"
            join "Suite" on "Suite".id = "Storey".suite_id and "Suite".id = ${suiteId}::uuid and "Suite".user_id = ${userId}::uuid
            where "Storey".id = ${storeyId}::uuid
                and "Storey".user_id = ${userId}::uuid
        `
        : Prisma.sql`
            select
                "Suite".id as "suiteId",
                "Suite".name as "suiteName",
                "Storey".id as "storeyId",
                "Storey".name as "storeyName",
                "Space".id as "spaceId",
                "Space".name as "spaceName"
            from "Space"
            join "Storey" on "Storey".id = "Space".storey_id and "Storey".id = ${storeyId}::uuid and "Storey".user_id = ${userId}::uuid
            join "Suite" on "Suite".id = "Storey".suite_id and "Suite".id = ${suiteId}::uuid and "Suite".user_id = ${userId}::uuid
            where "Space".id = ${spaceId}::uuid
                and "Space".user_id = ${userId}::uuid
        `

  const loggedInUserOwnsSuiteStoreySpace: DetailsForBreadcrumbs[] =
    await db.$queryRaw(query)

  if (!loggedInUserOwnsSuiteStoreySpace) {
    return null
  }

  return loggedInUserOwnsSuiteStoreySpace[0]
}
