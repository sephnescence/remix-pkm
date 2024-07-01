import { Prisma, User } from '@prisma/client'
import { db } from '../../db'

const expandSuiteStoreyKanbans = async (
  returnContent: string,
  suite: {
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
  },
  user: User,
): Promise<string> => {
  const storeyKanbans = [
    ...returnContent.matchAll(
      /<div data-storey-(epiphany|inbox|passing-thought|todo|trash|void)-kanban><\/div>/gi,
    ),
  ]

  for (const { 0: match, 1: modelType, index } of storeyKanbans.reverse()) {
    if (
      modelType !== 'epiphany' &&
      modelType !== 'inbox' &&
      modelType !== 'passing-thought' &&
      modelType !== 'todo' &&
      modelType !== 'trash' &&
      modelType !== 'void'
    ) {
      continue
    }

    let storeyKanbanContent = ''

    for (const storey of suite.storeys.sort((storeyA, storeyB) =>
      storeyA.name.localeCompare(storeyB.name),
    )) {
      const query = Prisma.sql`select ph.suite_id, ph.storey_id, ph.space_id, ph.history_id, COALESCE(pe.model_id, pi.model_id, pp.model_id, pto.model_id, ptr.model_id, pv.model_id) as model_id, COALESCE(pe.name, pi.name, pp.name, pto.name, ptr.name, pv.name) as name, COALESCE(pe.summary, pi.summary, pp.summary, pto.summary, ptr.summary, pv.summary) as summary
                  from "PkmHistory" ph
                  left join "PkmEpiphany" pe on ${modelType} = 'epiphany' and pe.history_id = ph.history_id and pe.model_id = ph.model_id
                  left join "PkmInbox" pi on ${modelType} = 'inbox' and pi.history_id = ph.history_id and pi.model_id = ph.model_id
                  left join "PkmPassingThought" pp on ${modelType} = 'passing-thought' and pp.history_id = ph.history_id and pp.model_id = ph.model_id
                  left join "PkmTodo" pto on ${modelType} = 'todo' and pto.history_id = ph.history_id and pto.model_id = ph.model_id
                  left join "PkmTrash" ptr on ${modelType} = 'trash' and ptr.history_id = ph.history_id and ptr.model_id = ph.model_id
                  left join "PkmVoid" pv on ${modelType} = 'void' and pv.history_id = ph.history_id and pv.model_id = ph.model_id
                  where ph.is_current is true
                    and ph.user_id = ${user.id}::uuid
                    and suite_id = ${suite.id}::uuid
                    and storey_id = ${storey.id}::uuid
                    and space_id is null
                    and COALESCE(pe.model_id, pi.model_id, pp.model_id, pto.model_id, ptr.model_id, pv.model_id) is not null
                  order by COALESCE(pe.name, pi.name, pp.name, pto.name, ptr.name, pv.name) asc`

      const results: {
        suite_id: string
        storey_id: string
        space_id: string
        history_id: string
        model_id: string
        name: string
        summary: string
      }[] = await db.$queryRaw(query)

      if (results.length === 0) {
        continue
      }

      storeyKanbanContent += `
            <div>
              <div class="pb-4 flex gap-2">
                <div>
                  <a class="p-2 bg-indigo-950 hover:bg-violet-900 rounded-md" href="/item/create/eSuiteId/${storey.suite_id}/eStoreyId/${storey.id}/nModelType/${modelType}">Add</a>
                </div>
                <div class="line-clamp-1">${storey.name}</div>
              </div>
              <div class="sm:h-[600px] overflow-y-scroll *:pb-4 *:border-b-2">
          `

      for (const result of results) {
        storeyKanbanContent += `
              <div class="mb-2">
                <a href="/item/edit/eSuiteId/${storey.suite_id}/eStoreyId/${result.storey_id}/eModelType/${modelType}/eModelId/${result.model_id}/eHistoryId/${result.history_id}">
                  <div class="text-lg line-clamp-1">${result.name}</div>
                  <div class="text-sm line-clamp-4">${result.summary}</div>
                </a>
              </div>`
      }

      storeyKanbanContent += `
              </div>
            </div>
          `
    }

    returnContent =
      returnContent.slice(0, index) +
      storeyKanbanContent +
      returnContent.slice(index! + match.length)
  }

  return returnContent
}

export default expandSuiteStoreyKanbans
