import { useActionData } from '@remix-run/react'
import { historyActionMoveToTrash } from '~/controllers/HistoryController'

export const action = historyActionMoveToTrash

export default function HistoryTrashRoute() {
  const actionData = useActionData<typeof action>()

  return (
    <div>
      {actionData?.errors.fieldErrors.general && (
        <div className="text-red-500">
          {actionData.errors.fieldErrors.general}
        </div>
      )}
    </div>
  )
}
