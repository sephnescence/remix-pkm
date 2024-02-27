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

export type TodoEditResponses = {
  loaderData: TodoEditLoaderResponse
  actionData: TodoEditActionResponse | undefined
}

type TodoEditActionResponse = {
  errors: {
    fieldErrors: {
      content: string
    }
  }
}

type TodoEditLoaderResponse = {
  content: string
}

export const action = async (
  args: ActionFunctionArgs,
): Promise<TodoEditActionResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const todoItem = await getTodoItemForUser(args, user)

  if (todoItem === null) {
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
        history_id: todoItem.history_id,
      },
      data: {
        is_current: false,
      },
    }),
    db.pkmHistory.create({
      data: {
        user_id: user.id,
        is_current: true,
        model_type: 'PkmTodo',
        model_id: todoItem.todo_item?.model_id,
        todo_item: {
          create: {
            content: content.toString(),
            model_id: todoItem.todo_item?.model_id,
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
): Promise<TodoEditLoaderResponse | TypedResponse<never>> => {
  const user = await getUserAuth(args)
  if (!user) {
    return redirect('/')
  }

  const todoItem = await getTodoItemForUser(args, user)

  if (todoItem === null) {
    return redirect('/')
  }

  return {
    content: todoItem.todo_item?.content || '',
  }
}

// Letting TypeScript make inferences here
const getTodoItemForUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs,
  user: User,
) => {
  const historyItemId = args.params.history_id

  if (!historyItemId) {
    return null
  }

  const todoItemId = args.params.model_id

  if (!todoItemId) {
    return null
  }

  return await db.pkmHistory.findFirst({
    where: {
      user_id: user.id,
      is_current: true, // Protect against dirty reads. You can only update the current one
      history_id: historyItemId,
      model_id: todoItemId,
    },
    select: {
      history_id: true,
      todo_item: {
        select: {
          content: true,
          model_id: true,
        },
      },
    },
  })
}

export default function InboxEditRoute() {
  const loaderData = useLoaderData<TodoEditLoaderResponse>()
  const actionData = useActionData<TodoEditActionResponse>()

  return (
    <div className="mx-4 my-4">
      <div className="text-5xl mb-4">Edit Todo Item</div>
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
