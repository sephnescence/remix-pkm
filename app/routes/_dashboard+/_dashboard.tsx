import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import { Link, Outlet } from '@remix-run/react'

export default function DashboardBase() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="mx-4 my-4 absolute top-0 right-0 flex">
          <div className="mr-4">
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="mr-4">
            <Link to="/dashboard/trash">Trash</Link>
          </div>
          <div className="mr-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <div className="mx-4 my-4">
          <Outlet />
        </div>
      </SignedIn>
    </>
  )
}
