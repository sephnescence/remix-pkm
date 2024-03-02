import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/remix'
import { Link, useLoaderData } from '@remix-run/react'
import { dashboardIndexLoader } from '~/controllers/DashboardController'

export const loader = dashboardIndexLoader

export default function DashboardIndexRoute() {
  const loaderData = useLoaderData<typeof loader>()
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="mx-4 my-4">
          <p className="text-5xl">Dashboard</p>
          <div className="mt-4 text-xl text-white/60 mb-4">
            Monitor your Inbox and quickly assign them to the correct areas
          </div>
          <div className="mt-4">
            <div className="">
              <Link
                className="hover:underline"
                prefetch="intent"
                to="/dashboard/epiphanies/create"
              >
                Create Epiphany Item
              </Link>
            </div>
            {loaderData?.history
              ?.filter((item) => {
                return item.model_type === 'PkmEpiphany'
              })
              .map((item) => {
                return (
                  <div key={item.model_id} className="ml-4">
                    <Link
                      className="hover:underline"
                      prefetch="intent"
                      to={`/dashboard/epiphanies/edit/${item.model_id}/${item.history_id}`}
                    >
                      {item.epiphany_item?.content}
                    </Link>
                  </div>
                )
              })}
            <div className="">
              <Link
                className="hover:underline"
                prefetch="intent"
                to="/dashboard/inbox/create"
              >
                Create Inbox Item
              </Link>
            </div>
            {loaderData?.history
              ?.filter((item) => {
                return item.model_type === 'PkmInbox'
              })
              .map((item) => {
                return (
                  <div key={item.model_id} className="ml-4">
                    <Link
                      className="hover:underline"
                      prefetch="intent"
                      to={`/dashboard/inbox/edit/${item.model_id}/${item.history_id}`}
                    >
                      {item.inbox_item?.content}
                    </Link>
                  </div>
                )
              })}
            <div className="">
              <Link
                className="hover:underline"
                prefetch="intent"
                to="/dashboard/passing-thought/create"
              >
                Create Passing Thought Item
              </Link>
            </div>
            {loaderData?.history
              ?.filter((item) => {
                return item.model_type === 'PkmPassingThought'
              })
              .map((item) => {
                return (
                  <div key={item.model_id} className="ml-4">
                    <Link
                      className="hover:underline"
                      prefetch="intent"
                      to={`/dashboard/passing-thought/edit/${item.model_id}/${item.history_id}`}
                    >
                      {item.passing_thought_item?.content}
                    </Link>
                  </div>
                )
              })}
            <div className="">
              <Link
                className="hover:underline"
                prefetch="intent"
                to="/dashboard/todo/create"
              >
                Create Todo Item
              </Link>
            </div>
            {loaderData?.history
              ?.filter((item) => {
                return item.model_type === 'PkmTodo'
              })
              .map((item) => {
                return (
                  <div key={item.model_id} className="ml-4">
                    <Link
                      className="hover:underline"
                      prefetch="intent"
                      to={`/dashboard/todo/edit/${item.model_id}/${item.history_id}`}
                    >
                      {item.todo_item?.content}
                    </Link>
                  </div>
                )
              })}
            <div className="">
              <Link
                className="hover:underline"
                prefetch="intent"
                to="/dashboard/void/create"
              >
                Create Void Item
              </Link>
            </div>
            {loaderData?.history
              ?.filter((item) => {
                return item.model_type === 'PkmVoid'
              })
              .map((item) => {
                return (
                  <div key={item.model_id} className="ml-4">
                    <Link
                      className="hover:underline"
                      prefetch="intent"
                      to={`/dashboard/void/edit/${item.model_id}/${item.history_id}`}
                    >
                      {item.void_item?.content}
                    </Link>
                  </div>
                )
              })}
          </div>
        </div>
      </SignedIn>
    </>
  )
}
