import { Link } from '@remix-run/react'
import BuildingOffice2Icon from '../icons/BuildingOffice2Icon'
import PlusIcon from '../icons/PlusIcon'
import SuiteTile from './forms/SuiteTile'
import { SuiteConfigLoaderResponse } from '~/controllers/SuitesController'

const SuiteDashboard = ({
  suitesConfig,
}: {
  suitesConfig: SuiteConfigLoaderResponse
}) => {
  const { suites, suiteItemCounts } = suitesConfig
  return (
    <>
      <p className="text-4xl mb-2">Suites</p>
      <div className="text-xl text-white/60 mb-2">
        Review and remodel your suites
      </div>
      <div className="h-8 mb-2 ml-1">
        <div className="relative">
          <div className="absolute top-0 left-0 flex">
            <div className="bg-indigo-900 h-8 mr-2 py-1 px-3 rounded-lg hover:ring-1 hover:ring-indigo-500">
              <Link
                className="flex rounded-lg focus:outline-offset-1 focus:outline-lime-600"
                to={`/suite/config/new`}
              >
                <BuildingOffice2Icon />
                <PlusIcon viewBox="6 -3 12 48" className="w-2 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
        {suites.map((suite) => {
          if (!suite || !suite.id || !suite.name || !suite.description) {
            return null
          }
          return (
            <div key={suite.id}>
              <SuiteTile
                id={suite.id}
                name={suite.name}
                description={suite.description}
                storeyCount={suite._count.storeys || 0}
                suiteItemCount={suiteItemCounts[suite.id] || null}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

export default SuiteDashboard
