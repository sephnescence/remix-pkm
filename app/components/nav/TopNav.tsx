import { SignedIn, UserButton } from '@clerk/remix'
import { Link } from '@remix-run/react'
import PkmIcon from '../icons/PkmIcon'
import BuildingOffice2Icon from '../icons/BuildingOffice2Icon'
import FaSolidBuildingMemoIcon from '../icons/FaSolidBuildingMemoIcon'

const TopNav = () => {
  return (
    <SignedIn>
      <div className="mx-4 my-4 absolute top-0 right-0 flex">
        <div className="mr-4">
          <Link to="/reception" prefetch="intent">
            <PkmIcon className="w-8 h-8" />
          </Link>
        </div>
        <div className="mr-4 bg-indigo-900 rounded-full">
          <Link to="/suites" prefetch="intent">
            <BuildingOffice2Icon className="w-8 h-8" style={{ scale: '0.5' }} />
          </Link>
        </div>
        <div className="mr-4 bg-indigo-900 rounded-full">
          <Link to="/history" prefetch="intent">
            <FaSolidBuildingMemoIcon
              className="w-8 h-8 align-middle"
              style={{ scale: '0.5' }}
            />
            {/* <div className="min-w-8 min-h-8 max-w-8 max-h-8 align-middle">
              <i
                className="fa-solid fa-building-memo pt-1"
                style={{ scale: '0.5' }}
              ></i>
            </div> */}
          </Link>
        </div>
        <div className="mr-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </SignedIn>
  )
}

export default TopNav
