# RPC Routes

This directory contains TanStack Router routes that expose the Worker RPC methods as HTTP endpoints.

## Overview

The routes in this directory act as a bridge between HTTP requests and the Worker RPC service binding. Each route:

1. Accepts HTTP requests with query parameters or request body
2. Calls the corresponding RPC method on the worker via service binding
3. Returns the result as JSON

## Architecture

```
Web Package (TanStack Start)
  └─ routes/rpc/*.tsx
      └─ createServerFn() handlers
          └─ getWorkerRpc() helper
              └─ env.WORKER_RPC (Service Binding)
                  └─ Worker Package RPC methods
```

### Service Binding

The `WORKER_RPC` binding is configured in `packages/web/wrangler.jsonc`:

```jsonc
"services": [{
  "binding": "WORKER_RPC",
  "service": "fullstack-monorepo-template-worker",
  "entrypoint": "WorkerRpc"
}]
```

This creates a direct, type-safe connection to the worker's RPC class without going through HTTP.

## Available Endpoints

### `/rpc/say-hello`
Returns a greeting message with timestamp.

**Query Parameters:**
- `name` (string, optional) - Name to greet (defaults to "World")

**Example:**
```bash
curl http://localhost:3000/rpc/say-hello?name=Alice
```

**Response:**
```json
{
  "message": "Hello, Alice!",
  "timestamp": 1234567890
}
```

---

### `/rpc/calculate`
Performs arithmetic operations.

**Query Parameters:**
- `operation` (string, required) - One of: `add`, `subtract`, `multiply`, `divide`
- `a` (number, required) - First operand
- `b` (number, required) - Second operand

**Example:**
```bash
curl http://localhost:3000/rpc/calculate?operation=multiply&a=7&b=6
```

**Response:**
```json
42
```

---

### `/rpc/get-data`
Retrieves data by key (mock implementation).

**Query Parameters:**
- `key` (string, required) - Key to look up

**Example:**
```bash
curl http://localhost:3000/rpc/get-data?key=myKey
```

**Response:**
```json
{
  "key": "myKey",
  "found": false,
  "value": undefined
}
```

---

### `/rpc/process-batch`
Processes a batch of items (converts to uppercase).

**Query Parameters:**
- `items` (string, required) - Comma-separated list of items

**Example:**
```bash
curl http://localhost:3000/rpc/process-batch?items=apple,banana,cherry
```

**Response:**
```json
{
  "processed": 3,
  "items": ["APPLE", "BANANA", "CHERRY"]
}
```

## Implementation Pattern

Each route follows this pattern:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getWorkerRpc } from '@/lib/rpc'

interface InputData {
  // Define input parameters
}

// Create server function that calls the RPC
const myRpcCall = createServerFn({ method: 'GET' }).handler(async (ctx: { data?: InputData }) => {
  const workerRpc = getWorkerRpc()
  const data = ctx.data as InputData | undefined

  // Validate input and call RPC method
  return workerRpc.myMethod(data.param)
})

// Define route with loader
export const Route = createFileRoute('/rpc/my-endpoint')({
  loader: async (ctx) => {
    // Extract params from URL
    const param = (ctx.location.search as { param?: string })?.param

    // @ts-expect-error - createServerFn types don't properly infer data parameter
    return myRpcCall({ data: { param } })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <div>{JSON.stringify(data)}</div>
}
```

## Helper Utilities

### `getWorkerRpc()`

Located in `packages/web/src/lib/rpc.ts`, this helper provides typed access to the Worker RPC binding:

```typescript
import { getWorkerRpc } from '@/lib/rpc'

const workerRpc = getWorkerRpc()
// Now you have full TypeScript autocomplete for all RPC methods
```

This centralizes the type assertion needed due to environment type limitations.

## Adding New RPC Routes

1. **Add the RPC method in the worker** (`packages/worker/src/rpc.ts`):
   ```typescript
   async myNewMethod(param: string): Promise<Result> {
     // implementation
   }
   ```

2. **Create a new route file** in this directory:
   ```typescript
   // packages/web/src/routes/rpc/my-new-method.tsx
   import { getWorkerRpc } from '@/lib/rpc'

   const myNewMethod = createServerFn({ method: 'GET' }).handler(async (ctx) => {
     const workerRpc = getWorkerRpc()
     return workerRpc.myNewMethod(ctx.data.param)
   })
   ```

3. **Types are automatically available** - TypeScript will know about your new method thanks to the type imports in `env.d.ts`

## Type Safety

The RPC calls are fully type-safe because:

1. `packages/web/env.d.ts` imports `WorkerRpc` type from the worker package
2. The monorepo structure allows direct TypeScript imports across packages
3. `getWorkerRpc()` returns a properly typed `WorkerRpc` instance
4. All method signatures, parameters, and return types are checked at compile time

## Benefits of RPC vs HTTP

Using service bindings for RPC instead of HTTP APIs provides:

- **Zero network overhead** - Direct in-process calls within Cloudflare's runtime
- **Type safety** - Full TypeScript inference across package boundaries
- **No serialization** - Direct object passing (when both are Workers)
- **Simpler code** - No need to define HTTP routes, parse bodies, handle errors manually
- **Better performance** - Eliminates HTTP request/response overhead

## See Also

- Worker RPC implementation: `packages/worker/src/rpc.ts`
- Service binding configuration: `packages/web/wrangler.jsonc`
- Type definitions: `packages/web/env.d.ts`
- Main documentation: `CLAUDE.md` (root)
