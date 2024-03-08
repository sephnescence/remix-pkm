import LightbulbIcon from '../icons/LightbulbIcon'
import PkmItem from './PkmItem'

export default function Epiphany(props: { epiphanyItem: { content: string } }) {
  return (
    <PkmItem>
      <div className="flex-none">
        <LightbulbIcon />
      </div>
      <div className="flex-initial ml-2">{props.epiphanyItem.content}</div>
    </PkmItem>
  )
}
