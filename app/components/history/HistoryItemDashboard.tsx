import { historyModelTypeToModelTypeSlug } from '@/utils/apiUtils'
import { getCurrentHistoryItemsForUser } from '~/repositories/PkmHistoryRepository'
import PkmItemWithLink from '../pkm/PkmItemWithLink'

const HistoryItemDashboard = ({
  historyItems,
}: {
  historyItems: Awaited<ReturnType<typeof getCurrentHistoryItemsForUser>>
}) => {
  if (!historyItems.historyItem) {
    return <></>
  }

  return (
    <>
      <p className="text-4xl mb-2">History</p>
      <div className="grid md:grid-cols-3 gap-2">
        {historyItems.historyItem.map((historyItem) => {
          if (
            historyItem.model_type !== 'PkmEpiphany' &&
            historyItem.model_type !== 'PkmInbox' &&
            historyItem.model_type !== 'PkmPassingThought' &&
            historyItem.model_type !== 'PkmTodo' &&
            historyItem.model_type !== 'PkmTrash' &&
            historyItem.model_type !== 'PkmVoid'
          ) {
            return null
          }

          const item =
            historyItem.epiphany_item ??
            historyItem.inbox_item ??
            historyItem.passing_thought_item ??
            historyItem.todo_item ??
            historyItem.trash_item ??
            historyItem.void_item

          if (!item) {
            return null
          }

          if (historyItem.storey?.id && historyItem.space?.id) {
            const location = `/item/view/eSuiteId/${historyItem.storey.suite.id}/eStoreyId/${historyItem.storey.id}/eSpaceId/${historyItem.space.id}/eModelType/${historyModelTypeToModelTypeSlug[historyItem.model_type]}/eModelId/${historyItem.model_id}/eHistoryId/${historyItem.history_id}`

            return (
              <div key={historyItem.history_id} className="mb-6">
                <div className="flex flex-col mb-2">
                  <div className="line-clamp-1 overflow-x-scroll">
                    Suite: {historyItem.storey.suite.name}
                  </div>
                  <div className="line-clamp-1 overflow-x-scroll">
                    Storey: {historyItem.storey.name}
                  </div>
                  <div className="line-clamp-1 overflow-x-scroll">
                    Space: {historyItem.space.name}
                  </div>
                </div>
                <PkmItemWithLink
                  location={location}
                  name={item.name}
                  summary={item.summary}
                />
              </div>
            )
          }

          if (historyItem.suite?.id && historyItem.storey?.id) {
            const location = `/item/view/eSuiteId/${historyItem.suite.id}/eStoreyId/${historyItem.storey.id}/eModelType/${historyModelTypeToModelTypeSlug[historyItem.model_type]}/eModelId/${historyItem.model_id}/eHistoryId/${historyItem.history_id}`

            return (
              <div key={historyItem.history_id} className="mb-6">
                <div className="flex flex-col mb-2">
                  <div className="line-clamp-1 overflow-x-scroll">&nbsp;</div>
                  <div className="line-clamp-1 overflow-x-scroll">
                    Suite: {historyItem.storey.suite.name}
                  </div>
                  <div className="line-clamp-1 overflow-x-scroll">
                    Storey: {historyItem.storey.name}
                  </div>
                </div>
                <PkmItemWithLink
                  location={location}
                  name={item.name}
                  summary={item.summary}
                />
              </div>
            )
          }

          if (historyItem.suite?.id) {
            const location = `/item/view/eSuiteId/${historyItem.suite.id}/eModelType/${historyModelTypeToModelTypeSlug[historyItem.model_type]}/eModelId/${historyItem.model_id}/eHistoryId/${historyItem.history_id}`

            return (
              <div key={historyItem.history_id} className="mb-6">
                <div className="flex flex-col mb-2">
                  <div className="line-clamp-1 overflow-x-scroll">&nbsp;</div>
                  <div className="line-clamp-1 overflow-x-scroll">&nbsp;</div>
                  <div className="line-clamp-1 overflow-x-scroll">
                    Suite: {historyItem.suite.name}
                  </div>
                </div>
                <PkmItemWithLink
                  location={location}
                  name={item.name}
                  summary={item.summary}
                />
              </div>
            )
          }

          return null
        })}
      </div>
    </>
  )
}

export default HistoryItemDashboard
