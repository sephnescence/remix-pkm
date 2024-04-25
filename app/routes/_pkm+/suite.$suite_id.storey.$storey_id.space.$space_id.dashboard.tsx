import { Link, useLoaderData } from '@remix-run/react'
import SuiteInformationPacketTabGroup from '~/components/Suites/content/SuiteInformationPacketTabGroup'
import ArchiveBoxXMarkIcon from '~/components/icons/ArchiveBoxXMarkIcon'
import BellAlertIcon from '~/components/icons/BellAlertIcon'
import BoltIcon from '~/components/icons/BoltIcon'
import InboxStackIcon from '~/components/icons/InboxStackIcon'
import LightbulbIcon from '~/components/icons/LightbulbIcon'
import ListBulletIcon from '~/components/icons/ListBulletIcon'
import PlusIcon from '~/components/icons/PlusIcon'
import TrashIcon from '~/components/icons/TrashIcon'
import SpaceBreadcrumbs from '~/components/nav/SpaceBreadcrumbs'
import Epiphany from '~/components/pkm/Epiphany'
import Inbox from '~/components/pkm/Inbox'
import PassingThought from '~/components/pkm/PassingThought'
import Todo from '~/components/pkm/Todo'
import Trash from '~/components/pkm/Trash'
import Void from '~/components/pkm/Void'
import { spaceDashboardLoader } from '~/controllers/SpaceController'

export const loader = spaceDashboardLoader

export default function StoreyIndexRoute() {
  const { spaceDashboard, tab } = useLoaderData<typeof loader>()

  const spaceInformationPacketTabGroupProps = {
    tabGroupInputName: 'space',
    tabs: [
      {
        tabDefaultChecked: tab === 'content',
        tabName: 'content',
        tabHeader: <ListBulletIcon />,
        tabContent: (
          <div>BTTODO</div>
          // <div
          //   dangerouslySetInnerHTML={{
          //     __html: await displayStoreyContent(
          //       {
          //         id: storey.id,
          //         name: storey.name,
          //         description: storey.description,
          //         content: storey.content,
          //         storeys: storey.storeys.map((storey) => {
          //           return {
          //             id: storey.id,
          //             name: storey.name,
          //             description: storey.description,
          //             content: storey.content,
          //             storey_id: storey.id,
          //             spaces: storey.spaces.map((space) => {
          //               return {
          //                 id: space.id,
          //                 name: space.name,
          //                 description: space.description,
          //                 content: space.content,
          //                 storey_id: storey.id,
          //               }
          //             }),
          //           }
          //         }),
          //       },
          //       user,
          //     ),
          //   }}
          // ></div>
        ),
        tabContentClassName:
          'group-has-[.innsight-tab-group#space--tab--content:checked]:block',
      },
      {
        tabDefaultChecked: tab === 'epiphany',
        tabName: 'epiphany',
        tabHeader: <LightbulbIcon />,
        tabContent: (
          <>
            <div className="h-8 mb-2">
              <div className="relative">
                <div className="absolute top-0 left-0 flex">
                  <div className="bg-indigo-950 h-8 mr-2 py-1 px-3 rounded-lg hover:bg-violet-900">
                    <Link
                      className="flex rounded-lg focus:outline-offset-1 focus:outline-lime-600"
                      to={`/item/create/nSuiteId/${spaceDashboard.storey.suite.id}/nStoreyId/${spaceDashboard.storey.id}/nSpaceId/${spaceDashboard.id}/nModelType/epiphany`}
                      prefix="intent"
                    >
                      <LightbulbIcon />
                      <PlusIcon viewBox="6 -3 12 48" className="w-2 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              {spaceDashboard.pkm_history
                ?.filter((item) => {
                  return item.model_type === 'PkmEpiphany'
                })
                .map((item) => {
                  return (
                    <div key={item.model_id}>
                      <Link
                        to={`/item/view/eSuiteId/${spaceDashboard.storey.suite.id}/eStoreyId/${spaceDashboard.storey.id}/eSpaceId/${spaceDashboard.id}/eModelType/epiphany/eModelId/${item.model_id}/eHistoryId/${item.history_id}`}
                        prefix="intent"
                      >
                        <Epiphany
                          epiphanyItem={item.epiphany_item!}
                          copyToClipBoardLink={`<div data-content-loc="/content/suiteId/${spaceDashboard.storey.suite.id}/storeyId/${spaceDashboard.storey.id}/spaceId/${spaceDashboard.id}/modelId/${item.model_id}"></div>`}
                        />
                      </Link>
                    </div>
                  )
                })}
            </div>
          </>
        ),
        tabContentClassName:
          'group-has-[.innsight-tab-group#space--tab--epiphany:checked]:block',
      },
      {
        tabDefaultChecked: tab === 'inbox',
        tabName: 'inbox',
        tabHeader: <InboxStackIcon />,
        tabContent: (
          <>
            <div className="h-8 mb-2">
              <div className="relative">
                <div className="absolute top-0 left-0 flex">
                  <div className="bg-indigo-950 h-8 mr-2 py-1 px-3 rounded-lg hover:bg-violet-900">
                    <Link
                      className="flex rounded-lg focus:outline-offset-1 focus:outline-lime-600"
                      to={`/item/create/nSuiteId/${spaceDashboard.storey.suite.id}/nStoreyId/${spaceDashboard.storey.id}/nSpaceId/${spaceDashboard.id}/nModelType/inbox`}
                      prefix="intent"
                    >
                      <InboxStackIcon />
                      <PlusIcon viewBox="6 -3 12 48" className="w-2 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              {spaceDashboard.pkm_history
                ?.filter((item) => {
                  return item.model_type === 'PkmInbox'
                })
                .map((item) => {
                  return (
                    <div key={item.model_id}>
                      <Link
                        to={`/item/view/eSuiteId/${spaceDashboard.storey.suite.id}/eStoreyId/${spaceDashboard.storey.id}/eSpaceId/${spaceDashboard.id}/eModelType/inbox/eModelId/${item.model_id}/eHistoryId/${item.history_id}`}
                        prefix="intent"
                      >
                        <Inbox
                          inboxItem={item.inbox_item!}
                          copyToClipBoardLink={`<div data-content-loc="/content/suiteId/${spaceDashboard.storey.suite.id}/storeyId/${spaceDashboard.storey.id}/space/${spaceDashboard.id}/modelId/${item.model_id}"></div>`}
                        />
                      </Link>
                    </div>
                  )
                })}
            </div>
          </>
        ),
        tabContentClassName:
          'group-has-[.innsight-tab-group#space--tab--inbox:checked]:block',
      },
      {
        tabDefaultChecked: tab === 'passing-thought',
        tabName: 'passing-thought',
        tabHeader: <BoltIcon />,
        tabContent: (
          <>
            <div className="h-8 mb-2">
              <div className="relative">
                <div className="absolute top-0 left-0 flex">
                  <div className="bg-indigo-950 h-8 mr-2 py-1 px-3 rounded-lg hover:bg-violet-900">
                    <Link
                      className="flex rounded-lg focus:outline-offset-1 focus:outline-rose-600"
                      to={`/item/create/nSuiteId/${spaceDashboard.storey.suite.id}/nStoreyId/${spaceDashboard.storey.id}/nSpaceId/${spaceDashboard.id}/nModelType/passing-thought`}
                      prefix="intent"
                    >
                      <BoltIcon />
                      <PlusIcon viewBox="6 -3 12 48" className="w-2 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              {spaceDashboard.pkm_history
                ?.filter((item) => {
                  return item.model_type === 'PkmPassingThought'
                })
                .map((item) => {
                  return (
                    <div key={item.model_id}>
                      <Link
                        to={`/item/view/eSuiteId/${spaceDashboard.storey.suite.id}/eStoreyId/${spaceDashboard.storey.id}/eSpaceId/${spaceDashboard.id}/eModelType/passing-thought/eModelId/${item.model_id}/eHistoryId/${item.history_id}`}
                        prefix="intent"
                      >
                        <PassingThought
                          passingThoughtItem={item.passing_thought_item!}
                          copyToClipBoardLink={`<div data-content-loc="/content/suiteId/${spaceDashboard.storey.suite.id}/storeyId/${spaceDashboard.storey.id}/spaceId/${spaceDashboard.id}/modelId/${item.model_id}"></div>`}
                        />
                      </Link>
                    </div>
                  )
                })}
            </div>
          </>
        ),
        tabContentClassName:
          'group-has-[.innsight-tab-group#space--tab--passing-thought:checked]:block',
      },
      {
        tabDefaultChecked: tab === 'todo',
        tabName: 'todo',
        tabHeader: <BellAlertIcon />,
        tabContent: (
          <>
            <div className="h-8 mb-2">
              <div className="relative">
                <div className="absolute top-0 left-0 flex">
                  <div className="bg-indigo-950 h-8 mr-2 py-1 px-3 rounded-lg hover:bg-violet-900">
                    <Link
                      className="flex rounded-lg focus:outline-offset-1 focus:outline-cyan-600"
                      to={`/item/create/nSuiteId/${spaceDashboard.storey.suite.id}/nStoreyId/${spaceDashboard.storey.id}/nSpaceId/${spaceDashboard.id}/nModelType/todo`}
                      prefix="intent"
                    >
                      <BellAlertIcon />
                      <PlusIcon viewBox="6 -3 12 48" className="w-2 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              {spaceDashboard.pkm_history
                ?.filter((item) => {
                  return item.model_type === 'PkmTodo'
                })
                .map((item) => {
                  return (
                    <div key={item.model_id}>
                      <Link
                        to={`/item/view/eSuiteId/${spaceDashboard.storey.suite.id}/eStoreyId/${spaceDashboard.storey.id}/eSpaceId/${spaceDashboard.id}/eModelType/todo/eModelId/${item.model_id}/eHistoryId/${item.history_id}`}
                        prefix="intent"
                      >
                        <Todo
                          todoItem={item.todo_item!}
                          copyToClipBoardLink={`<div data-content-loc="/content/suiteId/${spaceDashboard.storey.suite.id}/storeyId/${spaceDashboard.storey.id}/space/${spaceDashboard.id}/modelId/${item.model_id}"></div>`}
                        />
                      </Link>
                    </div>
                  )
                })}
            </div>
          </>
        ),
        tabContentClassName:
          'group-has-[.innsight-tab-group#space--tab--todo:checked]:block',
      },
      {
        tabDefaultChecked: tab === 'void',
        tabName: 'void',
        tabHeader: <ArchiveBoxXMarkIcon />,
        tabContent: (
          <>
            <div className="h-8 mb-2">
              <div className="relative">
                <div className="absolute top-0 left-0 flex">
                  <div className="bg-indigo-950 h-8 mr-2 py-1 px-3 rounded-lg hover:bg-violet-900">
                    <Link
                      className="flex rounded-lg focus:outline-offset-1 focus:outline-orange-600"
                      to={`/item/create/nSuiteId/${spaceDashboard.storey.suite.id}/nStoreyId/${spaceDashboard.storey.id}/nSpaceId/${spaceDashboard.id}/nModelType/void`}
                      prefix="intent"
                    >
                      <ArchiveBoxXMarkIcon />
                      <PlusIcon viewBox="6 -3 12 48" className="w-2 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              {spaceDashboard.pkm_history
                ?.filter((item) => {
                  return item.model_type === 'PkmVoid'
                })
                .map((item) => {
                  return (
                    <div key={item.model_id}>
                      <Link
                        to={`/item/view/eSuiteId/${spaceDashboard.storey.suite.id}/eStoreyId/${spaceDashboard.storey.id}/eSpaceId/${spaceDashboard.id}/eModelType/void/eModelId/${item.model_id}/eHistoryId/${item.history_id}`}
                        prefix="intent"
                      >
                        <Void
                          voidItem={item.void_item!}
                          copyToClipBoardLink={`<div data-content-loc="/content/suiteId/${spaceDashboard.storey.suite.id}/storeyId/${spaceDashboard.storey.id}/spaceId/${spaceDashboard.id}/modelId/${item.model_id}"></div>`}
                        />
                      </Link>
                    </div>
                  )
                })}
            </div>
          </>
        ),
        tabContentClassName:
          'group-has-[.innsight-tab-group#space--tab--void:checked]:block',
      },
      {
        tabDefaultChecked: tab === 'trash',
        tabName: 'trash',
        tabHeader: <TrashIcon />,
        tabContent: (
          <>
            <div className="grid md:grid-cols-3 gap-2">
              {spaceDashboard.pkm_history
                ?.filter((item) => {
                  return item.model_type === 'PkmTrash'
                })
                .map((item) => {
                  return (
                    <div key={item.model_id}>
                      <Link
                        to={`/item/view/eSuiteId/${spaceDashboard.storey.suite.id}/eStoreyId/${spaceDashboard.storey.id}/eSpaceId/${spaceDashboard.id}/eModelType/trash/eModelId/${item.model_id}/eHistoryId/${item.history_id}`}
                        prefix="intent"
                      >
                        <Trash
                          trashItem={item.trash_item!}
                          copyToClipBoardLink={`<div data-content-loc="/content/suiteId/${spaceDashboard.storey.suite.id}/storeyId/${spaceDashboard.storey.id}/spaceId/${spaceDashboard.id}/modelId/${item.model_id}"></div>`}
                        />
                      </Link>
                    </div>
                  )
                })}
            </div>
          </>
        ),
        tabContentClassName:
          'group-has-[.innsight-tab-group#space--tab--trash:checked]:block',
      },
    ],
  }

  return (
    <>
      <SpaceBreadcrumbs
        suiteId={spaceDashboard.storey.suite.id}
        suiteName={spaceDashboard.storey.suite.name}
        storeyId={spaceDashboard.storey.id}
        storeyName={spaceDashboard.storey.name}
        spaceId={spaceDashboard.id}
        spaceName={spaceDashboard.name}
      />
      <p className="text-4xl mb-2">
        <Link
          to={`/suite/${spaceDashboard.storey.suite.id}/storey/${spaceDashboard.storey.id}/space/${spaceDashboard.id}/config`}
          prefix="intent"
        >
          {spaceDashboard.name}
        </Link>
      </p>
      <div className="text-xl text-white/60 mb-2">
        {spaceDashboard.description}
      </div>
      <SuiteInformationPacketTabGroup
        suiteInformationPacketTabGroupProps={
          spaceInformationPacketTabGroupProps
        }
      />
    </>
  )
}
