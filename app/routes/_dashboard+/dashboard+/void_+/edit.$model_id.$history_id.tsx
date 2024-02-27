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

export type VoidEditResponses = {
  loaderData: VoidEditLoaderResponse
  actionData: VoidEditActionResponse | undefined
}

type VoidEditActionResponse = {
  errors: {
    fieldErrors: {
      content: string
    }
  }
}

type VoidEditLoaderResponse = {
  content: string
}

export const action = async (
  args: ActionFunctionArgs,
): Promise<VoidEditActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const voidItem = await getVoidItemForUser(args, user)

  if (voidItem === null) {
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

  await db.$transaction([
    db.pkmHistory.update({
      where: {
        history_id: voidItem.history_id,
      },
      data: {
        is_current: false,
      },
    }),
    db.pkmHistory.create({
      data: {
        user_id: user.id,
        is_current: true,
        model_type: 'PkmVoid',
        model_id: voidItem.void_item?.model_id,
        void_item: {
          create: {
            content: content.toString(),
            model_id: voidItem.void_item?.model_id,
            user_id: user.id,
          },
        },
      },
    }),
  ])

  return redirect('/dashboard')
}

export const loader = async (
  args: LoaderFunctionArgs,
): Promise<VoidEditLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const voidItem = await getVoidItemForUser(args, user)

  if (voidItem === null) {
    return redirect('/')
  }

  return {
    content: voidItem.void_item?.content || '',
  }
}

// Letting TypeScript make inferences here
const getVoidItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const voidItemId = args.params.model_id

  if (!voidItemId) {
    return null
  }

  return await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true, // Protect against dirty reads. You can only update the current one
      history_id: historyItemId,
      model_id: voidItemId,
    },
    select: {
      history_id: true,
      void_item: {
        select: {
          content: true,
          model_id: true,
        },
      },
    },
  })
}

export default function InboxEditRoute() {
  const loaderData = useLoaderData<VoidEditLoaderResponse>()
  const actionData = useActionData<VoidEditActionResponse>()

  return (
    <div className="mx-4 my-4">
      <div className="text-5xl mb-4">Edit Void Item</div>
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
