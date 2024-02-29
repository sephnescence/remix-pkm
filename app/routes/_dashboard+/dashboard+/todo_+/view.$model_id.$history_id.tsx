import { Form, Link, useLoaderData } from '@remix-run/react'
import { TodoLoaderResponse, todoLoader } from '~/controllers/TodoController'

export const loader = todoLoader

export default function TodoViewRoute() {
  const todoItem = useLoaderData<TodoLoaderResponse>()

  return (
    <div className="mx-4 my-4">
      <div className="text-5xl mb-4">View Todo Item</div>
      <Form method="POST" className="flex">
        <div className="w-full">
          <div className="mb-4">
            <label>
              <div className="mb-4">Content</div>
              <textarea
                className="min-w-full min-h-96 bg-white/20 p-4"
                name="content"
                defaultValue={todoItem.content}
                readOnly
              />
            </label>
          </div>
          <Link
            prefetch="intent"
            to={`/dashboard/todo/edit/${todoItem.modelId}/${todoItem.historyId}`}
          >
            <button
              className="border-solid border-2 border-blue-600 hover:bg-blue-600 px-4 py-2 rounded-lg mr-4"
              type="button"
            >
              Edit
            </button>
          </Link>
        </div>
      </Form>
    </div>
  )
}
