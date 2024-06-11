import { Link, useLoaderData } from '@remix-run/react'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import { suiteConfigLoader } from '~/controllers/SuiteController'

export const loader = suiteConfigLoader

export default function SuiteConfigRoute() {
  const suite = useLoaderData<typeof loader>()

  return (
    <>
      <SuiteBreadcrumbs suiteId={suite.id} suiteName={suite.name} />
      <div className="">
        <div className="text-4xl mb-2">View Suite</div>
        <div className="w-full mb-4">
          <div className="mb-4">
            <label>
              <div className="mb-4">Name</div>
              <input
                type="text"
                className="min-w-full bg-slate-800 p-4"
                name="name"
                defaultValue={suite.name}
                readOnly
              />
            </label>
          </div>
          <div className="mb-4">
            <label>
              <div className="mb-4">Description</div>
              <textarea
                className="min-w-full min-h-48 bg-slate-800 p-4"
                name="description"
                defaultValue={suite.description}
                readOnly
              />
            </label>
          </div>
          <div className="mb-4">
            <div className="mb-4">Content</div>
            <div
              dangerouslySetInnerHTML={{
                __html: suite.resolvedContent,
              }}
            />
          </div>
          <div className="flex gap-2">
            <Link to={`/suite/${suite.id}/config/edit`} prefetch="intent">
              <button
                className="bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg"
                type="button"
              >
                Edit
              </button>
            </Link>
            <Link to={`/content/suiteId/${suite.id}`} prefetch="intent">
              <button
                className="bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg"
                type="button"
              >
                View Content (BTTODO)
              </button>
            </Link>
            <form
              action={`/api/suite/${suite.id}/config/duplicate`}
              method="POST"
            >
              <button
                className={`bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg`}
                type="submit"
                title="Duplicate"
              >
                Duplicate (BTTODO)
              </button>
            </form>
            <Link
              to={`/suite/${suite.id}/dashboard?tab=content`}
              prefetch="intent"
            >
              <button
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg"
                type="button"
              >
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
