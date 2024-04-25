import { useAuth } from '@clerk/remix'
import { Link } from '@remix-run/react'

export default function Index() {
  const { sessionId } = useAuth()

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl mb-2">Rethought</h1>
        <p className="text-2xl text-blue-400 mb-4">
          Enjoy your stay at the resort-themed personal knowledge management
          system!
        </p>
        <div>
          <Link
            to={sessionId ? 'dashboard' : 'sign-up'}
            prefetch={sessionId ? 'intent' : 'none'}
          >
            <button
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
              type="button"
            >
              Check In
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
