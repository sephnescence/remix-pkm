import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import Void from 'components/Void'

export default function VoidRoute() {
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
          <p className="text-5xl">Void</p>
          <div className="mt-4 text-xl text-white/60 mb-4">
            Passing Thoughts that didn&apos;t make the cut
          </div>
          <div className="mt-4">
            <Void />
            <Void />
            <Void />
            <Void />
          </div>
        </div>
      </SignedIn>
    </>
  )
}
