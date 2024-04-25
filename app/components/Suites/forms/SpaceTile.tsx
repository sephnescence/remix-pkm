import { Link } from '@remix-run/react'
import { ItemCountRow } from '~/repositories/PkmSuiteRepository'
import SuiteItemSummary from './SuiteItemSummary'
import LightbulbIcon from '~/components/icons/LightbulbIcon'
import InboxStackIcon from '~/components/icons/InboxStackIcon'
import BoltIcon from '~/components/icons/BoltIcon'
import BellAlertIcon from '~/components/icons/BellAlertIcon'
import ArchiveBoxXMarkIcon from '~/components/icons/ArchiveBoxXMarkIcon'

type SpaceTileProps = {
  suiteId: string
  storeyId: string
  spaceId: string
  name: string
  description: string
  spaceItemCount: ItemCountRow | null
}

const SpaceTile = ({
  suiteId,
  storeyId,
  spaceId,
  name,
  description,
  spaceItemCount,
}: SpaceTileProps) => {
  const href = `/suite/${suiteId}/storey/${storeyId}/space/${spaceId}/dashboard`
  return (
    <div
      key={`${suiteId}-${storeyId}`}
      className="bg-indigo-900 rounded-xl p-4 m-1 hover:ring-1 hover:ring-indigo-500 min-h-48"
    >
      <Link to={href} prefetch="intent">
        <div className="h-28 mb-2">
          <div className="text-lg mb-2 line-clamp-1">{name}</div>
          <div className="text-sm line-clamp-4">{description}</div>
        </div>
      </Link>
      <div className="grid grid-cols-3 lg:grid-cols-6">
        <SuiteItemSummary
          href={`${href}?tab=epiphany`}
          icon={<LightbulbIcon />}
          iconText={spaceItemCount ? `${spaceItemCount.epiphany_count}` : '0'}
        />
        <SuiteItemSummary
          href={`${href}?tab=inbox`}
          icon={<InboxStackIcon />}
          iconText={spaceItemCount ? `${spaceItemCount.inbox_count}` : '0'}
        />
        <SuiteItemSummary
          href={`${href}?tab=passing-thought`}
          icon={<BoltIcon />}
          iconText={
            spaceItemCount ? `${spaceItemCount.passing_thought_count}` : '0'
          }
        />
        <SuiteItemSummary
          href={`${href}?tab=todo`}
          icon={<BellAlertIcon />}
          iconText={spaceItemCount ? `${spaceItemCount.todo_count}` : '0'}
        />
        <SuiteItemSummary
          href={`${href}?tab=void`}
          icon={<ArchiveBoxXMarkIcon />}
          iconText={spaceItemCount ? `${spaceItemCount.void_count}` : '0'}
        />
      </div>
    </div>
  )
}

export default SpaceTile
