import { Link } from '@remix-run/react'
import KeyIcon from '~/components/icons/KeyIcon'
import LightbulbIcon from '~/components/icons/LightbulbIcon'
import InboxStackIcon from '~/components/icons/InboxStackIcon'
import BoltIcon from '~/components/icons/BoltIcon'
import BellAlertIcon from '~/components/icons/BellAlertIcon'
import ArchiveBoxXMarkIcon from '~/components/icons/ArchiveBoxXMarkIcon'
import SuiteItemSummary from './SuiteItemSummary'
import { ItemCountRow } from '~/repositories/PkmSuiteRepository'

type StoreyTileProps = {
  suiteId: string
  storeyId: string
  name: string
  description: string
  spaceCount: number
  storeyItemCount: ItemCountRow | null
}

const StoreyTile = ({
  suiteId,
  storeyId,
  name,
  description,
  spaceCount,
  storeyItemCount,
}: StoreyTileProps) => {
  const href = `/suite/${suiteId}/storey/${storeyId}/dashboard`
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
          href={`${href}?tab=spaces`}
          icon={<KeyIcon />}
          iconText={`${spaceCount}`}
        />
        <SuiteItemSummary
          href={`${href}?tab=epiphany`}
          icon={<LightbulbIcon />}
          iconText={storeyItemCount ? `${storeyItemCount.epiphany_count}` : '0'}
        />
        <SuiteItemSummary
          href={`${href}?tab=inbox`}
          icon={<InboxStackIcon />}
          iconText={storeyItemCount ? `${storeyItemCount.inbox_count}` : '0'}
        />
        <SuiteItemSummary
          href={`${href}?tab=passing-thought`}
          icon={<BoltIcon />}
          iconText={
            storeyItemCount ? `${storeyItemCount.passing_thought_count}` : '0'
          }
        />
        <SuiteItemSummary
          href={`${href}?tab=todo`}
          icon={<BellAlertIcon />}
          iconText={storeyItemCount ? `${storeyItemCount.todo_count}` : '0'}
        />
        <SuiteItemSummary
          href={`${href}?tab=void`}
          icon={<ArchiveBoxXMarkIcon />}
          iconText={storeyItemCount ? `${storeyItemCount.void_count}` : '0'}
        />
      </div>
    </div>
  )
}

export default StoreyTile
