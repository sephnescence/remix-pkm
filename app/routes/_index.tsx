import { Link } from '@remix-run/react'

export default function Index() {
  return (
    <div className="w-screen h-screen bg-black flex justify-center items-center text-white">
      <div className="max-w-[600px] w-full mx-auto">
        <h1 className="text-6xl mb-4">The best journal app, period.</h1>
        <p className="text-2xl text-white/60 mb-4">
          All you have to do is be honest
        </p>
        <div>
          <Link to="/sign-up">
            <button className="bg-blue-600 px-4 py-2 rounded-lg" type="button">
              Get started
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
