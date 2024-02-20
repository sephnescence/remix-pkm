import Void from 'components/Void'

export default function VoidRoute() {
  return (
    <>
      <p className="text-5xl">Void</p>
      <div className="mt-4 text-xl text-white/60 mb-4">
        Passing Thoughts that didn&apos;t make the cut
      </div>
      <div className="mt-4">
        <Void />
        <Void />
        <Void />
        <Void />
      </div>
    </>
  )
}
