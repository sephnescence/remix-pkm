import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import { Link, redirect, useLoaderData } from '@remix-run/react'
import { getClerkId } from '@/utils/auth'
import { LoaderFunctionArgs, TypedResponse } from '@remix-run/node'
import { getUserDashboardByClerkId } from '~/repositories/PkmUserRepository'
import type { PkmHistoryForDashboard } from '~/repositories/PkmHistoryRepository'

type DashboardInboxLoaderResponse =
  | PkmHistoryForDashboard
  | TypedResponse<never>
  | null

export const loader = async (
  args: LoaderFunctionArgs,
): Promise<DashboardInboxLoaderResponse> => {
  const clerkId = await getClerkId(args)
  if (!clerkId) {
    return redirect('/')
  }

  const user = await getUserDashboardByClerkId(clerkId)

  if (!user) {
    return redirect('/')
  }

  return { history: user.pkm_history }
}

export default function DashboardIndexRoute() {
  const loaderData = useLoaderData<typeof loader>()
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
                      to={`/dashboard/epiphanies/view/${item.model_id}/${item.history_id}`}
                    >
                      {item.epiphany_item?.content}
                    </Link>
                  </div>
                )
              })}
            <div className="">
              <Link className="hover:underline" to="/dashboard/inbox/create">
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
                      to={`/dashboard/inbox/view/${item.model_id}/${item.history_id}`}
                    >
                      {item.inbox_item?.content}
                    </Link>
                  </div>
                )
              })}
            <div className="">
              <Link
                className="hover:underline"
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
                      to={`/dashboard/passing-thought/view/${item.model_id}/${item.history_id}`}
                    >
                      {item.passing_thought_item?.content}
                    </Link>
                  </div>
                )
              })}
            <div className="">
              <Link className="hover:underline" to="/dashboard/todo/create">
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
                      to={`/dashboard/todo/view/${item.model_id}/${item.history_id}`}
                    >
                      {item.todo_item?.content}
                    </Link>
                  </div>
                )
              })}
            <div className="">
              <Link className="hover:underline" to="/dashboard/void/create">
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
                      to={`/dashboard/void/view/${item.model_id}/${item.history_id}`}
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
