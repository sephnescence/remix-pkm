'use client'

import ArchiveBoxXMarkIcon from '~/components/icons/ArchiveBoxXMarkIcon'
import BellAlertIcon from '~/components/icons/BellAlertIcon'
import BoltIcon from '~/components/icons/BoltIcon'
import InboxStackIcon from '~/components/icons/InboxStackIcon'
import LightbulbIcon from '~/components/icons/LightbulbIcon'
import TrashIcon from '~/components/icons/TrashIcon'
import { handleMoveToSubmit } from './ItemForm'

export default function MoveTo({
  interactive,
  submitting,
  setSubmitting,
  eModelType,
  eModelId,
  eHistoryId,
  eSuiteId,
  eStoreyId,
  eSpaceId,
  moveToText = 'Move to',
}: {
  interactive: boolean
  submitting: boolean
  setSubmitting: (submitting: boolean) => void
  eModelType: string
  eModelId: string
  eHistoryId: string
  eSuiteId: string | null
  eStoreyId: string | null
  eSpaceId: string | null
  moveToText: string
}) {
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
              <form id={`move-to-${moveTo}`} onSubmit={() => false}>
                <button
                  className={`bg-violet-600 hover:bg-violet-500 ${submitting ? 'bg-gray-400 hover:bg-gray-400' : ''} px-4 py-2 rounded-lg`}
                  type="button"
                  title={`Move to ${btnTitle}`}
                  onClick={() => {
                    handleMoveToSubmit({
                      formId: `move-to-${moveTo}`,
                      eHistoryId,
                      eModelType,
                      eModelId,
                      nModelType: moveTo,
                      setSubmitting,
                      eSuiteId,
                      eStoreyId,
                      eSpaceId,
                      nSuiteId: null,
                      nStoreyId: null,
                      nSpaceId: null,
                    })
                  }}
                  disabled={!interactive || submitting}
                >
                  {display}
                </button>
              </form>
            </div>
          )
        })}
        <div key={'trash'}>
          <form id={`move-to-trash`} onSubmit={() => false}>
            <button
              className={`bg-red-600 hover:bg-red-500 ${submitting ? 'bg-gray-400 hover:bg-gray-400' : ''} px-4 py-2 rounded-lg`}
              type="button"
              onClick={() => {
                if (
                  confirm('Are you sure you want to move this to the trash?')
                ) {
                  handleMoveToSubmit({
                    formId: `move-to-trash`,
                    eHistoryId,
                    eModelType,
                    eModelId,
                    nModelType: 'trash',
                    setSubmitting,
                    eSuiteId,
                    eStoreyId,
                    eSpaceId,
                    nSuiteId: null,
                    nStoreyId: null,
                    nSpaceId: null,
                  })
                }
              }}
              disabled={!interactive || submitting}
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
