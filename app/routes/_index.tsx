import { useAuth } from '@clerk/remix'
import { Link } from '@remix-run/react'

export default function Index() {
  const { sessionId } = useAuth()

  return (
    <>
      <div className="w-full h-full bg-black/50 flex justify-center items-center">
        <div className="">
          <h1 className="text-5xl mb-4">Personal Knowledge Management</h1>
          <p className="text-2xl text-white/60 mb-4">
            Your journey starts here
          </p>
          <div>
            <Link to={sessionId ? 'dashboard' : 'sign-up'}>
              <button
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
                type="button"
              >
                Get started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
