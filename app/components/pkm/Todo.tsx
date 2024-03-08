import BellAlertIcon from '../icons/BellAlertIcon'
import PkmItem from './PkmItem'

export default function Todo(props: { todoItem: { content: string } }) {
  return (
    <PkmItem>
      <div className="flex-none">
        <BellAlertIcon />
      </div>
      <div className="flex-initial ml-2">{props.todoItem.content}</div>
    </PkmItem>
  )
}
