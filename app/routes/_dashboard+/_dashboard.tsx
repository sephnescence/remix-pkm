import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import { Link, Outlet } from '@remix-run/react'
import PkmIcon from '~/components/icons/PkmIcon'
import TrashIcon from '~/components/icons/TrashIcon'

export default function DashboardBase() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="mx-4 my-4 absolute top-0 right-0 flex">
          <div className="mr-4">
            <Link to="/dashboard" prefetch="intent">
              <PkmIcon className="w-8 h-8" />
            </Link>
          </div>
          <div className="mr-4 bg-slate-600 rounded-full">
            <Link to="/dashboard/trash" prefetch="intent">
              <TrashIcon className="w-8 h-8" style={{ scale: '0.5' }} />
            </Link>
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
