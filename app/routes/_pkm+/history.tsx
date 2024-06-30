import { redirect, useLoaderData } from '@remix-run/react'
import HistoryItemDashboard from '~/components/history/HistoryItemDashboard'
import { historyLoader } from '~/controllers/HistoryController'
import { CurrentHistoryItems } from '~/repositories/PkmHistoryRepository'

export const loader = historyLoader

export default function HistoryRoute() {
  const { historyItems } = useLoaderData<{
    historyItems: CurrentHistoryItems
  }>()

  if (!historyItems.historyItem) {
    return redirect('/')
  }

  return (
    <>
      {/* I've had to ban this typescript error. There must be an issue with Remix's loader changing the type */}
      {/* Code completion works perfectly fine. As does the code. I'm not sure why my IDE works it out but TS can't*/}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <HistoryItemDashboard historyItems={historyItems} />
    </>
  )
}
