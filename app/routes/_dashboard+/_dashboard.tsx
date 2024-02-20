import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import { Outlet } from '@remix-run/react'

export default function DashboardBase() {
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
          <Outlet />
        </div>
      </SignedIn>
    </>
  )
}
