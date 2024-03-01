import { Form } from '@remix-run/react'
import { EpiphanyLoaderResponse } from '~/controllers/EpiphanyController'
import { InboxLoaderResponse } from '~/controllers/InboxController'

export default function MoveTo({
  item,
}: {
  item: EpiphanyLoaderResponse | InboxLoaderResponse
}) {
  return (
    <div className="flex">
      <div className="px-4 py-2 rounded-lg mr-4">Move to</div>
      {[
        { display: 'Epiphany', moveTo: 'epiphany' },
        { display: 'Inbox', moveTo: 'inbox' },
        { display: 'Passing Thought', moveTo: 'passing-thought' },
        { display: 'Todo', moveTo: 'todo' },
        { display: 'Void', moveTo: 'void' },
      ].map(({ display, moveTo }) => {
        return (
          <div key={moveTo}>
            <Form
              action={`/dashboard/history/move/${item.modelId}/${item.historyId}/${moveTo}`}
              method="POST"
              className="flex"
            >
              <button
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg mr-4"
                type="submit"
              >
                {display}
              </button>
            </Form>
          </div>
        )
      })}
    </div>
  )
}
