import { Link, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import ItemImageCarousel from '~/components/pkm/forms/ItemImageCarousel'
import { suiteConfigLoader } from '~/controllers/SuiteController'

export const loader = suiteConfigLoader

export default function SuiteConfigRoute() {
  const suite = useLoaderData<typeof loader>()

  const [interactive, setInteractive] = useState(() => false)
  const [submitting, setSubmitting] = useState(() => false)

  const handleWreck = async () => {
    if (!confirm('Are you sure you want to wreck this Suite?')) return false

    setSubmitting(true)

    const thisForm = document.getElementById('wreck-suite') as HTMLFormElement
    if (!thisForm) {
      return false
    }

    const formData = new FormData(thisForm)
    formData.append('suiteId', suite.id)

    const res = await fetch(
      new Request(`/api/history/suite/${suite.id}/wreck`, {
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

  const handleDuplicate = async () => {
    setSubmitting(true)

    const thisForm = document.getElementById(
      'duplicate-suite',
    ) as HTMLFormElement
    if (!thisForm) {
      return false
    }

    const formData = new FormData(thisForm)
    formData.append('suiteId', suite.id)

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
          <ItemImageCarousel images={suite.images} />
          <div className="flex gap-2">
            <Link to={`/suite/${suite.id}/config/edit`} prefetch="intent">
              <button
                className="bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg"
                type="button"
              >
                Edit
              </button>
            </Link>
            <Link to={`/content/view/suiteId/${suite.id}`} prefetch="intent">
              <button
                className="bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg"
                type="button"
              >
                View Content
              </button>
            </Link>
            <form id="duplicate-suite" onSubmit={() => false}>
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
            <form id="wreck-suite" onSubmit={() => false}>
              <button
                className={`bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg`}
                type="button"
                title="Wreck"
                onClick={() => void handleWreck()}
                disabled={!interactive || submitting}
              >
                Wreck
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
