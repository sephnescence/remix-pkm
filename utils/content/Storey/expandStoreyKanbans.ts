import { feModelTypeMap } from '@/utils/apiUtils'
import { User } from '@prisma/client'
import { getStoreyDashboardForUser } from '~/repositories/PkmStoreyRepository'

/*
    TypeScript gymnastics. I have to manually iterate through the item types
    
    I had only recently gotten confident enough with TypeScript to condense the 72 Item files into 4, but I must admit
      I'm disappointed that I haven't been able to solve it in this file
*/

type Storey = {
  id: string
  name: string
  description: string
  content: string
  suite_id: string
  spaces: {
    id: string
    name: string
    description: string
    content: string
    storey_id: string
  }[]
}

const formatModelTypeHeader = (modelType: string, storey: Storey) => {
  if (
    modelType !== 'epiphany' &&
    modelType !== 'inbox' &&
    modelType !== 'passing-thought' &&
    modelType !== 'todo' &&
    modelType !== 'trash' &&
    modelType !== 'void'
  ) {
    return ''
  }

  return `
    <div>
        <div class="pb-4 flex gap-2">
            <div>
                <a class="p-2 bg-indigo-950 hover:bg-violet-900 rounded-md" href="/item/create/nSuiteId/${storey.suite_id}/nStoreyId/${storey.id}/nModelType/${modelType}">Add</a>
            </div>
            <div class="line-clamp-1">${feModelTypeMap[modelType]}</div>
        </div>
        <div class="sm:h-[600px] overflow-y-scroll *:pb-4 *:border-b-2">
  `
}

const formatColumnContent = ({
  modelType,
  storey,
  modelId,
  historyId,
  name,
  summary,
}: {
  modelType: string
  storey: Storey
  modelId: string
  historyId: string
  name: string
  summary: string
}) => {
  return `
    <div class="mb-2">
        <a href="/item/edit/eSuiteId/${storey.suite_id}/eStoreyId/${storey.id}/eModelType/${modelType}/eModelId/${modelId}/eHistoryId/${historyId}">
        <div class="text-lg line-clamp-1">${name}</div>
        <div class="text-sm line-clamp-4">${summary}</div>
        </a>
    </div>
  `
}

const expandStoreyKanbans = async (
  returnContent: string,
  storey: Storey,
  user: User,
): Promise<string> => {
  const spaceKanbans = [
    ...returnContent.matchAll(/<div data-storey-kanban><\/div>/gi),
  ]

  if (spaceKanbans.length === 0) {
    return returnContent
  }

  const storeyModel = await getStoreyDashboardForUser({
    suiteId: storey.suite_id,
    storeyId: storey.id,
    userId: user.id,
  })

  if (!storeyModel) {
    return returnContent
  }

  returnContent +=
    '<div class="p-4 flex gap-2 h-[700px] overflow-x-scroll *:w-[94%] *:sm:w-[40%] *:flex-shrink-0">'

  returnContent += formatModelTypeHeader('epiphany', storey)

  storeyModel.pkm_history
    ?.filter((item) => {
      return item.model_type === 'PkmEpiphany' && item.epiphany_item
    })
    .map((item) => {
      if (!item.epiphany_item) return

      returnContent += formatColumnContent({
        modelType: 'epiphany',
        storey,
        modelId: item.model_id,
        historyId: item.history_id,
        name: item.epiphany_item.name,
        summary: item.epiphany_item.summary,
      })
    })

  returnContent += `
                  </div>
                </div>
              `

  returnContent += formatModelTypeHeader('inbox', storey)

  storeyModel.pkm_history
    ?.filter((item) => {
      return item.model_type === 'PkmInbox' && item.inbox_item
    })
    .map((item) => {
      if (!item.inbox_item) return

      returnContent += formatColumnContent({
        modelType: 'inbox',
        storey,
        modelId: item.model_id,
        historyId: item.history_id,
        name: item.inbox_item.name,
        summary: item.inbox_item.summary,
      })
    })

  returnContent += `
                  </div>
                </div>
              `

  returnContent += formatModelTypeHeader('passing-thought', storey)

  storeyModel.pkm_history
    ?.filter((item) => {
      return (
        item.model_type === 'PkmPassingThought' && item.passing_thought_item
      )
    })
    .map((item) => {
      if (!item.passing_thought_item) return

      returnContent += formatColumnContent({
        modelType: 'passing-thought',
        storey,
        modelId: item.model_id,
        historyId: item.history_id,
        name: item.passing_thought_item.name,
        summary: item.passing_thought_item.summary,
      })
    })

  returnContent += `
                  </div>
                </div>
            `

  returnContent += formatModelTypeHeader('todo', storey)

  storeyModel.pkm_history
    ?.filter((item) => {
      return item.model_type === 'PkmTodo' && item.todo_item
    })
    .map((item) => {
      if (!item.todo_item) return

      returnContent += formatColumnContent({
        modelType: 'todo',
        storey,
        modelId: item.model_id,
        historyId: item.history_id,
        name: item.todo_item.name,
        summary: item.todo_item.summary,
      })
    })

  returnContent += `
                    </div>
                </div>
            `

  returnContent += formatModelTypeHeader('trash', storey)

  storeyModel.pkm_history
    ?.filter((item) => {
      return item.model_type === 'PkmTrash' && item.trash_item
    })
    .map((item) => {
      if (!item.trash_item) return

      returnContent += formatColumnContent({
        modelType: 'trash',
        storey,
        modelId: item.model_id,
        historyId: item.history_id,
        name: item.trash_item.name,
        summary: item.trash_item.summary,
      })
    })

  returnContent += `
                    </div>
                </div>
            `

  returnContent += formatModelTypeHeader('void', storey)

  storeyModel.pkm_history
    ?.filter((item) => {
      return item.model_type === 'PkmVoid' && item.void_item
    })
    .map((item) => {
      if (!item.void_item) return

      returnContent += formatColumnContent({
        modelType: 'void',
        storey,
        modelId: item.model_id,
        historyId: item.history_id,
        name: item.void_item.name,
        summary: item.void_item.summary,
      })
    })

  returnContent += `
                    </div>
                </div>
            `

  return returnContent + '</div>'
}

export default expandStoreyKanbans
