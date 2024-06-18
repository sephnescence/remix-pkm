import { Outlet } from '@remix-run/react'
import TopNav from '~/components/nav/TopNav'

export default function PkmLayout() {
  return (
    <>
      <TopNav />
      <div className="mx-4 md:mx-0 mt-12 md:mt-0 mb-4 md:mb-0">
        <div className="grid grid-cols-1 xl:grid-cols-6 xl:min-h-screen">
          <div className="xl:grid-cols-1 hidden xl:block pl-4 pr-2 py-4"></div>
          <div className="xl:col-span-4 px-2 py-2 xl:border-x-2 xl:border-blue-950">
            <Outlet />
          </div>
          <div className="hidden xl:block grid-cols-1 pl-2 pr-4 py-4"></div>
        </div>
      </div>
    </>
  )
}
