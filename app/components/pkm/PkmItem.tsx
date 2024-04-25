export default function PkmItem(props: { children: React.ReactNode }) {
  return (
    <div className="bg-indigo-950 hover:bg-violet-900 py-2 px-3 rounded-md h-32 overflow-hidden">
      {props.children}
    </div>
  )
}
