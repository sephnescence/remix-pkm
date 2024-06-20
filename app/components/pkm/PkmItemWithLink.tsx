import { Link } from '@remix-run/react'

export default function PkmItemWithLink({
  location,
  name,
  summary,
}: {
  location: string
  name: string
  summary: string
}) {
  return (
    <div className="bg-indigo-950 hover:bg-violet-900 rounded-md overflow-hidden">
      <Link
        className="flex flex-col gap-1 rounded-lg focus:outline-offset-2 focus:outline-indigo-950 px-3 py-2 h-[130px]"
        to={location}
        prefix="intent"
      >
        <div className="w-full text-lg line-clamp-1">{name}</div>
        <div className="w-full text-sm line-clamp-4">{summary}</div>
      </Link>
    </div>
  )
}
