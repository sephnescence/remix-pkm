import { useReducer } from 'react'

export type ImageReducerItem = {
  blob: Blob | null
  id: string
  name: string
  size: number
  type: string
  url: string
}

function useImageUploadReducer() {
  const [images, manipulateImages] = useReducer(
    (
      images: ImageReducerItem[],
      action: {
        type: string
        payload: ImageReducerItem
      },
    ) => {
      switch (action.type) {
        case 'add':
          return [...images, action.payload]
        case 'remove':
          return images.filter((image) => image.id !== action.payload.id)
        default:
          return images
      }
    },
    [],
  )

  return [images, manipulateImages]
}

export default useImageUploadReducer
