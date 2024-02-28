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
import { UpdateInboxItem } from '~/repositories/PkmInboxRepository'

export type InboxEditResponses = {
  loaderData: InboxEditLoaderResponse
  actionData: InboxEditActionResponse | undefined
}

type InboxEditActionResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

type InboxEditLoaderResponse = {
  content: string
}

export const action = async (
  args: ActionFunctionArgs,
): Promise<InboxEditActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const inboxItem = await getInboxItemForUser(args, user)

  if (inboxItem === null) {
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

  const updated = await UpdateInboxItem({
    userId: user.id,
    content: content.toString(),
    historyId: inboxItem.history_id,
    modelId: inboxItem.inbox_item!.model_id,
  })

  if (!updated) {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update inbox item. Please try again.',
        },
      },
    }
  }

  return redirect('/dashboard')
}

export const loader = async (
  args: LoaderFunctionArgs,
): Promise<InboxEditLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const inboxItem = await getInboxItemForUser(args, user)

  if (inboxItem === null) {
    return redirect('/')
  }

  return {
    content: inboxItem.inbox_item?.content || '',
  }
}

// Letting TypeScript make inferences here
const getInboxItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const inboxItemId = args.params.model_id

  if (!inboxItemId) {
    return null
  }

  return await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true, // Protect against dirty reads. You can only update the current one
      history_id: historyItemId,
      model_id: inboxItemId,
    },
    select: {
      history_id: true,
      inbox_item: {
        select: {
          content: true,
          model_id: true,
        },
      },
    },
  })
}

export default function InboxEditRoute() {
  const loaderData = useLoaderData<InboxEditLoaderResponse>()
  const actionData = useActionData<InboxEditActionResponse>()

  return (
    <div className="mx-4 my-4">
      {actionData?.errors.fieldErrors.general && (
        <div className="text-red-500">
          {actionData.errors.fieldErrors.general}
        </div>
      )}
      <div className="text-5xl mb-4">Edit Inbox Item</div>
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
