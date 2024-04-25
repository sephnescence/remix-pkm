import { PkmTrash } from '@prisma/client'
import LinkIcon from '../icons/LinkIcon'
import PkmItem from './PkmItem'
import CopyToClipBoardButton from './forms/CopyToClipBoardButton'

export default function Trash({
  trashItem: { name, summary },
  copyToClipBoardLink,
}: {
  trashItem: Partial<PkmTrash>
  copyToClipBoardLink?: string
}) {
  return (
    <>
      {copyToClipBoardLink && (
        <div className="relative">
          <CopyToClipBoardButton
            className="absolute top-0 right-0 bg-violet-700 hover:bg-violet-500 w-10 h-[128px] flex justify-center items-center rounded-md"
            display={<LinkIcon />}
            copy={copyToClipBoardLink}
          />
        </div>
      )}
      <PkmItem>
        <div className="">
          <div className="text-lg line-clamp-1">{name}</div>
          <div className="text-sm line-clamp-4">{summary}</div>
        </div>
      </PkmItem>
    </>
  )
}
