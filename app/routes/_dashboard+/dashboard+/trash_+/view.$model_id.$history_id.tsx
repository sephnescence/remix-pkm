import { Form, useLoaderData } from '@remix-run/react'
import RestoreTo from '~/components/RestoreTo'
import { TrashLoaderResponse, trashLoader } from '~/controllers/TrashController'

export const loader = trashLoader

export default function TrashViewRoute() {
  const trashItem = useLoaderData<TrashLoaderResponse>()

  return (
    <div className="mx-4 my-4">
      <div className="text-5xl mb-4">View Trash Item</div>
      <Form method="POST" className="flex">
        <div className="w-full">
          <div className="mb-4">
            <label>
              <div className="mb-4">Content</div>
              <textarea
                className="min-w-full min-h-96 bg-white/20 p-4"
                name="content"
                defaultValue={trashItem.content}
                readOnly
              />
            </label>
          </div>
        </div>
      </Form>
      <hr className="my-4" />
      <RestoreTo item={trashItem} />
    </div>
  )
}
