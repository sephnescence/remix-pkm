'use client'

import { useEffect, useState } from 'react'
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
  const [interactive, setInteractive] = useState(() => false)
  const [submitting, setSubmitting] = useState(() => false)

  // Prevent form interaction while submitting and while the page is rendering
  useEffect(() => {
    setInteractive(true)
  }, [interactive])

  const handleSubmit = async ({
    id,
    moveTo,
    nSuiteId,
    nStoreyId,
    nSpaceId,
  }: {
    id: string
    moveTo: string
    nSuiteId: string | null
    nStoreyId: string | null
    nSpaceId: string | null
  }) => {
    setSubmitting(true)

    let apiEndpoint = '/api/history/item/move/'
    if (suiteId && !spaceId) {
      apiEndpoint += `eSuiteId/${suiteId}/`
    }
    if (storeyId) {
      apiEndpoint += `eStoreyId/${storeyId}/`
    }
    if (spaceId) {
      apiEndpoint += `eSpaceId/${spaceId}/`
    }

    apiEndpoint += `eModelType/${modelType}/eModelId/${modelItemId}/eHistoryId/${historyItemId}`

    // Not that this component will facilitate changing Suite, Storey, and Space just yet...
    if (nSuiteId && !nSpaceId) {
      apiEndpoint += `nSuiteId/${nSuiteId}/`
    }
    if (nStoreyId) {
      apiEndpoint += `nStoreyId/${nStoreyId}/`
    }
    if (nSpaceId) {
      apiEndpoint += `nSpaceId/${nSpaceId}/`
    }

    apiEndpoint += `/nModelType/${moveTo}`

    const thisForm = document.getElementById(id) as HTMLFormElement
    if (!thisForm) {
      return false
    }

    const formData = new FormData(thisForm)
    formData.append('apiEndpoint', apiEndpoint)

    const res = await fetch(
      new Request(apiEndpoint, {
        method: 'POST',
        body: formData,
      }),
    )

    const resJson = await JSON.parse(await res.text())

    if (!resJson.redirect) {
      setSubmitting(false)
    }

    if (resJson.success === false && resJson.redirect) {
      window.location.replace(resJson.redirect)
    }

    if (resJson.success === true && resJson.redirect) {
      window.location.href = resJson.redirect
    }
  }

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
                    setTimeout(() => {
                      void handleSubmit({
                        id: `move-to-${moveTo}`,
                        moveTo,
                        nSuiteId: null,
                        nStoreyId: null,
                        nSpaceId: null,
                      })
                    }, 10)
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
                  setTimeout(() => {
                    void handleSubmit({
                      id: 'move-to-trash',
                      moveTo: 'trash',
                      nSuiteId: null,
                      nStoreyId: null,
                      nSpaceId: null,
                    })
                  }, 10)
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
