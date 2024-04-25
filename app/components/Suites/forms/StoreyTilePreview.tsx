import { ItemCountRow } from '~/repositories/PkmSuiteRepository'
import StoreyItemSummaryPreview from './StoreyItemSummaryPreview'
import KeyIcon from '~/components/icons/KeyIcon'
import LightbulbIcon from '~/components/icons/LightbulbIcon'
import InboxStackIcon from '~/components/icons/InboxStackIcon'
import BoltIcon from '~/components/icons/BoltIcon'
import BellAlertIcon from '~/components/icons/BellAlertIcon'
import ArchiveBoxXMarkIcon from '~/components/icons/ArchiveBoxXMarkIcon'

type StoreyTilePreviewProps = {
  suiteId: string
  storeyId: string
  name: string
  description: string
  spaceCount: number
  storeyItemCount: ItemCountRow | null
}

const StoreyTilePreview = ({
  suiteId,
  storeyId,
  name,
  description,
  spaceCount,
  storeyItemCount,
}: StoreyTilePreviewProps) => {
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
        <StoreyItemSummaryPreview
          icon={<KeyIcon />}
          iconText={`${spaceCount}`}
        />
        <StoreyItemSummaryPreview
          icon={<LightbulbIcon />}
          iconText={storeyItemCount ? `${storeyItemCount.epiphany_count}` : '0'}
        />
        <StoreyItemSummaryPreview
          icon={<InboxStackIcon />}
          iconText={storeyItemCount ? `${storeyItemCount.inbox_count}` : '0'}
        />
        <StoreyItemSummaryPreview
          icon={<BoltIcon />}
          iconText={
            storeyItemCount ? `${storeyItemCount.passing_thought_count}` : '0'
          }
        />
        <StoreyItemSummaryPreview
          icon={<BellAlertIcon />}
          iconText={storeyItemCount ? `${storeyItemCount.todo_count}` : '0'}
        />
        <StoreyItemSummaryPreview
          icon={<ArchiveBoxXMarkIcon />}
          iconText={storeyItemCount ? `${storeyItemCount.void_count}` : '0'}
        />
      </div>
    </div>
  )
}

export default StoreyTilePreview
