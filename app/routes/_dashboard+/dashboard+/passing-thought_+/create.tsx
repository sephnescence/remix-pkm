import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'
import BoltIcon from '~/components/icons/BoltIcon'
import {
  PassingThoughtActionCreateResponse,
  passingThoughtActionCreate,
} from '~/controllers/PassingThoughtController'

export const action = passingThoughtActionCreate

export const loader = async () => {
  return {
    content: 'Create a new Passing Thought Item',
  }
}

export default function PassingThoughtCreateRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<PassingThoughtActionCreateResponse>()

  const { state } = useNavigation()

  return (
    <div className="mx-4 my-4">
      {actionData?.errors.fieldErrors.general && (
        <div className="text-red-500">
          {actionData.errors.fieldErrors.general}
        </div>
      )}
      <div className="text-5xl mb-4">
        New Passing Thought Item
        <BoltIcon />
      </div>
      <Form method="POST" className="flex">
        <div className="w-full">
          <div className="mb-4">
            <label>
              <div className="mb-4">Content</div>
              <textarea
                className="min-w-full min-h-96 bg-white/20 p-4"
                name="content"
                defaultValue={loaderData.content}
              />
            </label>
            <br />
            {actionData?.errors.fieldErrors.content && (
              <div className="text-red-500">
                {actionData.errors.fieldErrors?.content}
              </div>
            )}
          </div>
          <button
            className={`bg-blue-600 px-4 py-2 rounded-lg ${(state !== 'idle' && 'bg-gray-400') || 'hover:bg-blue-500'}`}
            type="submit"
            disabled={state !== 'idle'}
          >
            Submit
          </button>
          <Link to={'/dashboard'}>
            <button
              className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg ml-4"
              type="button"
              disabled={state !== 'idle'}
            >
              Cancel
            </button>
          </Link>
        </div>
      </Form>
    </div>
  )
}
