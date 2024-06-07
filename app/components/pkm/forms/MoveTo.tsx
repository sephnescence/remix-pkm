'use client'

import { useState } from 'react'
import ArchiveBoxXMarkIcon from '~/components/icons/ArchiveBoxXMarkIcon'
import BellAlertIcon from '~/components/icons/BellAlertIcon'
import BoltIcon from '~/components/icons/BoltIcon'
import InboxStackIcon from '~/components/icons/InboxStackIcon'
import LightbulbIcon from '~/components/icons/LightbulbIcon'
import TrashIcon from '~/components/icons/TrashIcon'

export default function MoveTo({
  suiteId,
  storeyId,
  spaceId,
  modelType,
  modelItemId,
  historyItemId,
  moveToText = 'Move to',
}: {
  modelType: string
  modelItemId: string
  historyItemId: string
  moveToText?: string
  suiteId?: string
  storeyId?: string
  spaceId?: string
}) {
  const [submitting, setSubmitting] = useState(() => false)

  let eHistoryItemUrlPart = '/api/history/move/'
  if (suiteId && !spaceId) {
    eHistoryItemUrlPart += `eSuiteId/${suiteId}/`
  }
  if (storeyId) {
    eHistoryItemUrlPart += `eStoreyId/${storeyId}/`
  }
  if (spaceId) {
    eHistoryItemUrlPart += `eSpaceId/${spaceId}/`
  }
  eHistoryItemUrlPart += `eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

  return (
    <>
      <div className="mb-2">{moveToText}</div>
      <div className="flex gap-2 mb-2">
        {[
          {
            display: <LightbulbIcon />,
            moveTo: 'epiphany',
            btnTitle: 'Epiphany',
          },
          { display: <InboxStackIcon />, moveTo: 'inbox', btnTitle: 'Inbox' },
          {
            display: <BoltIcon />,
            moveTo: 'passing-thought',
            btnTitle: 'Passing Thought',
          },
          { display: <BellAlertIcon />, moveTo: 'todo', btnTitle: 'Todo' },
          {
            display: <ArchiveBoxXMarkIcon />,
            moveTo: 'void',
            btnTitle: 'Void',
          },
        ].map(({ display, moveTo, btnTitle }) => {
          return (
            <div key={moveTo}>
              <form
                action={`${eHistoryItemUrlPart}/nModelType/${moveTo}`}
                method="POST"
              >
                <button
                  className={`bg-violet-600 hover:bg-violet-500 ${submitting ? 'bg-gray-400 hover:bg-gray-400' : ''} px-4 py-2 rounded-lg`}
                  type="submit"
                  title={`Move to ${btnTitle}`}
                  onClick={() => {
                    setTimeout(() => {
                      setSubmitting(true)
                    }, 10)
                    return true
                  }}
                  disabled={submitting}
                >
                  {display}
                </button>
              </form>
            </div>
          )
        })}
        <div key={'trash'}>
          <form
            action={`${eHistoryItemUrlPart}/nModelType/trash`}
            method="POST"
          >
            <button
              className={`bg-red-600 hover:bg-red-500 ${submitting ? 'bg-gray-400 hover:bg-gray-400' : ''} px-4 py-2 rounded-lg`}
              type="submit"
              onClick={() => {
                if (
                  confirm('Are you sure you want to move this to the trash?')
                ) {
                  setTimeout(() => {
                    setSubmitting(true)
                  }, 10)
                  return true
                }
                return false
              }}
              disabled={submitting}
              title="Move to Trash"
            >
              <TrashIcon />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
