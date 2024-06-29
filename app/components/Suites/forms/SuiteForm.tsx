import { Form, Link, useNavigation } from '@remix-run/react'
import { useEffect, useReducer, useState } from 'react'
import { SuiteUpdateConfigActionResponse } from '~/controllers/SuiteController'
import ItemContentCodeMirror from '~/components/pkm/forms/ItemContentCodeMirror'
import { FIXED_NEW_MULTI_CONTENT_ID } from '~/repositories/PkmContentRepository'

type SuiteFormProps = {
  pageTitle: string
  cancelUrl?: string
  defaultName?: string
  defaultDescription?: string
  defaultContent?: string
  actionData?: SuiteUpdateConfigActionResponse
  defaultMultiContents?: MultiContentItem[]
}

type MultiContentItem = {
  id: string // Note: Will be ignored when adding a new MultiContent
  sortOrder: number
  content: string
  status: string
  originalStatus: string // Tell the difference between a "new" and "active" Content. Different buttons become available
}

const SuiteForm = ({
  pageTitle,
  cancelUrl,
  defaultName,
  defaultDescription,
  defaultContent,
  actionData,
  defaultMultiContents,
}: SuiteFormProps) => {
  const [name, setName] = useState(() => defaultName || '')
  const [description, setDescription] = useState(() => defaultDescription || '')
  const [content, setContent] = useState(
    () => defaultContent || '<div data-children></div>\n\n',
  )

  const [interactive, setInteractive] = useState(() => false)
  const navigation = useNavigation()
  const submitting = navigation.state === 'submitting'

  const [multiContents, setMultiContents] = useReducer(
    (
      multiContents: MultiContentItem[],
      action: {
        type: string
        payload: MultiContentItem
      },
    ) => {
      if (action.type === 'add') {
        const id = crypto.randomUUID()
        return [
          ...multiContents,
          { ...action.payload, status: 'new', originalStatus: 'new', id },
        ]
      }

      if (action.type === 'update') {
        return multiContents.map((multiContent: MultiContentItem) => {
          if (multiContent.id === action.payload.id) {
            // We potentially want to update the Contents of _other_ contents when this is updated, so "updated" is actually an important status
            const newStatus =
              action.payload.originalStatus === 'active' ? 'updated' : 'new'
            return {
              ...multiContent,
              status: newStatus,
              content: action.payload.content,
            }
          }

          return multiContent
        })
      }

      if (action.type === 'discard') {
        return multiContents.map((multiContent: MultiContentItem) => {
          if (multiContent.id === action.payload.id) {
            return { ...multiContent, status: 'discarded' }
          }

          return multiContent
        })
      }

      if (action.type === 'removeNow') {
        // There's no going back from this
        return multiContents.filter(
          (multiContent) => multiContent.id !== action.payload.id,
        )
      }

      if (action.type === 'restore') {
        return multiContents.map((multiContent: MultiContentItem) => {
          if (multiContent.id === action.payload.id) {
            return { ...multiContent, status: multiContent.originalStatus }
          }

          return multiContent
        })
      }

      return multiContents
    },
    defaultMultiContents
      ? defaultMultiContents
      : [
          {
            id: FIXED_NEW_MULTI_CONTENT_ID,
            sortOrder: 1,
            content: '<div data-children></div>\n\n',
            status: 'new',
            originalStatus: 'new',
          },
        ],
  )

  useEffect(() => {
    setInteractive(true)
  }, [interactive])

  return (
    <>
      {actionData?.errors.fieldErrors.general && (
        <div className="text-red-500">
          {actionData.errors.fieldErrors.general}
        </div>
      )}
      <div className="mb-4">
        <div className="text-4xl">{pageTitle}</div>
      </div>
      <Form method="POST" className="grid">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2">
          <div>
            <div className="mb-4">
              <label>
                <div className="mb-4">Name</div>
                <input
                  type="text"
                  className="min-w-full bg-slate-700 p-4"
                  name="name"
                  value={name}
                  disabled={!interactive || submitting}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <br />
              {actionData?.errors.fieldErrors.name && (
                <div className="text-red-500">
                  {actionData.errors.fieldErrors?.name}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label>
                <div className="mb-4">Description</div>
                <textarea
                  className="min-w-full min-h-48 bg-slate-700 p-4"
                  name="description"
                  value={description}
                  disabled={!interactive || submitting}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <br />
              {actionData?.errors.fieldErrors.description && (
                <div className="text-red-500">
                  {actionData.errors.fieldErrors?.description}
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:block mb-4">
            <div className="mb-4">Preview</div>
            <div className="bg-indigo-900 rounded-xl p-4 m-1 hover:ring-1 hover:ring-indigo-500 min-h-32">
              {(name || description) && (
                <div className="h-28 mb-2">
                  <div className="text-lg mb-2 line-clamp-1">{name}</div>
                  <div className="text-sm line-clamp-4">{description}</div>
                </div>
              )}
              {!(name || description) && (
                <div className="h-28 mb-2">
                  <div className="text-lg mb-2 line-clamp-1">Name</div>
                  <div className="text-sm line-clamp-4">Description</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2">
          <div className="mb-4">
            <ItemContentCodeMirror content={content} setContent={setContent} />
            <br />
            {actionData?.errors.fieldErrors.content && (
              <div className="text-red-500">
                {actionData.errors.fieldErrors?.content}
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="mb-4">Content Preview</div>
            {content && (
              <div
                id="innsight-content-preview"
                dangerouslySetInnerHTML={{ __html: content }}
              ></div>
            )}
            {!content && (
              <div className="bg-blue-950 p-4">Enter your content here</div>
            )}
          </div>
        </div>
        {multiContents &&
          multiContents.map((multiContent: MultiContentItem) => {
            return (
              <div
                key={multiContent.id}
                className="grid grid-cols-1 md:grid-cols-2 md:gap-2"
              >
                <div className="">
                  <ItemContentCodeMirror
                    setContent={(newContent: string) => {
                      setMultiContents({
                        type: 'update',
                        payload: {
                          id: multiContent.id,
                          sortOrder: multiContent.sortOrder,
                          content: newContent,
                          status: '<unused>',
                          originalStatus: '<unused>',
                        },
                      })
                    }}
                    content={multiContent.content}
                    parentDivId={multiContent.id}
                    sortOrder={multiContent.sortOrder}
                    status={multiContent.status}
                  />
                  <div className="flex gap-2 mb-2">
                    {(multiContent.status === 'active' ||
                      multiContent.status === 'new') && (
                      <div>
                        <button
                          className="bg-orange-700 hover:bg-orange-600 px-1"
                          type="button"
                          title="Remove"
                          onClick={() => {
                            setMultiContents({
                              type: 'discard',
                              payload: {
                                id: multiContent.id,
                                sortOrder: multiContents.length,
                                content: multiContent.content,
                                status: '<unused>',
                                originalStatus: '<unused>',
                              },
                            })
                          }}
                        >
                          Delete after saving
                        </button>
                      </div>
                    )}
                    {multiContent.status === 'discarded' && (
                      <div>
                        <button
                          className="bg-blue-600 hover:bg-blue-500 px-1"
                          type="button"
                          title="Restore"
                          onClick={() => {
                            setMultiContents({
                              type: 'restore',
                              payload: {
                                id: multiContent.id,
                                sortOrder: multiContents.length,
                                content: multiContent.content,
                                status: '<unused>',
                                originalStatus: '<unused>',
                              },
                            })
                          }}
                        >
                          Do not delete
                        </button>
                      </div>
                    )}
                    {multiContent.status === 'discarded' && (
                      <div>
                        <button
                          className="bg-red-600 hover:bg-red-500 px-1"
                          type="button"
                          title="Restore"
                          onClick={() => {
                            setMultiContents({
                              type: 'removeNow',
                              payload: {
                                id: multiContent.id,
                                sortOrder: multiContents.length,
                                content: multiContent.content,
                                status: '<unused>',
                                originalStatus: '<unused>',
                              },
                            })
                          }}
                        >
                          Delete now
                        </button>
                      </div>
                    )}
                  </div>
                  {actionData?.errors.fieldErrors.content && (
                    <div className="text-red-500">
                      {actionData.errors.fieldErrors?.content}
                    </div>
                  )}
                </div>
                <div className="hidden md:block">
                  {multiContent.content && (
                    <div
                      id="innsight-content-preview"
                      dangerouslySetInnerHTML={{ __html: multiContent.content }}
                    ></div>
                  )}
                  {!multiContent.content && (
                    <div className="bg-blue-950 p-4">
                      Enter your content here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2 mb-2">
          <div className="grid grid-cols-1 bg-blue-500">
            <button
              type="button"
              onClick={() => {
                setMultiContents({
                  type: 'add',
                  payload: {
                    id: crypto.randomUUID(),
                    sortOrder: multiContents.length + 1,
                    content: `<div class="bg-blue-950 p-4">\n  Enter your content here\n</div>`,
                    status: '<unused>',
                    originalStatus: '<unused>',
                  },
                })
              }}
            >
              Add New Multi Content
            </button>
          </div>
        </div>
        <div className="flex">
          <button
            className={`px-4 py-2 rounded-lg bg-blue-600 ${(!interactive || submitting ? 'bg-gray-400' : '') || 'hover:bg-blue-500'}`}
            type="submit"
            disabled={!interactive || submitting}
          >
            Submit
          </button>
          <Link
            to={cancelUrl || '/suites'}
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg ml-4"
            type="button"
            prefetch="intent"
          >
            Cancel
          </Link>
        </div>
      </Form>
    </>
  )
}

export default SuiteForm
