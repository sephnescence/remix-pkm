import { SignUp } from '@clerk/remix'

export default function SignUpPage() {
  return (
    <div className="bg-black/50 w-full h-full flex justify-center items-center">
      <div>
        <SignUp />
      </div>
    </div>
  )
}
