import { RedirectToSignIn, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import { Link, Outlet } from '@remix-run/react'

export default function DashboardBase() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="mx-4 my-4 absolute top-0 right-0 flex">
          <div className="mr-4">
            <Link to="/dashboard">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 130 130"
                fill="none"
              >
                <circle cx="65" cy="65" r="65" fill="#5A4EAE" />
                <g stroke="#FFF" strokeWidth="1.5">
                  <circle
                    cx="65"
                    cy="20"
                    r="5"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <circle
                    cx="100"
                    cy="30"
                    r="5"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <circle
                    cx="110"
                    cy="65"
                    r="5"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="5"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r="24"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                  />
                  <line x1="97" y1="33" x2="70" y2="60" stroke="white" />
                  <line x1="97" y1="97" x2="70" y2="70" stroke="white" />
                  <line x1="65" y1="25" x2="65" y2="57" stroke="white" />
                  <line x1="105" y1="65" x2="73" y2="65" stroke="white" />
                </g>
              </svg>
            </Link>
          </div>
          <div className="mr-4 bg-slate-600 rounded-full">
            <Link to="/dashboard/trash">
              <svg
                width="32"
                height="32"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ scale: '0.5' }}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.75 1C7.23122 1 6 2.23122 6 3.75V4.1927C5.20472 4.26972 4.41602 4.36947 3.63458 4.49129C3.22531 4.5551 2.94525 4.9386 3.00906 5.34787C3.07286 5.75714 3.45637 6.0372 3.86564 5.97339L4.01355 5.95062L4.85504 16.4693C4.96938 17.8985 6.16254 19 7.59629 19H12.4035C13.8372 19 15.0304 17.8985 15.1447 16.4693L15.9862 5.95055L16.1346 5.97339C16.5438 6.0372 16.9274 5.75714 16.9912 5.34787C17.055 4.9386 16.7749 4.5551 16.3656 4.49129C15.5841 4.36946 14.7954 4.2697 14 4.19268V3.75C14 2.23122 12.7688 1 11.25 1H8.75ZM10.0001 4C10.8395 4 11.673 4.02523 12.5 4.07499V3.75C12.5 3.05964 11.9404 2.5 11.25 2.5H8.75C8.05964 2.5 7.5 3.05964 7.5 3.75V4.075C8.32707 4.02524 9.16068 4 10.0001 4ZM8.57948 7.72002C8.56292 7.30614 8.21398 6.98404 7.8001 7.0006C7.38622 7.01716 7.06412 7.36609 7.08068 7.77998L7.38069 15.28C7.39725 15.6939 7.74619 16.016 8.16007 15.9994C8.57395 15.9828 8.89605 15.6339 8.87949 15.22L8.57948 7.72002ZM12.9195 7.77998C12.936 7.36609 12.614 7.01715 12.2001 7.0006C11.7862 6.98404 11.4372 7.30614 11.4207 7.72002L11.1207 15.22C11.1041 15.6339 11.4262 15.9828 11.8401 15.9994C12.254 16.016 12.6029 15.6939 12.6195 15.28L12.9195 7.77998Z"
                  fill="#FFFFFF"
                />
              </svg>
            </Link>
          </div>
          <div className="mr-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <div className="mx-4 my-4">
          <Outlet />
        </div>
      </SignedIn>
    </>
  )
}
