import { Link, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import LinkIcon from '~/components/icons/LinkIcon'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import CopyToClipBoardButton from '~/components/pkm/forms/CopyToClipBoardButton'
import ItemImageCarousel from '~/components/pkm/forms/ItemImageCarousel'
import { spaceConfigLoader } from '~/controllers/SpaceController'

export const loader = spaceConfigLoader

export default function StoreyConfigRoute() {
  const space = useLoaderData<typeof loader>()

  const [interactive, setInteractive] = useState(() => false)
  const [submitting, setSubmitting] = useState(() => false)

  const handleWreck = async () => {
    if (!confirm('Are you sure you want to wreck this Space?')) return false

    setSubmitting(true)

    const thisForm = document.getElementById('wreck-space') as HTMLFormElement
    if (!thisForm) {
      return false
    }

    const formData = new FormData(thisForm)
    formData.append('suiteId', space.suiteId)
    formData.append('storeyId', space.storeyId)
    formData.append('spaceId', space.id)

    const res = await fetch(
      new Request(
        `/api/history/suite/${space.suiteId}/storey/${space.storeyId}/space/${space.id}/wreck`,
        {
          method: 'POST',
          body: formData,
        },
      ),
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
      'duplicate-space',
    ) as HTMLFormElement
    if (!thisForm) {
      return false
    }

    const formData = new FormData(thisForm)
    formData.append('storeyId', space.storeyId)
    formData.append('spaceId', space.id)

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
      <SpaceBreadcrumbs
        suiteId={space.suiteId}
        suiteName={space.suiteName}
        storeyId={space.storeyId}
        storeyName={space.storeyName}
        spaceId={space.id}
        spaceName={space.name}
      />
      <div className="">
        <div className="text-4xl mb-2">View Space</div>
        <div className="w-full mb-4">
          <div className="mb-4">
            <label>
              <div className="mb-4">
                Name
                <CopyToClipBoardButton
                  className="p-1 bg-violet-700 hover:bg-violet-600 ml-2"
                  display={<LinkIcon className="w-3 h-3" />}
                  copy={`<span name="/modelId/${space.id}"></span>`}
                />
              </div>
              <input
                type="text"
                className="min-w-full bg-slate-800 p-4"
                name="name"
                defaultValue={space.name}
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
                defaultValue={space.description}
                readOnly
              />
            </label>
          </div>
          <div className="mb-4">
            <div className="mb-4">
              Content
              <CopyToClipBoardButton
                className="p-1 bg-violet-700 hover:bg-violet-600 ml-2"
                display={<LinkIcon className="w-3 h-3" />}
                copy={`<div contents="/modelId/${space.id}"></div>`}
              />
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: space.resolvedContent,
              }}
            />
          </div>
          <ItemImageCarousel images={space.images} />
          <div className="flex gap-2 overflow-x-scroll">
            <div className="text-nowrap">
              <Link
                to={`/suite/${space.suiteId}/storey/${space.storeyId}/space/${space.id}/dashboard?tab=content`}
                prefetch="intent"
              >
                <button
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
                  type="button"
                >
                  Return to Dashboard
                </button>
              </Link>
            </div>
            <div className="text-nowrap">
              <Link
                to={`/suite/${space.suiteId}/storey/${space.storeyId}/space/${space.id}/config/edit`}
                prefetch="intent"
              >
                <button
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
                  type="button"
                >
                  Edit
                </button>
              </Link>
            </div>
            <div className="text-nowrap">
              <Link
                to={`/content/view/storeyId/${space.storeyId}/spaceId/${space.id}`}
                prefetch="intent"
              >
                <button
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
                  type="button"
                >
                  View Content
                </button>
              </Link>
            </div>
            <div className="text-nowrap">
              <form id="duplicate-space" onSubmit={() => false}>
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
            </div>
            <div className="text-nowrap">
              <form id="wreck-space" onSubmit={() => false}>
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
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
