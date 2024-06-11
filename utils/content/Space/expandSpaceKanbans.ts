import { db } from '@/utils/db'
import { Prisma, User } from '@prisma/client'

type Space = {
  id: string
  name: string
  description: string
  content: string
  storey: {
    id: string
    name: string
    description: string
    suite: {
      id: string
      name: string
      description: string
    }
  }
}

const expandSpaceKanbans = async (
  returnContent: string,
  space: Space,
  user: User,
): Promise<string> => {
  const spaceKanbans = [
    ...returnContent.matchAll(/<div data-space-kanban><\/div>/gi),
  ]

  for (const { 0: match, index } of spaceKanbans.reverse()) {
    returnContent =
      returnContent.slice(0, index) +
      `
        <div class="p-4 flex gap-2 h-[700px] overflow-x-scroll *:w-[94%] *:sm:w-[40%] *:flex-shrink-0">
            <div data-space-epiphany-kanban></div>
            <div data-space-inbox-kanban></div>
            <div data-space-passing-thought-kanban></div>
            <div data-space-todo-kanban></div>
            <div data-space-trash-kanban></div>
            <div data-space-void-kanban></div>
        </div>
      ` +
      returnContent.slice(index! + match.length)
  }

  const specificSpaceKanbans = [
    ...returnContent.matchAll(
      /<div data-space-(epiphany|inbox|passing-thought|todo|trash|void)-kanban><\/div>/gi,
    ),
  ]

  for (const {
    0: match,
    1: modelType,
    index,
  } of specificSpaceKanbans.reverse()) {
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

    let spaceInboxListContent = '<div>'

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
                      and suite_id is null
                      and storey_id = ${space.storey.id}::uuid
                      and space_id = ${space.id}::uuid
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

    spaceInboxListContent += `
          <div>
              <div class="pb-4 flex gap-2">
              <div>
                  <a class="p-2 bg-indigo-950 hover:bg-violet-900 rounded-md" href="/item/create/nSuiteId/${space.storey.suite.id}/nStoreyId/${space.storey.id}/nSpaceId/${space.id}/nModelType/${modelType}">Add</a>
              </div>
              <div class="line-clamp-1">${space.name}</div>
              </div>
              <div class="sm:h-[600px] overflow-y-scroll *:pb-4 *:border-b-2">
          `

    for (const result of results) {
      spaceInboxListContent += `
              <div class="mb-2">
              <a href="/item/edit/eSuiteId/${space.storey.suite.id}/eStoreyId/${space.storey.id}/eSpaceId/${space.id}/eModelType/${modelType}/eModelId/${result.model_id}/eHistoryId/${result.history_id}">
                  <div class="text-lg line-clamp-1">${result.name}</div>
                  <div class="text-sm line-clamp-4">${result.summary}</div>
              </a>
              </div>
          `
    }

    spaceInboxListContent += `
                  </div>
                </div>
              </div>
            `

    returnContent =
      returnContent.slice(0, index) +
      spaceInboxListContent +
      returnContent.slice(index! + match.length)
  }

  return returnContent
}

export default expandSpaceKanbans
