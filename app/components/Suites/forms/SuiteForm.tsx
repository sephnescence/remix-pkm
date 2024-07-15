import { Link } from '@remix-run/react'
import { useEffect, useState } from 'react'
import ItemContentCodeMirror from '~/components/pkm/forms/ItemContentCodeMirror'
import useImageUploadReducer, {
  ImageReducerItem,
} from '~/hooks/useImageUploadReducer'
import Dropzone from '~/components/pkm/forms/Dropzone'
import useMultiContentsReducer, {
  MultiContentReducerItem,
} from '~/hooks/useMultiContentsReducer'
import ItemImageCarousel from '~/components/pkm/forms/ItemImageCarousel'
import CopyToClipBoardButton from '~/components/pkm/forms/CopyToClipBoardButton'
import LinkIcon from '~/components/icons/LinkIcon'

type SuiteFormProps = {
  pageTitle: string
  apiEndpoint: string
  cancelUrl?: string
  defaultName?: string
  defaultDescription?: string
  defaultMultiContents?: string
  existingMultiContents?: MultiContentReducerItem[]
  images?: {
    name: string
    image_id: string
    s3_url: string
  }[]
}

const SuiteForm = ({
  pageTitle,
  apiEndpoint,
  cancelUrl,
  defaultName,
  defaultDescription,
  defaultMultiContents,
  existingMultiContents,
  images: modelImages,
}: SuiteFormProps) => {
  const [actionData, setActionData] = useState({
    errors: {
      fieldErrors: { general: '', content: '', name: '', description: '' },
    },
  })

  const [name, setName] = useState(() => defaultName || '')
  const [description, setDescription] = useState(() => defaultDescription || '')

  const [interactive, setInteractive] = useState(() => false)
  const [submitting, setSubmitting] = useState(() => false)

  const imageUploadReducerHook = useImageUploadReducer()
  const images = imageUploadReducerHook[0] as ImageReducerItem[]
  const manipulateImages = imageUploadReducerHook[1] as React.Dispatch<{
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

  useEffect(() => {
    setInteractive(true)
  }, [interactive])

  // Was hoping I could get all this for free now, but I need to construct a manual request in order
  //  to submit _all_ images in the request
  const handleSubmit = async () => {
    setSubmitting(true)

    const thisForm = document.getElementById('suite-form') as HTMLFormElement
    if (!thisForm) {
      return false
    }
    const formData = new FormData(thisForm)
    formData.append('historyId', 'BTTODO')
    formData.append('content', 'Now handled by Multi Contents')
    formData.append('name', name)
    formData.append('description', description)
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
            description: resJson?.errors.fieldErrors.description || '',
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
    <>
      {actionData?.errors.fieldErrors.general && (
        <div className="text-red-500">
          {actionData.errors.fieldErrors.general}
        </div>
      )}
      <div className="mb-4">
        <div className="text-4xl">{pageTitle}</div>
      </div>
      <form id="suite-form" className="grid" onSubmit={() => false}>
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
          <div className="md:block">
            <div className="mb-4">Content</div>
          </div>
          <div className="hidden md:block">
            <div className="mb-4">Content Preview</div>
          </div>
        </div>
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
                            {`Don't keep`}
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
                          copy={`<div contents="/contentId/${multiContent.id}"></div>`}
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
          <Link
            to={cancelUrl || '/suites'}
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg ml-4"
            type="button"
            prefetch="intent"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  )
}

export default SuiteForm
