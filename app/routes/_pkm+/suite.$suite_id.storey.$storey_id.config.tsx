import { Link, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import ItemImageCarousel from '~/components/pkm/forms/ItemImageCarousel'
import { storeyConfigLoader } from '~/controllers/StoreyController'

export const loader = storeyConfigLoader

export default function StoreyConfigRoute() {
  const storey = useLoaderData<typeof loader>()

  const [interactive, setInteractive] = useState(() => false)
  const [submitting, setSubmitting] = useState(() => false)

  const handleDuplicate = async () => {
    setSubmitting(true)

    const thisForm = document.getElementById(
      'duplicate-storey',
    ) as HTMLFormElement
    if (!thisForm) {
      return false
    }

    const formData = new FormData(thisForm)
    formData.append('suiteId', storey.suiteId)
    formData.append('storeyId', storey.id)

    const res = await fetch(
      new Request('/api/duplicate', {
        method: 'POST',
        body: formData,
      }),
    )

    const resText = await res.text()
    const resJson = await JSON.parse(resText)

    if (!resJson.redirect) {
      setSubmitting(false)
    }

    if (resJson.success === false && resJson.redirect) {
      window.location.replace(resJson.redirect)
    }

    if (resJson.success === true && resJson.redirect) {
      window.location.href = resJson.redirect
    }
  }

  // Prevent form interaction while submitting and while the page is rendering
  useEffect(() => {
    setInteractive(true)
  }, [interactive])

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
          <ItemImageCarousel images={storey.images} />
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
            <Link
              to={`/content/view/suiteId/${storey.suiteId}/storeyId/${storey.id}`}
              prefetch="intent"
            >
              <button
                className="bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg"
                type="button"
              >
                View Content
              </button>
            </Link>
            <form id="duplicate-storey" onSubmit={() => false}>
              <button
                className={`bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg`}
                type="button"
                title="Duplicate"
                onClick={() => void handleDuplicate()}
                disabled={!interactive || submitting}
              >
                Duplicate
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
