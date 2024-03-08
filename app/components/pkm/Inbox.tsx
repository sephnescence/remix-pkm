import InboxStackIcon from '../icons/InboxStackIcon'
import PkmItem from './PkmItem'

export default function Inbox(props: { inboxItem: { content: string } }) {
  return (
    <PkmItem>
      <div className="flex-none">
        <InboxStackIcon />
      </div>
      <div className="flex-initial ml-2">{props.inboxItem.content}</div>
    </PkmItem>
  )
}
