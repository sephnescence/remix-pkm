'use client'

import { Dispatch, useCallback } from 'react'
// Interesting that I have to use this fork, despite the readme suggesting I needed it for NextJS as well
// https://www.npmjs.com/package/react-dropzone-esm
import { useDropzone } from 'react-dropzone-esm'

const DropzoneChild = ({
  manipulateImages,
}: {
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
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const { name, size, type } = file
        const id = `${name}-${size}-${type}`
        const reader = new FileReader()

        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => {
          const binaryStr = reader.result
          if (binaryStr) {
            const blob = new Blob([binaryStr], {
              type: 'image/jpeg',
            })
            const url = URL.createObjectURL(blob)

            manipulateImages({
              type: 'add',
              payload: { blob, id, name, size, type, url },
            })
          }
        }
        reader.readAsArrayBuffer(file)
      })
    },
    [manipulateImages],
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // PDF files, etc. can come later. There's huge benefit to allowing completion certificates, etc. to be stored
      // However, I don't want this platform to be used to host pirated content. So when publishing anything, enforce
      //  that it doesn't try and link to a file that is not an image. Images will be baked into the published file as
      //  a base64 string, so there should be no way that the page links off to pirated content. Perhaps I'll also need
      //  to maintain whitelisted domains so that users can't even link outside of the platform
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
    },
  })

  const handleFromClipboard = async () => {
    try {
      const clipboardContents = await navigator.clipboard.read()
      for (const item of clipboardContents) {
        if (!item.types.includes('image/png')) {
          continue
        }
        const blob = await item.getType('image/png')

        const now = new Date()
        const formattedDate = `${Date.now()}_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`

        const name = `${formattedDate}-clipboard-image.png`

        const size = blob.size
        const type = 'image/png'
        const id = `${name}-${size}-${type}`
        const url = URL.createObjectURL(blob)

        manipulateImages({
          type: 'add',
          payload: { blob, id, name, size, type, url },
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="flex gap-2 items-center mb-4">
      <div>
        <button
          className="p-2 bg-violet-700 rounded-md"
          type="button"
          title="Add from Clipboard"
          onClick={(e) => {
            e.preventDefault()
            void handleFromClipboard()
          }}
        >
          From Clipboard
        </button>
      </div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag and drop some files here, or click to select files</p>
        )}
      </div>
    </div>
  )
}

export default DropzoneChild
