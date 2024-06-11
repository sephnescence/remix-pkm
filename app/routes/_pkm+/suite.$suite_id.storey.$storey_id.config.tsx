import { Link, useLoaderData } from '@remix-run/react'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import { storeyConfigLoader } from '~/controllers/StoreyController'

export const loader = storeyConfigLoader

export default function StoreyConfigRoute() {
  const storey = useLoaderData<typeof loader>()

  return (
    <>
      <StoreyBreadcrumbs
        suiteId={storey.suiteId}
        suiteName={storey.suiteName}
        storeyId={storey.id}
        storeyName={storey.name}
      />
      <div className="">
        <div className="text-4xl mb-2">View Storey</div>
        <div className="w-full mb-4">
          <div className="mb-4">
            <label>
              <div className="mb-4">Name</div>
              <input
                type="text"
                className="min-w-full bg-slate-800 p-4"
                name="name"
                defaultValue={storey.name}
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
                defaultValue={storey.description}
                readOnly
              />
            </label>
          </div>
          <div className="mb-4">
            <div className="mb-4">Content</div>
            <div
              dangerouslySetInnerHTML={{
                __html: storey.resolvedContent,
              }}
            />
          </div>
          <div className="flex gap-2">
            <Link
              to={`/suite/${storey.suiteId}/storey/${storey.id}/config/edit`}
              prefetch="intent"
            >
              <button
                className="bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg"
                type="button"
              >
                Edit
              </button>
            </Link>
            <Link to={`/content/storeyId/${storey.id}`} prefetch="intent">
              <button
                className="bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg"
                type="button"
              >
                View Content (BTTODO)
              </button>
            </Link>
            <form
              action={`/api/storey/${storey.id}/config/duplicate`}
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
              to={`/suite/${storey.suiteId}/storey/${storey.id}/dashboard?tab=content`}
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
