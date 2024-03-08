export default function PkmItem(props: { children: React.ReactNode }) {
  return (
    <div className="flex bg-zinc-800 hover:bg-violet-800 p-4 mb-2 rounded-2xl items-center">
      {props.children}
    </div>
  )
}
