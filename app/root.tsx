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
  { title: 'New Remix App' },
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
        <Meta />
        <Links />
      </head>
      <body className="bg-black">
        <div className="w-screen min-h-screen h-full bg-white/5 flex text-white">
          <div className="max-w-[1200px] w-full mx-auto bg-white/5">
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </div>
        </div>
      </body>
    </html>
  )
}

export default ClerkApp(App)
