import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getWorkerRpc } from '@/lib/rpc'

interface ProcessBatchInput {
  items: string[]
}

const processBatch = createServerFn({ method: 'POST' }).handler(async (ctx: { data?: ProcessBatchInput }) => {
  const workerRpc = getWorkerRpc()

  // Get the items from the context data
  const data = ctx.data as ProcessBatchInput | undefined
  const items = data?.items

  if (!items || !Array.isArray(items)) {
    throw new Error('Missing required parameter: items (must be an array)')
  }

  // Call the RPC method from the worker
  return workerRpc.processBatch(items)
})

export const Route = createFileRoute('/rpc/process-batch')({
  loader: async (ctx) => {
    // Extract items from search params (comma-separated)
    const search = ctx.location.search as { items?: string }
    const itemsStr = search.items

    if (!itemsStr) {
      throw new Error('Missing required parameter: items (comma-separated values)')
    }

    // Split comma-separated string into array
    const items = itemsStr.split(',').map(item => item.trim())

    // Call the server function with the items
    // @ts-expect-error - createServerFn types don't properly infer data parameter
    return processBatch({ data: { items } })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return (
    <div>
      <h3>Process Batch Result</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
