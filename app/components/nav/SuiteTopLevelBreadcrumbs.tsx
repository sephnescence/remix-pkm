import { Link } from '@remix-run/react'

const SuiteTopLevelBreadcrumbs = () => {
  return (
    <div className="flex gap-2">
      <Link to={`/suites`}>Suites</Link>
    </div>
  )
}

export default SuiteTopLevelBreadcrumbs
