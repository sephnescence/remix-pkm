'use client'

import LinkIcon from '~/components/icons/LinkIcon'
import CopyToClipBoardButton from './CopyToClipBoardButton'

type ItemImageCarouselProps = {
  images: {
    name: string
    image_id: string
    s3_url: string
  }[]
}

const ItemImageCarousel = ({ images }: ItemImageCarouselProps) => {
  return (
    <div className="mb-4">
      <label>
        <div className="mb-4">Images</div>
        <div className="flex gap-2 overflow-x-scroll">
          {images.map((image) => {
            return (
              <div
                key={image.image_id}
                className="flex gap-2 flex-shrink-0 border-[0.5px] border-violet-700 w-[242px] h-[204px] hover:bg-violet-500 hover:bg-opacity-80"
              >
                <div className="flex flex-shrink-0 w-[200px] h-[200px] justify-center items-center">
                  <img
                    src={image.s3_url}
                    alt={image.name}
                    className="max-w-[180px] max-h-[180px]"
                  />
                </div>
                <div className="w-[40px]">
                  <div className="relative">
                    <CopyToClipBoardButton
                      className="absolute top-0 right-0 bg-violet-700 hover:bg-violet-500 w-[40px] h-[200px] flex justify-center items-center"
                      display={<LinkIcon />}
                      copy={`<img\n\tclass=""\n\tsrc="${image.s3_url}"\n\talt="${image.name}"\n/>`}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </label>
    </div>
  )
}

export default ItemImageCarousel
