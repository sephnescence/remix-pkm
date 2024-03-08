import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/remix'
import { Link, useLoaderData } from '@remix-run/react'
import Epiphany from '~/components/pkm/Epiphany'
import Inbox from '~/components/pkm/Inbox'
import PassingThought from '~/components/pkm/PassingThought'
import Todo from '~/components/pkm/Todo'
import Void from '~/components/pkm/Void'
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
          <div className="grid grid-cols-2">
            <div className="p-2">
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
                    <div
                      key={item.model_id}
                      className="rounded-full hover:ring-1 hover:ring-yellow-500"
                    >
                      <Link
                        className="rounded-full focus:border-red-500 focus:outline-offset-1 focus:outline-yellow-600"
                        prefetch="intent"
                        to={`/dashboard/inbox/edit/${item.model_id}/${item.history_id}`}
                      >
                        <Inbox inboxItem={item.inbox_item!} />
                      </Link>
                    </div>
                  )
                })}
            </div>
            <div className="p-2">
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
                    <div
                      key={item.model_id}
                      className="rounded-full hover:ring-1 hover:ring-lime-500"
                    >
                      <Link
                        className="rounded-full focus:border-red-500 focus:outline-offset-1 focus:outline-lime-600"
                        prefetch="intent"
                        to={`/dashboard/epiphanies/edit/${item.model_id}/${item.history_id}`}
                      >
                        <Epiphany epiphanyItem={item.epiphany_item!} />
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
                    <div
                      key={item.model_id}
                      className="rounded-full hover:ring-1 hover:ring-rose-500"
                    >
                      <Link
                        className="rounded-full focus:border-red-500 focus:outline-offset-1 focus:outline-rose-600"
                        prefetch="intent"
                        to={`/dashboard/passing-thought/edit/${item.model_id}/${item.history_id}`}
                      >
                        <PassingThought
                          passingThoughtItem={item.passing_thought_item!}
                        />
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
                    <div
                      key={item.model_id}
                      className="rounded-full hover:ring-1 hover:ring-cyan-500"
                    >
                      <Link
                        className="rounded-full focus:border-red-500 focus:outline-offset-1 focus:outline-cyan-600"
                        prefetch="intent"
                        to={`/dashboard/todo/edit/${item.model_id}/${item.history_id}`}
                      >
                        <Todo todoItem={item.todo_item!} />
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
                    <div
                      key={item.model_id}
                      className="rounded-full hover:ring-1 hover:ring-orange-500"
                    >
                      <Link
                        className="rounded-full focus:border-red-500 focus:outline-offset-1 focus:outline-orange-600"
                        prefetch="intent"
                        to={`/dashboard/void/edit/${item.model_id}/${item.history_id}`}
                      >
                        <Void voidItem={item.void_item!} />
                      </Link>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  )
}
