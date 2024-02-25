import { Form } from '@remix-run/react'
import { Link } from 'react-router-dom'
import { EpiphanyCreateResponses } from '~/routes/_dashboard+/dashboard+/epiphanies_+/create'

export const NewPkmItemForm = (formData: EpiphanyCreateResponses) => {
  const { loaderData, actionResponse } = formData
  return (
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
          {actionResponse.errors.fieldErrors?.content && (
            <div className="text-red-500">
              {actionResponse.errors.fieldErrors?.content}
            </div>
          )}
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
          type="submit"
        >
          Submit
        </button>
        <Link to={'/dashboard'}>
          <button
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg ml-4"
            type="button"
          >
            Cancel
          </button>
        </Link>
      </div>
    </Form>
  )
}
