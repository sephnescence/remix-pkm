import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import Inbox from 'components/Inbox'

export default function InboxRoute() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="mx-4 my-4 absolute top-0 right-0">
          <UserButton afterSignOutUrl="/" />
        </div>
        <div className="mx-4 my-4">
          <p className="text-5xl">Inbox</p>
          <div className="mt-4 text-xl text-white/60 mb-4">
            Add anything and everything while it&apos;s hot. Categories it later
          </div>
          <div className="mt-4">
            <Inbox />
            <Inbox />
            <Inbox />
            <Inbox />
          </div>
        </div>
      </SignedIn>
    </>
  )
}
