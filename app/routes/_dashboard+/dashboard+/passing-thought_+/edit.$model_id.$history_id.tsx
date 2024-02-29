import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import {
  PassingThoughtActionUpdateResponse,
  PassingThoughtLoaderResponse,
  passingThoughtActionUpdate,
  passingThoughtLoader,
} from '~/controllers/PassingThoughtController'

export const action = passingThoughtActionUpdate
export const loader = passingThoughtLoader

export default function PassingThoughtEditRoute() {
  const passingThoughtItem = useLoaderData<PassingThoughtLoaderResponse>()
  const actionData = useActionData<PassingThoughtActionUpdateResponse>()

  return (
    <div className="mx-4 my-4">
      {actionData?.errors.fieldErrors.general && (
        <div className="text-red-500">
          {actionData.errors.fieldErrors.general}
        </div>
      )}
      <div className="text-5xl mb-4">Edit PassingThought Item</div>
      <Form method="POST" className="flex">
        <div className="w-full">
          <div className="mb-4">
            <label>
              <div className="mb-4">Content</div>
              <textarea
                className="min-w-full min-h-96 bg-white/20 p-4"
                name="content"
                defaultValue={passingThoughtItem.content}
              />
            </label>
            <br />
            {actionData?.errors.fieldErrors.content && (
              <div className="text-red-500">
                {actionData.errors.fieldErrors.content}
              </div>
            )}
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg mr-4"
            type="submit"
          >
            Submit
          </button>
          <Link to={'/dashboard'}>
            <button
              className="border-solid border-2 border-red-600 hover:bg-red-600 px-4 py-2 rounded-lg mr-4"
              type="button"
            >
              Cancel
            </button>
          </Link>
        </div>
      </Form>
    </div>
  )
}
