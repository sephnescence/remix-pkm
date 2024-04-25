import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import { Link, Outlet } from '@remix-run/react'
import PkmIcon from '~/components/icons/PkmIcon'
import TrashIcon from '~/components/icons/TrashIcon'
import TopNav from '~/components/nav/TopNav'

export default function DashboardBase() {
  return (
    <>
      <TopNav />
      <Outlet />
    </>
  )
}
