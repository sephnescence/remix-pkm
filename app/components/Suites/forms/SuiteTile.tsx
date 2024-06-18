import { Link } from '@remix-run/react'
import LightbulbIcon from '~/components/icons/LightbulbIcon'
import InboxStackIcon from '~/components/icons/InboxStackIcon'
import BoltIcon from '~/components/icons/BoltIcon'
import BellAlertIcon from '~/components/icons/BellAlertIcon'
import ArchiveBoxXMarkIcon from '~/components/icons/ArchiveBoxXMarkIcon'
import SuiteItemSummary from './SuiteItemSummary'
import { ItemCountRow } from '~/repositories/PkmSuiteRepository'
import BuildingOfficeIcon from '~/components/icons/BuildingOfficeIcon'

type SuiteTileProps = {
  id: string
  name: string
  description: string
  storeyCount: number
  suiteItemCount?: ItemCountRow | null
}

const SuiteTile = ({
  id,
  name,
  description,
  storeyCount,
  suiteItemCount,
}: SuiteTileProps) => {
  const href = `/suite/${id}/dashboard`
  return (
    <div
      key={id}
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
          href={`${href}?tab=storeys`}
          icon={<BuildingOfficeIcon />}
          iconText={`${storeyCount}`}
        />
        <SuiteItemSummary
          href={`${href}?tab=epiphany`}
          icon={<LightbulbIcon />}
          iconText={suiteItemCount ? `${suiteItemCount.epiphany_count}` : '0'}
        />
        <SuiteItemSummary
          href={`${href}?tab=inbox`}
          icon={<InboxStackIcon />}
          iconText={suiteItemCount ? `${suiteItemCount.inbox_count}` : '0'}
        />
        <SuiteItemSummary
          href={`${href}?tab=passing-thought`}
          icon={<BoltIcon />}
          iconText={
            suiteItemCount ? `${suiteItemCount.passing_thought_count}` : '0'
          }
        />
        <SuiteItemSummary
          href={`${href}?tab=todo`}
          icon={<BellAlertIcon />}
          iconText={suiteItemCount ? `${suiteItemCount.todo_count}` : '0'}
        />
        <SuiteItemSummary
          href={`${href}?tab=void`}
          icon={<ArchiveBoxXMarkIcon />}
          iconText={suiteItemCount ? `${suiteItemCount.void_count}` : '0'}
        />
      </div>
    </div>
  )
}

export default SuiteTile
