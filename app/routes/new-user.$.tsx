import { db } from '@/utils/db'
import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunction, redirect } from '@remix-run/node'
import { randomUUID } from 'node:crypto'
import { sessionStorage } from '~/session/session.server'

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

  const transactions = []

  if (!user) {
    transactions.push(
      db.user.create({
        data: {
          id: userId,
          clerkId: clerkUserId,
          email: `${clerkUserId}@example.com`,
          username: `${clerkUserId}@example.com`,
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
        id: userId,
        user_id: userId,
        name: 'Welcome Center',
        description: 'Enjoy your stay at Innsight',
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
        id: userId,
        user_id: userId,
        suite_id: userId,
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
        id: userId,
        user_id: userId,
        storey_id: userId,
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
