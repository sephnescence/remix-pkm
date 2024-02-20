import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import PassingThought from 'components/PassingThought'

export default function PassingThoughtsRoute() {
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
          <p className="text-5xl">Passing Thoughts</p>
          <div className="mt-4 text-xl text-white/60 mb-4">
            Inbox items that have been inherently flagged as a thought with
            recency bias. It might not be important to action, and will move to
            the Void after a configured age
          </div>
          <div className="mt-4">
            <PassingThought />
            <PassingThought />
            <PassingThought />
            <PassingThought />
          </div>
        </div>
      </SignedIn>
    </>
  )
}
