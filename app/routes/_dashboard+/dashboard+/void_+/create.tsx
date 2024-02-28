import { getUserAuth } from '@/utils/auth'
import { ActionFunctionArgs, TypedResponse, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { CreateVoidItem } from '~/repositories/PkmVoidRepository'

export type VoidCreateResponses = {
  loaderData: VoidLoaderResponse
  actionData: VoidActionResponse | undefined
}

type VoidActionResponse = {
  errors: {
    fieldErrors: {
      content: string
    }
  }
}

type VoidLoaderResponse = {
  content: string
}

export const action = async (
  args: ActionFunctionArgs,
): Promise<VoidActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const { request } = args

  const formData = await request.formData()
  if (!formData) {
    return redirect('/')
  }

  const content: FormDataEntryValue | null = formData.get('content') // Why does this think it's type "File"

  if (!content || content === '') {
    return {
      errors: {
        fieldErrors: {
          content: 'Content cannot be empty',
        },
      },
    }
  }

  await CreateVoidItem({
    userId: user.id,
    content: content.toString(),
  })

  return redirect('/dashboard')
}

export const loader = async (): Promise<VoidLoaderResponse> => {
  return {
    content: 'Create a new Void Item',
  }
}

export default function EpiphanyCreate() {
  const loaderData = useLoaderData<VoidLoaderResponse>()
  const actionData = useActionData<VoidActionResponse>()

  return (
    <div className="mx-4 my-4">
      <div className="text-5xl mb-4">New Void Item</div>
      {/* <NewPkmItemForm loaderData={loaderData} actionData={actionData} /> */}
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
                {actionData.errors.fieldErrors.content}
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
    </div>
  )
}
