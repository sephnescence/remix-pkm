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
import { UpdateEpiphanyItem } from '~/repositories/PkmEpiphanyRepository'

export type EpiphanyEditResponses = {
  loaderData: EpiphanyEditLoaderResponse
  actionData: EpiphanyEditActionResponse | undefined
}

type EpiphanyEditActionResponse = {
  errors: {
    fieldErrors: {
      content?: string
      general?: string
    }
  }
}

type EpiphanyEditLoaderResponse = {
  content: string
}

export const action = async (
  args: ActionFunctionArgs,
): Promise<EpiphanyEditActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const epiphanyItem = await getEpiphanyItemForUser(args, user)

  if (epiphanyItem === null) {
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

  const updated = await UpdateEpiphanyItem({
    userId: user.id,
    content: content.toString(),
    historyId: epiphanyItem.history_id,
    modelId: epiphanyItem.epiphany_item!.model_id,
  })

  if (!updated) {
    return {
      errors: {
        fieldErrors: {
          general: 'Failed to update epiphany item. Please try again.',
        },
      },
    }
  }

  return redirect('/dashboard')
}

export const loader = async (
  args: LoaderFunctionArgs,
): Promise<EpiphanyEditLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const epiphanyItem = await getEpiphanyItemForUser(args, user)

  if (epiphanyItem === null) {
    return redirect('/')
  }

  return {
    content: epiphanyItem.epiphany_item?.content || '',
  }
}

// Letting TypeScript make inferences here
const getEpiphanyItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const epiphanyItemId = args.params.model_id

  if (!epiphanyItemId) {
    return null
  }

  return await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true, // Protect against dirty reads. You can only update the current one
      history_id: historyItemId,
      model_id: epiphanyItemId,
    },
    select: {
      history_id: true,
      epiphany_item: {
        select: {
          content: true,
          model_id: true,
        },
      },
    },
  })
}

export default function InboxEditRoute() {
  const loaderData = useLoaderData<EpiphanyEditLoaderResponse>()
  const actionData = useActionData<EpiphanyEditActionResponse>()

  return (
    <div className="mx-4 my-4">
      {actionData?.errors.fieldErrors.general && (
        <div className="text-red-500">
          {actionData.errors.fieldErrors.general}
        </div>
      )}
      <div className="text-5xl mb-4">Edit Epiphany Item</div>
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
