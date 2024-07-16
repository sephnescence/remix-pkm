'use client'

import { useEffect, useState } from 'react'
import PkmItem from '../PkmItem'
import ItemContentCodeMirror from './ItemContentCodeMirror'
import ItemImageCarousel from './ItemImageCarousel'
import Dropzone from './Dropzone'
import useImageUploadReducer, {
  ImageReducerItem,
} from '~/hooks/useImageUploadReducer'
import useMultiContentsReducer, {
  MultiContentReducerItem,
} from '~/hooks/useMultiContentsReducer'
import CopyToClipBoardButton from './CopyToClipBoardButton'
import LinkIcon from '~/components/icons/LinkIcon'

type ItemFormProps = {
  pageTitle: string
  apiEndpoint: string
  cancelUrl?: string
  defaultName?: string
  defaultSummary?: string
  defaultMultiContents?: string
  existingMultiContents?: MultiContentReducerItem[]
  images?: {
    name: string
    image_id: string
    s3_url: string
  }[]
}

export const handleMoveToSubmit = async ({
  formId,
  eHistoryId,
  eModelType,
  eModelId,
  nModelType,
  setSubmitting,
  eSuiteId,
  eStoreyId,
  eSpaceId,
  nSuiteId,
  nStoreyId,
  nSpaceId,
}: {
  formId: string
  eHistoryId: string
  eModelType: string
  eModelId: string
  nModelType: string
  setSubmitting: (submitting: boolean) => void
  eSuiteId: string | null
  eStoreyId: string | null
  eSpaceId: string | null
  nSuiteId: string | null
  nStoreyId: string | null
  nSpaceId: string | null
}) => {
  setSubmitting(true)

  let apiEndpoint = '/api/history/item/move/'
  if (eSuiteId && !eSpaceId) {
    apiEndpoint += `eSuiteId/${eSuiteId}/`
  }
  if (eStoreyId) {
    apiEndpoint += `eStoreyId/${eStoreyId}/`
  }
  if (eSpaceId) {
    apiEndpoint += `eSpaceId/${eSpaceId}/`
  }

  apiEndpoint += `eModelType/${eModelType}/eModelId/${eModelId}/eHistoryId/${eHistoryId}/`

  if (nSuiteId && !nSpaceId) {
    apiEndpoint += `nSuiteId/${nSuiteId}/`
  }
  if (nStoreyId) {
    apiEndpoint += `nStoreyId/${nStoreyId}/`
  }
  if (nSpaceId) {
    apiEndpoint += `nSpaceId/${nSpaceId}/`
  }

  apiEndpoint += `nModelType/${nModelType}`

  const thisForm = document.getElementById(formId) as HTMLFormElement
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

  const resText = await res.text()
  const resJson = await JSON.parse(resText)

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

export default function ItemForm({
  pageTitle,
  apiEndpoint,
  cancelUrl,
  defaultName,
  defaultSummary,
  defaultMultiContents,
  existingMultiContents,
  images: modelImages,
}: ItemFormProps) {
  const [actionData, setActionData] = useState({
    errors: {
      fieldErrors: { general: '', content: '', name: '', summary: '' },
    },
  })

  const [name, setName] = useState(() => defaultName || '')
  const [summary, setSummary] = useState(() => defaultSummary || '')

  const [interactive, setInteractive] = useState(() => false)
  const [submitting, setSubmitting] = useState(() => false)

  const imageUploaderDispatcher = useImageUploadReducer()
  const images = imageUploaderDispatcher[0] as ImageReducerItem[]
  const manipulateImages = imageUploaderDispatcher[1] as React.Dispatch<{
    type: string
    payload: ImageReducerItem
  }>

  const useMultiContentsReducerHook = useMultiContentsReducer({
    defaultMultiContents,
    existingMultiContents,
  })
  const multiContents =
    useMultiContentsReducerHook[0] as MultiContentReducerItem[]
  const setMultiContents = useMultiContentsReducerHook[1] as React.Dispatch<{
    type: string
    payload: MultiContentReducerItem
  }>

  // Prevent form interaction while submitting and while the page is rendering
  useEffect(() => {
    setInteractive(true)
  }, [interactive])

  // Was hoping I could get all this for free now, but I need to construct a manual request in order
  //  to submit _all_ images in the request
  const handleSubmit = async () => {
    setSubmitting(true)

    const thisForm = document.getElementById('item-form') as HTMLFormElement
    if (!thisForm) {
      return false
    }
    const formData = new FormData(thisForm)
    formData.append('content', 'Now handled by Multi Contents')
    formData.append('name', name)
    formData.append('summary', summary)
    multiContents.map((content: MultiContentReducerItem) => {
      formData.append(
        `multi_contents__${content.id}__${content.sortOrder}__${content.status}`,
        content.content,
      )
    })
    images.map((image: ImageReducerItem, index) => {
      if (
        !image.blob ||
        !image.name ||
        !image.size ||
        !image.type ||
        !image.url
      ) {
        return true
      }
      formData.append('images_' + index, image.blob)
      formData.append('images_' + index + '_url', image.url)
      formData.append('images_' + index + '_name', image.name)
      formData.append('images_' + index + '_size', image.size.toString())
      formData.append('images_' + index + '_type', image.type)
    })
    const res = await fetch(
      new Request(apiEndpoint, {
        method: 'POST',
        body: formData,
      }),
    )

    const resJson = await JSON.parse(await res.text())

    if (resJson.success === false) {
      setActionData({
        errors: {
          fieldErrors: {
            general: resJson?.errors.fieldErrors.general || '',
            content: resJson?.errors.fieldErrors.content || '',
            name: resJson?.errors.fieldErrors.name || '',
            summary: resJson?.errors.fieldErrors.summary || '',
          },
        },
      })
    }

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
    <div className="">
      {actionData?.errors.fieldErrors.general && (
        <div className="text-red-500">
          {actionData.errors.fieldErrors.general}
        </div>
      )}
      <div className="text-4xl mb-2">{pageTitle}</div>
      <form id="item-form" className="grid" onSubmit={() => false}>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2">
          <div>
            <input type="hidden" name="apiEndpoint" value={apiEndpoint} />
            <div className="mb-2">
              <label>
                <div className="mb-1">Name</div>
                <input
                  type="text"
                  className="min-w-full bg-slate-700 p-4"
                  name="name"
                  defaultValue={name}
                  disabled={!interactive || submitting}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Item name"
                />
              </label>
              <br />
              {actionData?.errors.fieldErrors.name && (
                <div className="text-red-500">
                  {actionData.errors.fieldErrors?.name}
                </div>
              )}
            </div>
            <div className="mb-2">
              <label>
                <div className="mb-1">Summary</div>
                <textarea
                  className="min-w-full min-h-48 bg-slate-700 p-4"
                  name="summary"
                  defaultValue={summary}
                  disabled={!interactive || submitting}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={`Item description\n- You have four lines to describe your item\n- Note that line breaks are ignored`}
                />
              </label>
              <br />
              {actionData?.errors.fieldErrors.summary && (
                <div className="text-red-500">
                  {actionData.errors.fieldErrors?.summary}
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:block mb-2">
            <div className="mb-1">Preview</div>
            {(name || summary) && (
              <PkmItem>
                <div className="text-lg line-clamp-1">{name}</div>
                <div className="text-sm line-clamp-4">{summary}</div>
              </PkmItem>
            )}
            {!(name || summary) && (
              <PkmItem>
                <div className="text-lg line-clamp-1">Item name</div>
                <div className="text-sm line-clamp-4">
                  Item description - You have four lines to describe your item -
                  Note that line breaks are ignored
                </div>
              </PkmItem>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2">
          <div className="md:block">
            <div className="mb-4">Content</div>
          </div>
          <div className="hidden md:block">
            <div className="mb-4">Content Preview</div>
          </div>
        </div>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2">
          <div className="mb-2">
            <ItemContentCodeMirror setContent={setContent} content={content} />
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
        </div> */}
        <div className="grid grid-cols-1 gap-1">
          {multiContents &&
            multiContents.map((multiContent) => {
              return (
                <div
                  key={multiContent.id}
                  className="grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-2"
                >
                  <div className="hover:bg-yellow-600 p-1">
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
                    />
                    <div className="flex gap-2 mt-1">
                      <div>{multiContent.sortOrder}</div>
                      <div>
                        <button
                          className="bg-blue-700 hover:bg-blue-600 px-1"
                          type="button"
                          title="Add Above"
                          onClick={() => {
                            setMultiContents({
                              type: 'addAbove',
                              payload: {
                                id: crypto.randomUUID(),
                                sortOrder: multiContent.sortOrder,
                                content:
                                  '<div class="bg-blue-950 p-4">\n  Enter your content here\n</div>',
                                status: '<unused>',
                                originalStatus: '<unused>',
                              },
                            })
                          }}
                        >
                          Add Above
                        </button>
                      </div>
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
                            {`Don't Keep`}
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
                            Keep
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
                      <div>
                        <button
                          className="bg-blue-700 hover:bg-blue-600 px-1"
                          type="button"
                          title="Add Below"
                          onClick={() => {
                            setMultiContents({
                              type: 'addBelow',
                              payload: {
                                id: crypto.randomUUID(),
                                sortOrder: multiContent.sortOrder,
                                content:
                                  '<div class="bg-blue-950 p-4">\n  Enter your content here\n</div>',
                                status: '<unused>',
                                originalStatus: '<unused>',
                              },
                            })
                          }}
                        >
                          Add Below
                        </button>
                      </div>
                      {multiContent.originalStatus === 'active' && (
                        <CopyToClipBoardButton
                          className="p-1 bg-violet-700 hover:bg-violet-600"
                          display={<LinkIcon className="w-4 h-4" />}
                          copy={`<span contents="/contentId/${multiContent.id}"></span>`}
                        />
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
                        dangerouslySetInnerHTML={{
                          __html: multiContent.content,
                        }}
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
        </div>
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
        <div className="grid grid-cols-1">
          {modelImages && <ItemImageCarousel images={modelImages} />}
        </div>
        <div>
          <Dropzone images={images} manipulateImages={manipulateImages} />
        </div>
        <div className="flex">
          <button
            className={`px-4 py-2 rounded-lg bg-blue-600 ${(!interactive || submitting ? 'bg-gray-400' : '') || 'hover:bg-blue-500'}`}
            type="button"
            onClick={() => {
              void handleSubmit()
            }}
            disabled={!interactive || submitting}
          >
            Submit
          </button>
          <button
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg ml-4"
            type="button"
            onClick={() => (window.location.href = cancelUrl || '/reception')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
