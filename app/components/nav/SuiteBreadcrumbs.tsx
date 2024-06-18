import { Link } from '@remix-run/react'

type BreadcrumbsProps = {
  suiteId: string
  suiteName: string
}

const SuiteBreadcrumbs = ({ suiteId, suiteName }: BreadcrumbsProps) => {
  return (
    <div className="flex gap-2">
      <Link to={`/suites`}>Suites</Link>
      <Link to={`/suite/${suiteId}/dashboard?tab=content`}>
        &gt; {suiteName}
      </Link>
    </div>
  )
}

export default SuiteBreadcrumbs
