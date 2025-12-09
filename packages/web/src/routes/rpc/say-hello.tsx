import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getWorkerRpc } from '@/lib/rpc'

interface SayHelloData {
  name: string
}

const sayHello = createServerFn({ method: 'GET' }).handler(async (ctx: { data?: SayHelloData }) => {
  const workerRpc = getWorkerRpc()

  // Get the name from the context data
  const data = ctx.data as SayHelloData | undefined
  const name = data?.name || 'World'

  // Call the RPC method from the worker
  return workerRpc.sayHello(name)
})

export const Route = createFileRoute('/rpc/say-hello')({
  loader: async (ctx) => {
    // Extract name from search params using ctx.location.search
    const name = (ctx.location.search as { name?: string })?.name || 'World'

    // Call the server function with the name
    // @ts-expect-error - createServerFn types don't properly infer data parameter
    return sayHello({ data: { name } })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return <div>{JSON.stringify(data)}</div>
}
