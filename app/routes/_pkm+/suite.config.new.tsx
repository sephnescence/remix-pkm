import SuiteForm from '~/components/Suites/forms/SuiteForm'
import { suiteConfigNewAction } from '~/controllers/SuiteController'
import { suitesConfigLoader } from '~/controllers/SuitesController'

export const loader = suitesConfigLoader
export const action = suiteConfigNewAction

export default function SuiteConfigNewRoute() {
  return (
    <SuiteForm
      pageTitle="Configure New Suite"
      pageSubtitle={null}
      cancelUrl="/suites"
    />
  )
}
