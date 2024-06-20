import { redirect, useLoaderData } from '@remix-run/react'
import HistoryItemDashboard from '~/components/history/HistoryItemDashboard'
import { historyLoader } from '~/controllers/HistoryController'

export const loader = historyLoader

export default function HistoryRoute() {
  const historyItems = useLoaderData<typeof loader>()

  if (
    !historyItems.historyItems.success ||
    !historyItems.historyItems.historyItem
  ) {
    return redirect('/')
  }

  return (
    <>
      <HistoryItemDashboard historyItems={historyItems.historyItems} />
    </>
  )
}
