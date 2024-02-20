import Todo from 'components/Todo'

export default function TodoRoute() {
  return (
    <>
      <p className="text-5xl">Todo</p>
      <div className="mt-4 text-xl text-white/60 mb-4">
        Things you MUST do at a certain point in time
      </div>
      <div className="mt-4">
        <Todo />
        <Todo />
        <Todo />
        <Todo />
      </div>
    </>
  )
}
