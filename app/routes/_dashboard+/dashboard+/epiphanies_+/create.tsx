import { NewPkmItemForm } from '@/components/NewPkmItemForm'
import { getUserAuth } from '@/utils/auth'
import { db } from '@/utils/db'
import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { useActionData, useLoaderData } from '@remix-run/react'

export const action = async (args: ActionFunctionArgs) => {
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

  await db.pkmHistory.create({
    data: {
      user_id: user.id,
      model_type: 'PkmEpiphany',
      epiphany_item: {
        create: {
          content: content.toString(),
          user_id: user.id,
        },
      },
    },
  })

  return redirect('/dashboard')
}

export const loader = async () => {
  return {
    content: 'Edit this',
  }
}

export default function EpiphanyCreate() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const fieldErrors = actionData?.errors?.fieldErrors ?? null

  return (
    <div className="mx-4 my-4">
      <div className="text-5xl mb-4">New Epiphany</div>
      <NewPkmItemForm data={data} fieldErrors={fieldErrors} />
    </div>
  )
}
