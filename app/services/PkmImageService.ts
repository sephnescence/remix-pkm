import { db } from '@/utils/db'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

// We'll lazy load this later
let s3Client: S3Client | undefined = undefined

export type UploadImagesForModelResponse = {
  success: boolean
  error: string | null
  imageUploads: PkmImageUpload[]
}

type PkmImageUpload = {
  s3_url: string
  localStorageUrl: string
}

// The localStorageUrl stuff is important with multiContents. I'll have to keep track of
//    content = content.replaceAll(localStorageUrl, s3_url)
// Upload once, but replace many times. Might even have to pass a localStorageUrl, s3_url
//    map to determineSyncContentsTransactionsByFormData
export const uploadImagesForModel = async ({
  formData,
  modelId,
  userId,
}: {
  formData: FormData
  modelId: string
  userId: string
}): Promise<UploadImagesForModelResponse> => {
  const keys = [...formData.keys()]

  const imageUploads: PkmImageUpload[] = []

  for (const key of keys) {
    console.log('key', key)
    const value = formData.get(key)

    if (value instanceof File) {
      const name = formData.get(`${key}_name`)?.toString()
      const size = parseInt(formData.get(`${key}_size`)?.toString() ?? '0')
      const type = formData.get(`${key}_type`)?.toString()
      const localStorageUrl = formData.get(`${key}_url`)?.toString()

      console.log('localStorageUrl', localStorageUrl)

      if (name && size && type) {
        const s3_name = randomUUID().toString() + '-' + name

        const arrayBuffer = await value.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const results = await getS3Connection().send(
          new PutObjectCommand({
            Bucket: 'rethought-item-images',
            Key: `${userId}/${modelId}/${s3_name}`,
            Body: buffer,
            ACL: 'public-read',
          }),
        )

        const s3_url = `https://rethought-item-images.s3-ap-southeast-2.amazonaws.com/${userId}/${modelId}/${s3_name}`

        if (results.$metadata.httpStatusCode !== 200) {
          console.error('Image upload failed', {
            s3_url,
          })

          return {
            success: false,
            error: 'Image upload failed. Please try again later',
            imageUploads: [],
          }
        }

        await db.pkmImage.create({
          data: {
            s3_url,
            name,
            size,
            type,
            user_id: userId,
            model_id: modelId,
          },
        })

        if (localStorageUrl) {
          imageUploads.push({
            s3_url,
            localStorageUrl,
          })
        }
      }
    }
  }

  return {
    success: true,
    error: null,
    imageUploads,
  }
}

const getS3Connection = () => {
  if (s3Client !== undefined) {
    return s3Client
  }

  s3Client = new S3Client({
    region: 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  })

  return s3Client
}
