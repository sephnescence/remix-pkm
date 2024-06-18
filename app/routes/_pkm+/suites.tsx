import { useLoaderData } from '@remix-run/react'
import SuiteDashboard from '~/components/Suites/SuiteDashboard'
import SuiteTopLevelBreadcrumbs from '~/components/nav/SuiteTopLevelBreadcrumbs'
import {
  SuiteConfigLoaderResponse,
  suitesConfigLoader,
} from '~/controllers/SuitesController'

export const loader = suitesConfigLoader

export default function SuitesRoute() {
  const suitesConfig = useLoaderData<typeof loader>()

  return (
    <>
      <SuiteTopLevelBreadcrumbs />
      <SuiteDashboard
        suitesConfig={suitesConfig as SuiteConfigLoaderResponse}
      />
    </>
  )
}
