import { db } from '@/utils/db'
import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunction, redirect } from '@remix-run/node'
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

  const cookieSession = await sessionStorage.getSession(
    args.request.headers.get('cookie'),
  )

  cookieSession.set('userId', user?.id)
  const headers = new Headers()
  headers.append(
    'set-cookie',
    await sessionStorage.commitSession(cookieSession),
  )

  if (!user) {
    try {
      await db.user.create({
        data: {
          clerkId: clerkUserId,
          email: 'ignore@example.com',
          username: 'ignore@example.com',
        },
      })

      return redirect('/dashboard', {
        headers,
      })
    } catch {
      // Swallow. The user has probably hit refresh or something that tried creating the same user twice
      // Email address is also a unique constraint, but I would expect clerk to take care of that
      return redirect('/dashboard', {
        headers,
      })
    }
  }

  // User account already exists
  return redirect('/dashboard', {
    headers,
  })
}

export default function NewUserRouter() {
  return <div>Signing you in</div>
}
