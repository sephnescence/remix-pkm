import { db } from '@/utils/db'
import { getAuth } from '@clerk/remix/ssr.server'
import { LoaderFunction, redirect } from '@remix-run/node'

export const loader: LoaderFunction = async (args) => {
  const clerkUser = await getAuth(args)

  const userId: string | null = clerkUser.userId

  if (!userId) {
    return redirect('/')
  }

  const user = await db.user.findUnique({
    where: {
      clerkId: userId,
    },
  })

  if (!user) {
    try {
      await db.user.create({
        data: {
          clerkId: userId,
          email: 'ignore@example.com',
          username: 'ignore@example.com',
        },
      })

      return redirect('/dashboard')
    } catch {
      // Swallow. The user has probably hit refresh or something that tried creating the same user twice
      // Email address is also a unique constraint, but I would expect clerk to take care of that
      return redirect('/dashboard')
    }
  }

  // User account already exists
  return redirect('/dashboard')
}

export default function NewUserRouter() {
  return <div>Signing you in</div>
}
