import { Dispatch } from 'react'
import CopyToClipBoardButton from './CopyToClipBoardButton'
import LinkIcon from '~/components/icons/LinkIcon'
import TrashIcon from '~/components/icons/TrashIcon'

const DropzoneUploads = ({
  images,
  manipulateImages,
}: {
  images: { id: string; url: string }[]
  manipulateImages: Dispatch<{
    type: string
    payload: {
      blob: Blob | null
      id: string
      name: string
      size: number
      type: string
      url: string
    }
  }>
}) => {
  if (!images || images.length === 0) {
    return <div>No images uploaded yet</div>
  }

  // Next gives an irrelevant warning about using the <img> tag
  //  The image hasn't been to a CDN because it's on the client device
  return (
    <>
      <div className="flex gap-2 overflow-x-scroll">
        {images.map((image) => {
          return (
            <div
              key={image.id}
              className="flex gap-2 flex-shrink-0 border-2 border-violet-700 w-[242px] h-[204px] hover:bg-violet-500 hover:bg-opacity-80"
            >
              <div className="flex flex-shrink-0 w-[200px] h-[200px] justify-center items-center">
                <img
                  src={image.url}
                  alt={image.url}
                  className="max-w-[180px] max-h-[180px]"
                />
              </div>
              <div className="w-[40px]">
                <div className="relative">
                  <CopyToClipBoardButton
                    className="absolute top-0 right-0 bg-violet-700 hover:bg-violet-500 w-[40px] h-[100px] flex justify-center items-center"
                    display={<LinkIcon />}
                    copy={`<img\n\tclass=""\n\tsrc="${image.url}"\n\talt="${image.url}"\n/>`}
                  />
                  <button
                    type="button"
                    title="Remove image"
                    className="absolute top-[100px] right-0 bg-red-900 hover:bg-red-500 w-[40px] h-[100px] flex justify-center items-center"
                    onClick={() => {
                      manipulateImages({
                        type: 'remove',
                        payload: {
                          blob: null,
                          id: image.id,
                          name: '',
                          size: 0,
                          type: '',
                          url: '',
                        },
                      })
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default DropzoneUploads
