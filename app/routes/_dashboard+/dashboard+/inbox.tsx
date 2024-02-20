import Inbox from 'components/Inbox'

export default function InboxRoute() {
  return (
    <>
      <p className="text-5xl">Inbox</p>
      <div className="mt-4 text-xl text-white/60 mb-4">
        Add anything and everything while it&apos;s hot. Categorise it later
      </div>
      <div className="mt-4">
        <Inbox />
        <Inbox />
        <Inbox />
        <Inbox />
      </div>
    </>
  )
}
