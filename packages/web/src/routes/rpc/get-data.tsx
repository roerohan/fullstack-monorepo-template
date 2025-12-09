import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getWorkerRpc } from '@/lib/rpc'

interface GetDataInput {
  key: string
}

const getData = createServerFn({ method: 'GET' }).handler(async (ctx: { data?: GetDataInput }) => {
  const workerRpc = getWorkerRpc()

  // Get the key from the context data
  const data = ctx.data as GetDataInput | undefined
  const key = data?.key

  if (!key) {
    throw new Error('Missing required parameter: key')
  }

  // Call the RPC method from the worker
  return workerRpc.getData(key)
})

export const Route = createFileRoute('/rpc/get-data')({
  loader: async (ctx) => {
    // Extract key from search params
    const search = ctx.location.search as { key?: string }
    const key = search.key

    if (!key) {
      throw new Error('Missing required parameter: key')
    }

    // Call the server function with the key
    // @ts-expect-error - createServerFn types don't properly infer data parameter
    return getData({ data: { key } })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return (
    <div>
      <h3>Get Data Result</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
