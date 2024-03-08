import ArchiveBoxXMarkIcon from '../icons/ArchiveBoxXMarkIcon'
import PkmItem from './PkmItem'

export default function Void(props: { voidItem: { content: string } }) {
  return (
    <PkmItem>
      <div className="flex-none">
        <ArchiveBoxXMarkIcon />
      </div>
      <div className="flex-initial ml-2">{props.voidItem.content}</div>
    </PkmItem>
  )
}
