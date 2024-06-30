import styles from '~/tailwind.css'

import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import faviconAssetUrl from './assets/favicon.svg'
import { rootAuthLoader } from '@clerk/remix/ssr.server'
import { ClerkApp, ClerkErrorBoundary } from '@clerk/remix'

export const links: LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
  { rel: 'stylesheet', href: styles },
]
export const meta: MetaFunction = () => [
  { title: 'Rethought' },
  { charset: 'utf-8' },
  { viewport: 'width=device-width,initial-scale=1' },
]

export const loader: LoaderFunction = (args) => rootAuthLoader(args)

export const ErrorBoundary = ClerkErrorBoundary()

function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          src="https://kit.fontawesome.com/b0498c8950.js"
          crossOrigin="anonymous"
        ></script>
        <Meta />
        <Links />
      </head>
      <body className={`bg-slate-950 text-blue-100`}>
        <div className="w-screen min-h-screen h-full flex">
          <div className="w-full mx-auto">
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            {/* This is how I'm able to dynamically write content and have it render in previews.
              Tailwind optimises the css, only including classes that are used in build time */}
            <script src={'/tailwind-full-3.4.4.js'}></script>
            <LiveReload />
          </div>
        </div>
      </body>
    </html>
  )
}

export default ClerkApp(App)
