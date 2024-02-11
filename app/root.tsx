import { cssBundleHref } from '@remix-run/css-bundle'
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

import { rootAuthLoader } from '@clerk/remix/ssr.server'
import { ClerkApp, ClerkErrorBoundary } from '@clerk/remix'

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
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
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default ClerkApp(App)
