import { SignIn } from '@clerk/remix'

export default function SignInPage() {
  return (
    <div className="bg-black/50 w-full h-full flex justify-center items-center">
      <div>
        <SignIn />
      </div>
    </div>
  )
}
