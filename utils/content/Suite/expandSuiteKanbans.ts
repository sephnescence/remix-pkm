import { feModelTypeMap } from '@/utils/apiUtils'
import { User } from '@prisma/client'
import { getSuiteDashboardForUser } from '~/repositories/PkmSuiteRepository'

/*
    TypeScript gymnastics. I have to manually iterate through the item types
    
    I had only recently gotten confident enough with TypeScript to condense the 72 Item files into 4, but I must admit
      I'm disappointed that I haven't been able to solve it in this file
*/

type Suite = {
  id: string
  name: string
  description: string
  content: string
  storeys: {
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
  }[]
}

const formatModelTypeHeader = (modelType: string, suite: Suite) => {
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
                <a class="p-2 bg-indigo-950 hover:bg-violet-900 rounded-md" href="/item/create/eSuiteId/${suite.id}/nModelType/${modelType}">Add</a>
            </div>
            <div class="line-clamp-1">${feModelTypeMap[modelType]}</div>
        </div>
        <div class="sm:h-[600px] overflow-y-scroll *:pb-4 *:border-b-2">
  `
}

const formatColumnContent = ({
  modelType,
  suite,
  modelId,
  historyId,
  name,
  summary,
}: {
  modelType: string
  suite: Suite
  modelId: string
  historyId: string
  name: string
  summary: string
}) => {
  return `
    <div class="mb-2">
        <a href="/item/edit/eSuiteId/${suite.id}/eModelType/${modelType}/eModelId/${modelId}/eHistoryId/${historyId}">
        <div class="text-lg line-clamp-1">${name}</div>
        <div class="text-sm line-clamp-4">${summary}</div>
        </a>
    </div>
  `
}

const expandSuiteKanbans = async (
  returnContent: string,
  suite: Suite,
  user: User,
): Promise<string> => {
  const spaceKanbans = [
    ...returnContent.matchAll(/<div data-suite-kanban><\/div>/gi),
  ]

  if (spaceKanbans.length === 0) {
    return returnContent
  }

  const suiteModel = await getSuiteDashboardForUser({
    suiteId: suite.id,
    userId: user.id,
  })

  if (!suiteModel) {
    return returnContent
  }

  returnContent +=
    '<div class="p-4 flex gap-2 h-[700px] overflow-x-scroll *:w-[94%] *:sm:w-[40%] *:flex-shrink-0">'

  returnContent += formatModelTypeHeader('epiphany', suite)

  suiteModel.pkm_history
    ?.filter((item) => {
      return item.model_type === 'PkmEpiphany' && item.epiphany_item
    })
    .map((item) => {
      if (!item.epiphany_item) return

      returnContent += formatColumnContent({
        modelType: 'epiphany',
        suite,
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

  returnContent += formatModelTypeHeader('inbox', suite)

  suiteModel.pkm_history
    ?.filter((item) => {
      return item.model_type === 'PkmInbox' && item.inbox_item
    })
    .map((item) => {
      if (!item.inbox_item) return

      returnContent += formatColumnContent({
        modelType: 'inbox',
        suite,
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

  returnContent += formatModelTypeHeader('passing-thought', suite)

  suiteModel.pkm_history
    ?.filter((item) => {
      return (
        item.model_type === 'PkmPassingThought' && item.passing_thought_item
      )
    })
    .map((item) => {
      if (!item.passing_thought_item) return

      returnContent += formatColumnContent({
        modelType: 'passing-thought',
        suite,
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

  returnContent += formatModelTypeHeader('todo', suite)

  suiteModel.pkm_history
    ?.filter((item) => {
      return item.model_type === 'PkmTodo' && item.todo_item
    })
    .map((item) => {
      if (!item.todo_item) return

      returnContent += formatColumnContent({
        modelType: 'todo',
        suite,
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

  returnContent += formatModelTypeHeader('trash', suite)

  suiteModel.pkm_history
    ?.filter((item) => {
      return item.model_type === 'PkmTrash' && item.trash_item
    })
    .map((item) => {
      if (!item.trash_item) return

      returnContent += formatColumnContent({
        modelType: 'trash',
        suite,
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

  returnContent += formatModelTypeHeader('void', suite)

  suiteModel.pkm_history
    ?.filter((item) => {
      return item.model_type === 'PkmVoid' && item.void_item
    })
    .map((item) => {
      if (!item.void_item) return

      returnContent += formatColumnContent({
        modelType: 'void',
        suite,
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

export default expandSuiteKanbans
