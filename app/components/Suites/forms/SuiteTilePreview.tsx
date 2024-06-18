import { ItemCountRow } from '~/repositories/PkmSuiteRepository'
import SuiteItemSummaryPreview from './SuiteItemSummaryPreview'
import BuildingOfficeIcon from '~/components/icons/BuildingOfficeIcon'
import LightbulbIcon from '~/components/icons/LightbulbIcon'
import InboxStackIcon from '~/components/icons/InboxStackIcon'
import BoltIcon from '~/components/icons/BoltIcon'
import BellAlertIcon from '~/components/icons/BellAlertIcon'
import ArchiveBoxXMarkIcon from '~/components/icons/ArchiveBoxXMarkIcon'

type SuiteTileProps = {
  suiteId: string
  name: string
  description: string
  storeyCount: number
  suiteItemCount?: ItemCountRow | null
}

const SuiteTilePreview = ({
  suiteId,
  name,
  description,
  storeyCount,
  suiteItemCount,
}: SuiteTileProps) => {
  return (
    <div
      key={suiteId}
      className="bg-indigo-900 rounded-xl p-4 m-1 hover:ring-1 hover:ring-indigo-500 min-h-48 w-[250px] sm:w-[500px]"
    >
      <div className="h-28 mb-2">
        <div className="text-lg mb-2 line-clamp-1">{name}</div>
        <div className="text-sm line-clamp-4">{description}</div>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6">
        <SuiteItemSummaryPreview
          icon={<BuildingOfficeIcon />}
          iconText={`${storeyCount}`}
        />
        <SuiteItemSummaryPreview
          icon={<LightbulbIcon />}
          iconText={suiteItemCount ? `${suiteItemCount.epiphany_count}` : '0'}
        />
        <SuiteItemSummaryPreview
          icon={<InboxStackIcon />}
          iconText={suiteItemCount ? `${suiteItemCount.inbox_count}` : '0'}
        />
        <SuiteItemSummaryPreview
          icon={<BoltIcon />}
          iconText={
            suiteItemCount ? `${suiteItemCount.passing_thought_count}` : '0'
          }
        />
        <SuiteItemSummaryPreview
          icon={<BellAlertIcon />}
          iconText={suiteItemCount ? `${suiteItemCount.todo_count}` : '0'}
        />
        <SuiteItemSummaryPreview
          icon={<ArchiveBoxXMarkIcon />}
          iconText={suiteItemCount ? `${suiteItemCount.void_count}` : '0'}
        />
      </div>
    </div>
  )
}

export default SuiteTilePreview
