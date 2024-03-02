import { Link, useLoaderData } from '@remix-run/react'
import { trashIndexLoader } from '~/controllers/TrashController'

export const loader = trashIndexLoader

export default function TrashIndexRoute() {
  const trashIndexData = useLoaderData<typeof loader>()

  return (
    <div className="mx-4 my-4">
      <p className="text-5xl">Trash</p>
      <div className="mt-4 text-xl text-white/60 mb-4">
        Trashed items can be restored anywhere
      </div>
      <div className="mt-4">
        {trashIndexData?.trash
          ?.filter((item) => {
            return item.model_type === 'PkmTrash'
          })
          .map((item) => {
            return (
              <div key={item.model_id}>
                <Link
                  className="hover:underline"
                  prefetch="intent"
                  to={`/dashboard/trash/view/${item.model_id}/${item.history_id}`}
                >
                  {item.trash_item?.content}
                </Link>
              </div>
            )
          })}
      </div>
    </div>
  )
}
