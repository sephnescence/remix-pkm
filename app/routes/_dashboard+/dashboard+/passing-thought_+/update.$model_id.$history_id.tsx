import { getUserAuth } from '@/utils/auth'
import { db } from '@/utils/db'
import { User } from '@prisma/client'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
  redirect,
} from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import { UpdatePassingThoughtItem } from '~/repositories/PkmPassingThoughtRepository'

export type PassingThoughtEditResponses = {
  loaderData: PassingThoughtEditLoaderResponse
  actionData: PassingThoughtEditActionResponse | undefined
}

type PassingThoughtEditActionResponse = {
  errors: {
    fieldErrors: {
      content?: string
      voidAt?: string
      general?: string
    }
  }
}

type PassingThoughtEditLoaderResponse = {
  content: string
  voidAt: string
}

export const action = async (
  args: ActionFunctionArgs,
): Promise<PassingThoughtEditActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const passingThoughtItem = await getPassingThoughtItemForUser(args, user)

  if (passingThoughtItem === null) {
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

  // Todo add void at validation

  const updated = await UpdatePassingThoughtItem({
    userId: user.id,
    content: content.toString(),
    historyId: passingThoughtItem.history_id,
    modelId: passingThoughtItem.passing_thought_item!.model_id,
  })

  if (!updated) {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update passing thought item. Please try again.',
        },
      },
    }
  }

  return redirect('/dashboard')
}

export const loader = async (
  args: LoaderFunctionArgs,
): Promise<PassingThoughtEditLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const passingThoughtItem = await getPassingThoughtItemForUser(args, user)

  if (passingThoughtItem === null) {
    return redirect('/')
  }

  return {
    content: passingThoughtItem.passing_thought_item?.content || '',
    voidAt:
      passingThoughtItem.passing_thought_item?.void_at.toISOString() || '',
  }
}

// Letting TypeScript make inferences here
const getPassingThoughtItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const passingThoughtItemId = args.params.model_id

  if (!passingThoughtItemId) {
    return null
  }

  return await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true, // Protect against dirty reads. You can only update the current one
      history_id: historyItemId,
      model_id: passingThoughtItemId,
    },
    select: {
      history_id: true,
      passing_thought_item: {
        select: {
          content: true,
          model_id: true,
          void_at: true,
        },
      },
    },
  })
}

export default function InboxEditRoute() {
  const loaderData = useLoaderData<PassingThoughtEditLoaderResponse>()
  const actionData = useActionData<PassingThoughtEditActionResponse>()

  return (
    <div className="mx-4 my-4">
      {actionData?.errors.fieldErrors.general && (
        <div className="text-red-500">
          {actionData.errors.fieldErrors.general}
        </div>
      )}
      <div className="text-5xl mb-4">Edit Passing Thought Item</div>
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
          <div className="mb-4">
            <label>
              <div className="mb-4">Void At (Not Yet Implemented)</div>
              <input
                className="min-w-full bg-white/20 p-4"
                name="voidAt"
                type="text"
                readOnly
                defaultValue={loaderData.voidAt}
              />
            </label>
            <br />
            {actionData?.errors.fieldErrors.voidAt && (
              <div className="text-red-500">
                {actionData.errors.fieldErrors.voidAt}
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
