import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import { Link } from '@remix-run/react'

export default function DashboardRoute() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="mx-4 my-4 absolute top-0 right-0">
          <UserButton afterSignOutUrl="/" />
        </div>
        <div className="mx-4 my-4">
          <p className="text-5xl">Dashboard</p>
          <div className="mt-4 text-xl text-white/60 mb-4">
            Monitor your Inbox and quickly assign them to the correct areas
          </div>
          <div className="mt-4">
            <div className="">
              <Link
                className="hover:underline"
                to="/dashboard/epiphanies/create"
              >
                Create Epiphany
              </Link>
            </div>
            <div className="">
              <Link className="hover:underline" to="/dashboard/inbox/create">
                Create Inbox
              </Link>
            </div>
            <div className="">
              <Link
                className="hover:underline"
                to="/dashboard/passing-thought/create"
              >
                Create Passing Thought
              </Link>
            </div>
            <div className="">
              <Link className="hover:underline" to="/dashboard/todo/create">
                Create Todo
              </Link>
            </div>
            <div className="">
              <Link className="hover:underline" to="/dashboard/void/create">
                Create Void
              </Link>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  )
}
