import BoltIcon from '../icons/BoltIcon'
import PkmItem from './PkmItem'

export default function PassingThought(props: {
  passingThoughtItem: { content: string }
}) {
  return (
    <PkmItem>
      <div className="flex-none">
        <BoltIcon />
      </div>
      <div className="flex-initial ml-2">
        {props.passingThoughtItem.content}
      </div>
    </PkmItem>
  )
}
