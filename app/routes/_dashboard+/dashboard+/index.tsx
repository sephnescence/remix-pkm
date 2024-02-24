import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import { Link, redirect, useLoaderData } from '@remix-run/react'
import { db } from '@/utils/db'
import { getClerkId } from '@/utils/auth'
import { LoaderFunctionArgs } from '@remix-run/node'

export const loader = async (args: LoaderFunctionArgs) => {
  const clerkId = await getClerkId(args)
  if (!clerkId) {
    return redirect('/')
  }
  // Just using the test user for now
  const user = await db.user.findFirst({
    where: {
      clerkId,
    },
    select: {
      pkm_history: {
        select: {
          model_id: true,
          model_type: true,
          epiphany_item: {
            select: {
              content: true,
            },
          },
          inbox_item: {
            select: {
              content: true,
            },
          },
          passing_thought_item: {
            select: {
              content: true,
            },
          },
          todo_item: {
            select: {
              content: true,
            },
          },
          void_item: {
            select: {
              content: true,
            },
          },
        },
      },
    },
  })

  /*
    Interesting to note right now that this performs seven queries. It's probably easier to just pull
    from each of the tables separately? Though it doesn't have relationship info built in

    i.e.
    0ms SELECT "public"."User"."id" FROM "public"."User" WHERE "public"."User"."clerkId" = $1 LIMIT $2 OFFSET $3
    0ms SELECT "public"."PkmHistory"."history_id", "public"."PkmHistory"."model_type", "public"."PkmHistory"."user_id" FROM "public"."PkmHistory" WHERE "public"."PkmHistory"."user_id" IN ($1) OFFSET $2
    0ms SELECT "public"."PkmEpiphany"."history_id", "public"."PkmEpiphany"."content" FROM "public"."PkmEpiphany" WHERE "public"."PkmEpiphany"."history_id" IN ($1,$2,$3,$4,$5) OFFSET $6
    0ms SELECT "public"."PkmInbox"."history_id", "public"."PkmInbox"."content" FROM "public"."PkmInbox" WHERE "public"."PkmInbox"."history_id" IN ($1,$2,$3,$4,$5) OFFSET $6
    0ms SELECT "public"."PkmPassingThought"."history_id", "public"."PkmPassingThought"."content" FROM "public"."PkmPassingThought" WHERE "public"."PkmPassingThought"."history_id" IN ($1,$2,$3,$4,$5) OFFSET $6
    0ms SELECT "public"."PkmTodo"."history_id", "public"."PkmTodo"."content" FROM "public"."PkmTodo" WHERE "public"."PkmTodo"."history_id" IN ($1,$2,$3,$4,$5) OFFSET $6
    0ms SELECT "public"."PkmVoid"."history_id", "public"."PkmVoid"."content" FROM "public"."PkmVoid" WHERE "public"."PkmVoid"."history_id" IN ($1,$2,$3,$4,$5) OFFSET $6
  */

  return { history: user?.pkm_history }
}

export default function DashboardRoute() {
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
                Create Epiphany
              </Link>
            </div>
            {loaderData.history
              ?.filter((item) => {
                return item.model_type === 'PkmEpiphany'
              })
              .map((item) => {
                return (
                  <div key={item.model_id} className="ml-4">
                    {item.epiphany_item?.content}
                  </div>
                )
              })}
            <div className="">
              <Link className="hover:underline" to="/dashboard/inbox/create">
                Create Inbox
              </Link>
            </div>
            {loaderData.history
              ?.filter((item) => {
                return item.model_type === 'PkmInbox'
              })
              .map((item) => {
                return (
                  <div key={item.model_id} className="ml-4">
                    {item.inbox_item?.content}
                  </div>
                )
              })}
            <div className="">
              <Link
                className="hover:underline"
                to="/dashboard/passing-thought/create"
              >
                Create Passing Thought
              </Link>
            </div>
            {loaderData.history
              ?.filter((item) => {
                return item.model_type === 'PkmPassingThought'
              })
              .map((item) => {
                return (
                  <div key={item.model_id} className="ml-4">
                    {item.passing_thought_item?.content}
                  </div>
                )
              })}
            <div className="">
              <Link className="hover:underline" to="/dashboard/todo/create">
                Create Todo
              </Link>
            </div>
            {loaderData.history
              ?.filter((item) => {
                return item.model_type === 'PkmTodo'
              })
              .map((item) => {
                return (
                  <div key={item.model_id} className="ml-4">
                    {item.todo_item?.content}
                  </div>
                )
              })}
            <div className="">
              <Link className="hover:underline" to="/dashboard/void/create">
                Create Void
              </Link>
            </div>
            {loaderData.history
              ?.filter((item) => {
                return item.model_type === 'PkmVoid'
              })
              .map((item) => {
                return (
                  <div key={item.model_id} className="ml-4">
                    {item.void_item?.content}
                  </div>
                )
              })}
          </div>
        </div>
      </SignedIn>
    </>
  )
}
