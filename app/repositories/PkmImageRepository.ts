import { db } from '@/utils/db'

export const getImagesForItem = async ({
  modelId,
  userId,
}: {
  modelId: string
  userId: string
}) => {
  return await db.pkmImage.findMany({
    where: {
      model_id: modelId,
      user_id: userId,
    },
    select: {
      image_id: true,
      name: true,
      s3_url: true,
    },
  })
}

// You might need to periodically ensure this matches schema.prisma
export const cloneModelImages = async ({
  modelId,
  newModelId,
  userId,
}: {
  modelId: string
  newModelId: string
  userId: string
}) => {
  const images = await db.pkmImage.findMany({
    where: {
      model_id: modelId,
      user_id: userId,
    },
    select: {
      model_id: true,
      name: true,
      size: true,
      type: true,
      s3_url: true,
      user_id: true,
    },
  })

  images.map(async (image) => {
    await db.pkmImage.create({
      data: {
        model_id: newModelId,
        name: image.name,
        size: image.size,
        type: image.type,
        s3_url: image.s3_url,
        user_id: image.user_id,
      },
    })
  })
}
