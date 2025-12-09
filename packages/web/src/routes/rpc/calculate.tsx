import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getWorkerRpc } from '@/lib/rpc'

interface CalculateData {
  operation: 'add' | 'subtract' | 'multiply' | 'divide'
  a: number
  b: number
}

const calculate = createServerFn({ method: 'GET' }).handler(async (ctx: { data?: CalculateData }) => {
  const workerRpc = getWorkerRpc()

  // Get the calculation data from the context
  const data = ctx.data as CalculateData | undefined

  if (!data) {
    throw new Error('Missing calculation parameters')
  }

  // Call the RPC method from the worker
  return workerRpc.calculate(data.operation, data.a, data.b)
})

export const Route = createFileRoute('/rpc/calculate')({
  loader: async (ctx) => {
    // Extract parameters from search params
    const search = ctx.location.search as { operation?: string; a?: string; b?: string }
    const operation = search.operation as 'add' | 'subtract' | 'multiply' | 'divide' | undefined
    const a = search.a ? parseFloat(search.a) : undefined
    const b = search.b ? parseFloat(search.b) : undefined

    if (!operation || a === undefined || b === undefined) {
      throw new Error('Missing required parameters: operation, a, b')
    }

    // Call the server function with the parameters
    // @ts-expect-error - createServerFn types don't properly infer data parameter
    return calculate({ data: { operation, a, b } })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return <div>Result: {data}</div>
}
