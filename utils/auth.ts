import { getAuth } from '@clerk/remix/ssr.server'
import { db } from './db'
import { User } from '@prisma/client'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'

export const getClerkId = async (
  args: ActionFunctionArgs | LoaderFunctionArgs,
): Promise<string | null> => {
  const clerkUser = await getAuth(args)

  return clerkUser.userId
}

export const getUserAuth = async (
  args: ActionFunctionArgs | LoaderFunctionArgs,
): Promise<User | null> => {
  const clerkUser = await getAuth(args)

  const userId: string | null = clerkUser.userId

  if (!userId) {
    return null
  }

  return await db.user.findUnique({
    where: {
      clerkId: userId,
    },
  })
}

// There's a bit to fix here first it would seem
// I'm not ready yet until I go through the auth side of things maybe?
// export const userAuth = null
