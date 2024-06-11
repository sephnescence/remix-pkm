'use server'

import { redirect, useLoaderData } from '@remix-run/react'
import { privateContentViewLoader } from '~/controllers/PrivateContentController'

export const loader = privateContentViewLoader

export default function PrivateContentViewRoute() {
  const loaderData = useLoaderData<typeof loader>()

  if (!loaderData.resolvedContent) {
    return redirect('/')
  }

  return (
    <div>
      <div
        dangerouslySetInnerHTML={{ __html: loaderData.resolvedContent }}
      ></div>
    </div>
  )
}
