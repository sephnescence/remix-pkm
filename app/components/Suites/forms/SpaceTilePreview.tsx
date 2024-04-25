import { ItemCountRow } from '~/repositories/PkmSuiteRepository'
import SpaceItemSummaryPreview from './SpaceItemSummaryPreview'
import LightbulbIcon from '~/components/icons/LightbulbIcon'
import InboxStackIcon from '~/components/icons/InboxStackIcon'
import BoltIcon from '~/components/icons/BoltIcon'
import BellAlertIcon from '~/components/icons/BellAlertIcon'
import ArchiveBoxXMarkIcon from '~/components/icons/ArchiveBoxXMarkIcon'

type SpaceTileProps = {
  suiteId: string
  storeyId: string
  name: string
  description: string
  spaceItemCount: ItemCountRow | null
}

const SpaceTilePreview = ({
  suiteId,
  storeyId,
  name,
  description,
  spaceItemCount,
}: SpaceTileProps) => {
  return (
    <div
      key={`${suiteId}-${storeyId}`}
      className="bg-indigo-900 rounded-xl p-4 m-1 hover:ring-1 hover:ring-indigo-500 min-h-48 w-[250px] sm:w-[500px]"
    >
      <div className="h-28 mb-2">
        <div className="text-lg mb-2 line-clamp-1">{name}</div>
        <div className="text-sm line-clamp-4">{description}</div>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6">
        <SpaceItemSummaryPreview
          icon={<LightbulbIcon />}
          iconText={spaceItemCount ? `${spaceItemCount.epiphany_count}` : '0'}
        />
        <SpaceItemSummaryPreview
          icon={<InboxStackIcon />}
          iconText={spaceItemCount ? `${spaceItemCount.inbox_count}` : '0'}
        />
        <SpaceItemSummaryPreview
          icon={<BoltIcon />}
          iconText={
            spaceItemCount ? `${spaceItemCount.passing_thought_count}` : '0'
          }
        />
        <SpaceItemSummaryPreview
          icon={<BellAlertIcon />}
          iconText={spaceItemCount ? `${spaceItemCount.todo_count}` : '0'}
        />
        <SpaceItemSummaryPreview
          icon={<ArchiveBoxXMarkIcon />}
          iconText={spaceItemCount ? `${spaceItemCount.void_count}` : '0'}
        />
      </div>
    </div>
  )
}

export default SpaceTilePreview
