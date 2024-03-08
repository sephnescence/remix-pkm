import Epiphany from '~/components/pkm/Epiphany'

export default function EpiphaniesRoute() {
  return (
    <>
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
    </>
  )
}
