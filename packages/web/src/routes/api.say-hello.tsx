import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import type { WorkerRpc } from '../../../worker/src/rpc'

interface SayHelloData {
  name: string
}

const sayHello = createServerFn({ method: 'GET' }).handler(async (ctx: { data?: SayHelloData }) => {
  const WORKER_RPC = env.WORKER_RPC as unknown as WorkerRpc

  // Get the name from the context data
  const data = ctx.data as SayHelloData | undefined
  const name = data?.name || 'World'

  // Call the RPC method from the worker
  return WORKER_RPC.sayHello(name)
})

export const Route = createFileRoute('/api/say-hello')({
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
