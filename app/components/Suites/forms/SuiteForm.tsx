import { Form, Link, useNavigation } from '@remix-run/react'
import { useEffect, useState } from 'react'
import SuiteTile from './SuiteTile'
import { SuiteUpdateConfigActionResponse } from '~/controllers/SuiteController'
import ItemContentCodeMirror from '~/components/pkm/forms/ItemContentCodeMirror'

type SuiteFormProps = {
  pageTitle: string
  cancelUrl?: string
  defaultName?: string
  defaultDescription?: string
  defaultContent?: string
  actionData?: SuiteUpdateConfigActionResponse
}

const SuiteForm = ({
  pageTitle,
  cancelUrl,
  defaultName,
  defaultDescription,
  defaultContent,
  actionData,
}: SuiteFormProps) => {
  const [name, setName] = useState(() => defaultName || '')
  const [description, setDescription] = useState(() => defaultDescription || '')
  const [content, setContent] = useState(
    () =>
      defaultContent ||
      '<div data-children></div>\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n',
  )

  const [interactive, setInteractive] = useState(() => false)
  const navigation = useNavigation()
  const submitting = navigation.state === 'submitting'

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
            {(name || description) && (
              <SuiteTile
                id={'preview'}
                name={name}
                description={description}
                storeyCount={0}
              />
            )}
            {!(name || description) && (
              <SuiteTile
                id={'preview'}
                name={'Name'}
                description={'Description'}
                storeyCount={0}
              />
            )}
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
