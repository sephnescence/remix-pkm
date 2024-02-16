import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'

export default function Blake() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="w-screen h-screen bg-black flex justify-center items-center text-white">
          <div className="max-w-[600px] w-full mx-auto">
            <h1 className="text-6xl mb-4">The best journal app, period.</h1>
            <p className="text-2xl text-white/60 mb-4">You&apos;re all set!</p>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </SignedIn>
    </>
  )
}
