import { feModelTypeMap } from '@/utils/apiUtils'
import { Link, useLoaderData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import LinkIcon from '~/components/icons/LinkIcon'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import CopyToClipBoardButton from '~/components/pkm/forms/CopyToClipBoardButton'
import ItemImageCarousel from '~/components/pkm/forms/ItemImageCarousel'
import { ItemLoaderResponse, itemLoader } from '~/controllers/ItemController'

export const loader = itemLoader

export default function ViewItemRoute() {
  const loaderData = useLoaderData<typeof loader>()

  const { args, history, images, item, resolvedContent } =
    loaderData as ItemLoaderResponse

  const [interactive, setInteractive] = useState(() => false)
  const [submitting, setSubmitting] = useState(() => false)

  const handleDuplicate = async () => {
    setSubmitting(true)

    const thisForm = document.getElementById(
      'duplicate-item',
    ) as HTMLFormElement
    if (!thisForm) {
      return false
    }

    const formData = new FormData(thisForm)
    formData.append('apiEndpoint', args.apiDuplicateUrl)

    const res = await fetch(
      new Request(args.apiDuplicateUrl, {
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
      {args.itemLocationName === 'Suite' && history.historyItem!.suite && (
        <SuiteBreadcrumbs
          suiteId={history.historyItem!.suite.id}
          suiteName={history.historyItem!.suite.name}
        />
      )}
      {args.itemLocationName === 'Storey' && history.historyItem!.storey && (
        <StoreyBreadcrumbs
          suiteId={history.historyItem!.storey.suite.id}
          suiteName={history.historyItem!.storey.suite.name}
          storeyId={history.historyItem!.storey.id}
          storeyName={history.historyItem!.storey.name}
        />
      )}
      {args.itemLocationName === 'Space' && history.historyItem!.space && (
        <SpaceBreadcrumbs
          suiteId={`${history.historyItem!.space.storey.suite.id}`}
          suiteName={`${history.historyItem!.space.storey.suite.name}`}
          storeyId={history.historyItem!.space.storey.id}
          storeyName={history.historyItem!.space.storey.name}
          spaceId={history.historyItem!.space.id}
          spaceName={history.historyItem!.space.name}
        />
      )}
      <div className="">
        <div className="text-4xl mb-2">
          View {args.itemLocationName}{' '}
          {feModelTypeMap[args.conformedArgs.eModelType]} Item
        </div>
        <div className="w-full mb-4">
          <div className="mb-4">
            <label>
              <div className="mb-4">
                Name
                <CopyToClipBoardButton
                  className="p-1 bg-violet-700 hover:bg-violet-600 ml-2"
                  display={<LinkIcon className="w-3 h-3" />}
                  copy={`<span name="/modelId/${args.conformedArgs.eModelId}"></span>`}
                />
              </div>
              <input
                type="text"
                className="min-w-full bg-slate-800 p-4"
                name="name"
                defaultValue={item.name}
                readOnly
              />
            </label>
          </div>
          <div className="mb-4">
            <label>
              <div className="mb-4">Summary</div>
              <textarea
                className="min-w-full min-h-48 bg-slate-800 p-4"
                name="summary"
                defaultValue={item.summary}
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
                copy={`<div contents="/modelId/${args.conformedArgs.eModelId}"></div>`}
              />
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: resolvedContent,
              }}
            />
          </div>
          <ItemImageCarousel images={images} />
          <div className="flex gap-2">
            <Link to={args.feEditUrl}>
              <button
                className="bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg"
                type="button"
              >
                Edit
              </button>
            </Link>
            <Link to={args.fePermalinkUrl}>
              <button
                className="bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg"
                type="button"
              >
                Permalink
              </button>
            </Link>
            <Link to={args.feAlwaysLatestUrl}>
              <button
                className="bg-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg"
                type="button"
              >
                Always-Latest Link
              </button>
            </Link>
            <Link to={args.feMoveUrl}>
              <button
                className="bg-indigo-600 hover:bg-indigo-600 px-4 py-2 rounded-lg"
                type="button"
              >
                Move
              </button>
            </Link>
            <form id="duplicate-item" onSubmit={() => false}>
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
            <Link to={args.feParentUrl}>
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
