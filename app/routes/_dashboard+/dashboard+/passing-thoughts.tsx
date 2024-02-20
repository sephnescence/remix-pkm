import PassingThought from 'components/PassingThought'

export default function PassingThoughtsRoute() {
  return (
    <>
      <p className="text-5xl">Passing Thoughts</p>
      <div className="mt-4 text-xl text-white/60 mb-4">
        Inbox items that have been inherently flagged as a thought with recency
        bias. It might not be important to action, and will move to the Void
        after a configured age
      </div>
      <div className="mt-4">
        <PassingThought />
        <PassingThought />
        <PassingThought />
        <PassingThought />
      </div>
    </>
  )
}
