import { db } from '@/utils/db'
import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunction, redirect } from '@remix-run/node'
import { randomUUID } from 'node:crypto'
import { sessionStorage } from '~/session/session.server'
import { createClerkClient } from '@clerk/remix/api.server'
import {
  defaultSpaceId,
  defaultStoreyId,
  defaultSuiteId,
} from '~/repositories/PkmUserRepository'

export const loader: LoaderFunction = async (args) => {
  const clerkUser = await getAuth(args)

  const clerkUserId: string | null = clerkUser.userId

  if (!clerkUserId) {
    return redirect('/')
  }

  const user = await db.user.findUnique({
    where: {
      clerkId: clerkUserId,
    },
  })

  const userId = user?.id ?? randomUUID()

  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  })

  const clerkUserDetails = await clerkClient.users.getUser(clerkUserId)

  const transactions = []

  const newEmail =
    clerkUserDetails.emailAddresses[0].emailAddress ??
    `${clerkUserId}@example.com`

  if (!user) {
    transactions.push(
      db.user.create({
        data: {
          id: userId,
          clerkId: clerkUserId,
          email: newEmail,
          username: newEmail,
        },
      }),
    )
  }

  if (user?.email !== newEmail) {
    transactions.push(
      db.user.update({
        where: {
          id: userId,
        },
        data: {
          email: newEmail,
          username: newEmail,
        },
      }),
    )
  }

  // Even if the user already exists, ensure "auto healing" by upserting the default Suite, Storey, and Space
  transactions.push(
    db.suite.upsert({
      where: {
        id: userId,
      },
      update: {},
      create: {
        id: defaultSuiteId,
        user_id: userId,
        name: 'Welcome Center',
        description: 'Enjoy your stay at Rethought',
      },
    }),
  )

  transactions.push(
    db.storey.upsert({
      where: {
        id: userId,
      },
      update: {},
      create: {
        id: defaultStoreyId,
        user_id: userId,
        suite_id: defaultSuiteId,
        name: 'Foyer',
        description: 'Please head to reception',
      },
    }),
  )

  transactions.push(
    db.space.upsert({
      where: {
        id: userId,
      },
      update: {},
      create: {
        id: defaultSpaceId,
        user_id: userId,
        storey_id: defaultStoreyId,
        name: 'Reception',
        description: 'Check in',
      },
    }),
  )

  try {
    await db.$transaction(transactions)

    const cookieSession = await sessionStorage.getSession(
      args.request.headers.get('cookie'),
    )

    const headers = new Headers()

    cookieSession.set('userId', userId)

    headers.append(
      'set-cookie',
      await sessionStorage.commitSession(cookieSession),
    )

    return redirect('/reception', {
      headers,
    })
  } catch {
    return redirect('/')
  }
}

export default function NewUserRouter() {
  return <div>Signing you in</div>
}
