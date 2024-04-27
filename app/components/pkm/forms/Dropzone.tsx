'use client'

import { Dispatch } from 'react'
import DropzoneChild from './DropzoneChild'
import DropzoneUploads from './DropzoneUploads'

const Dropzone = ({
  images,
  manipulateImages,
}: {
  images: {
    blob: Blob | null
    id: string
    name: string
    size: number
    type: string
    url: string
  }[]
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
  return (
    <div className="mb-4">
      <DropzoneChild manipulateImages={manipulateImages} />
      <DropzoneUploads images={images} manipulateImages={manipulateImages} />
    </div>
  )
}

export default Dropzone
