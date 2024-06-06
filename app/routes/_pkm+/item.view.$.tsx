import { feModelTypeMap } from '@/utils/apiUtils'
import { Link, useLoaderData } from '@remix-run/react'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import StoreyBreadcrumbs from '~/components/nav/StoreyBreadcrumbs'
import SuiteBreadcrumbs from '~/components/nav/SuiteBreadcrumbs'
import ItemImageCarousel from '~/components/pkm/forms/ItemImageCarousel'
import { ItemLoaderResponse, itemLoader } from '~/controllers/ItemController'

export const loader = itemLoader

export default function ViewItemRoute() {
  const loaderData = useLoaderData<typeof loader>()

  const { args, history, images, item } = loaderData as ItemLoaderResponse

  return (
    <>
      {args.itemLocationName === 'Suite' && history.historyItem!.suite && (
        <SuiteBreadcrumbs
          suiteId={args.conformedArgs.eSuiteId ?? ''}
          suiteName={history.historyItem!.suite.name}
        />
      )}
      {args.itemLocationName === 'Storey' && history.historyItem!.storey && (
        <StoreyBreadcrumbs
          suiteId={args.conformedArgs.eSuiteId ?? ''}
          suiteName={history.historyItem!.storey.suite.name}
          storeyId={args.conformedArgs.eStoreyId ?? ''}
          storeyName={history.historyItem!.storey.name}
        />
      )}
      {args.itemLocationName === 'Space' && history.historyItem!.space && (
        <SpaceBreadcrumbs
          suiteId={args.conformedArgs.eSuiteId ?? ''}
          suiteName={`${history.historyItem!.space.storey.suite.name}`}
          storeyId={args.conformedArgs.eStoreyId ?? ''}
          storeyName={history.historyItem!.space.storey.name}
          spaceId={args.conformedArgs.eSpaceId ?? ''}
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
              <div className="mb-4">Name</div>
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
            <div className="mb-4">Content</div>
            <div
              dangerouslySetInnerHTML={{
                __html: item.content,
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
            <form action={args.apiDuplicateUrl} method="POST">
              <button
                className={`bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg`}
                type="submit"
                title="Duplicate"
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
