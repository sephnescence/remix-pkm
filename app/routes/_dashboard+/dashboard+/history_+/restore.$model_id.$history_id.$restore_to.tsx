import { useActionData } from '@remix-run/react'
import { historyActionRestore } from '~/controllers/HistoryController'

export const action = historyActionRestore

export default function HistoryMoveRoute() {
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
