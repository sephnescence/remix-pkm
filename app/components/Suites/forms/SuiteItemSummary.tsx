import { Link } from '@remix-run/react'

const SuiteItemSummary = ({
  href,
  icon,
  iconText,
}: {
  href: string
  icon: React.ReactNode
  iconText: string
}) => {
  return (
    <div className="bg-indigo-950 h-8 m-1 py-1 px-3 rounded-lg hover:ring-1 hover:ring-indigo-500 hover:bg-violet-900">
      <Link to={href} prefetch="intent">
        <button
          type="button"
          className="flex gap-1 w-full rounded-lg focus:outline-offset-1 focus:outline-indigo-600"
        >
          {icon}
          <div className="flex-grow w-full">{iconText}</div>
        </button>
      </Link>
    </div>
  )
}

export default SuiteItemSummary
