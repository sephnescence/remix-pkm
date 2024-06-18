import { Outlet } from '@remix-run/react'
import TopNav from '~/components/nav/TopNav'

export default function DashboardBase() {
  return (
    <>
      <TopNav />
      <Outlet />
    </>
  )
}
