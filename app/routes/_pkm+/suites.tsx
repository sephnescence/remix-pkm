import { useLoaderData } from '@remix-run/react'
import SuiteDashboard from '~/components/Suites/SuiteDashboard'
import {
  SuiteConfigLoaderResponse,
  suitesConfigLoader,
} from '~/controllers/SuitesController'

export const loader = suitesConfigLoader

export default function SuitesRoute() {
  const suitesConfig = useLoaderData<typeof loader>()

  return (
    <SuiteDashboard suitesConfig={suitesConfig as SuiteConfigLoaderResponse} />
  )
}
