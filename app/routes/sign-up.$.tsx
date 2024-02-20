import { SignUp } from '@clerk/remix'

export default function SignUpPage() {
  return (
    <div className="w-screen h-screen bg-black flex justify-center items-center text-white">
      <div className=""></div>
      <div className="max-w-[600px] w-full mx-auto">
        <div className="items-center">
          <div>
            <SignUp />
          </div>
        </div>
      </div>
    </div>
  )
}
