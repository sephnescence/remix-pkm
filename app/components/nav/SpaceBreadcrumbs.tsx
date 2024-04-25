import { Link } from '@remix-run/react'

type BreadcrumbsProps = {
  suiteId: string
  suiteName: string
  storeyId: string
  storeyName: string
  spaceId: string
  spaceName: string
}

const SpaceBreadcrumbs = ({
  suiteId,
  suiteName,
  storeyId,
  storeyName,
  spaceId,
  spaceName,
}: BreadcrumbsProps) => {
  return (
    <div className="flex gap-2 line-clamp-1 overflow-x-scroll">
      <Link className="" to={`/suites`}>
        Suites
      </Link>
      <Link
        className="hidden md:block"
        to={`/suite/${suiteId}/dashboard?tab=content`}
      >
        &gt;&nbsp;{suiteName}
      </Link>
      <Link
        className="md:hidden"
        to={`/suite/${suiteId}/dashboard?tab=content`}
      >
        &gt;&nbsp;...
      </Link>
      <Link
        className=""
        to={`/suite/${suiteId}/storey/${storeyId}/dashboard?tab=content`}
      >
        &gt;&nbsp;{storeyName}
      </Link>
      <Link
        className=""
        to={`/suite/${suiteId}/storey/${storeyId}/space/${spaceId}/dashboard?tab=content`}
      >
        &gt;&nbsp;{spaceName}
      </Link>
    </div>
  )
}

export default SpaceBreadcrumbs
