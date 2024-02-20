import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import Epiphany from 'components/Epiphany'

export default function EpiphaniesRoute() {
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
          <p className="text-5xl">Epiphanies</p>
          <div className="mt-4 text-xl text-white/60 mb-4">
            When it clicks, it clicks
          </div>
          <div className="mt-4">
            <Epiphany />
            <Epiphany />
            <Epiphany />
            <Epiphany />
          </div>
        </div>
      </SignedIn>
    </>
  )
}
