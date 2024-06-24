import { Outlet } from '@remix-run/react'
import TopNav from '~/components/nav/TopNav'

export default function DashboardBase() {
  return (
    <>
      <TopNav />
      <Outlet />
      <div className="bg-blue-700"></div>
    </>
  )
}
