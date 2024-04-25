import { Link } from '@remix-run/react'

type BreadcrumbsProps = {
  suiteId: string
  suiteName: string
  storeyId: string
  storeyName: string
}

const StoreyBreadcrumbs = ({
  suiteId,
  suiteName,
  storeyId,
  storeyName,
}: BreadcrumbsProps) => {
  return (
    <div className="flex gap-2">
      <Link to={`/suites`}>Suites</Link>
      <Link to={`/suite/${suiteId}/dashboard?tab=content`}>
        &gt; {suiteName}
      </Link>
      <Link to={`/suite/${suiteId}/storey/${storeyId}/dashboard?tab=content`}>
        &gt; {storeyName}
      </Link>
    </div>
  )
}

export default StoreyBreadcrumbs
