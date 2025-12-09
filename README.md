# Fullstack Monorepo Template

A fullstack monorepo template using pnpm workspaces with a Cloudflare Worker backend and TanStack Start frontend.

## Project Structure

```
.
├── packages/
│   ├── worker/         # Cloudflare Worker API (Hono + RPC)
│   └── web/            # TanStack Start web app
├── package.json        # Root package.json with workspace scripts
└── pnpm-workspace.yaml # pnpm workspace configuration
```

## Features

- **Worker RPC**: Service bindings enable type-safe RPC calls from web to worker
- **Hono API**: REST API endpoints in the worker
- **TanStack Start**: Modern React framework with SSR
- **Type Safety**: Full TypeScript support across packages
- **Monorepo**: Shared dependencies and scripts via pnpm workspaces

## Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- Cloudflare account (for deployment)

## Getting Started

1. **Customize package names** (optional):

   The template uses `@fullstack-monorepo-template/*` as the package scope. To customize for your project:

   - Find and replace `@fullstack-monorepo-template/` with `@your-project-name/` across the project
   - Update `packages/worker/package.json` name field
   - Update `packages/web/package.json` name field
   - Update the service name in `packages/web/wrangler.jsonc` to match your worker name

2. Install dependencies:

```bash
pnpm install
```

3. Start the worker in development mode:

```bash
pnpm dev:worker
```

4. In a separate terminal, start the web app:

```bash
pnpm dev:web
```

The worker will run on http://localhost:8787 and the web app on http://localhost:3000.

## Available Scripts

### Root Level

- `pnpm dev` - Start the worker in development mode
- `pnpm dev:worker` - Start the worker in development mode
- `pnpm dev:web` - Start the web app in development mode
- `pnpm test` - Run tests in all packages
- `pnpm lint` - Lint all packages
- `pnpm lint:fix` - Fix linting issues in all packages
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm deploy` - Deploy all packages

### Worker Package

- `pnpm --filter @fullstack-monorepo-template/worker dev` - Start in development mode
- `pnpm --filter @fullstack-monorepo-template/worker deploy` - Deploy to Cloudflare
- `pnpm --filter @fullstack-monorepo-template/worker test` - Run tests

### Web Package

- `pnpm --filter @fullstack-monorepo-template/web dev` - Start in development mode
- `pnpm --filter @fullstack-monorepo-template/web build` - Build for production
- `pnpm --filter @fullstack-monorepo-template/web deploy` - Deploy to Cloudflare Pages

## Deployment

### Worker

1. Login to Cloudflare:

```bash
cd packages/worker
pnpm wrangler login
```

2. Update `wrangler.jsonc` with your account details

3. Deploy:

```bash
pnpm deploy:worker
```

### Web App

1. Build and deploy to Cloudflare Pages:

```bash
pnpm deploy:web
```

Or deploy to any static hosting service:

```bash
cd packages/web
pnpm build
# Upload dist/ directory to your hosting service
```

## Using Worker RPC

The web package can call the worker via RPC using service bindings for type-safe, low-latency communication.

### In the Worker (packages/worker/src/rpc.ts)

```typescript
export class WorkerRpc extends WorkerEntrypoint {
	async sayHello(name: string) {
		return { message: `Hello, ${name}!`, timestamp: Date.now() };
	}
}
```

### In the Web App (TanStack Start routes)

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getWorkerRpc } from '@/lib/rpc'

const sayHello = createServerFn({ method: 'GET' }).handler(async () => {
	const workerRpc = getWorkerRpc()

	// Call RPC methods with full type safety
	const result = await workerRpc.sayHello('World')

	return result
})

export const Route = createFileRoute('/my-route')({
	loader: async () => sayHello(),
	component: MyComponent,
})
```

### Example RPC Routes

The template includes example RPC routes in `packages/web/src/routes/rpc/`:

- `/rpc/say-hello?name=Alice` - Returns a greeting message
- `/rpc/calculate?operation=add&a=5&b=3` - Performs arithmetic operations
- `/rpc/get-data?key=myKey` - Fetches data (can be extended for KV/D1/R2)
- `/rpc/process-batch?items=a,b,c` - Processes batch operations

**Note:** These are template examples - customize or replace them with your own RPC methods for your use case.

See `packages/web/src/routes/rpc/README.md` for detailed documentation on the RPC architecture and how to add new methods.

## Configuration

### Worker

- `packages/worker/wrangler.jsonc` - Cloudflare Worker configuration
- `packages/worker/src/index.ts` - Main worker entry point (HTTP handler)
- `packages/worker/src/rpc.ts` - RPC entrypoint for service bindings

### Web App

- `packages/web/wrangler.jsonc` - Cloudflare Pages configuration (includes service binding)
- `packages/web/vite.config.ts` - Vite configuration
- `packages/web/src/routes/` - TanStack Start routes

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Worker**: Cloudflare Workers, Hono, WorkerEntrypoint (RPC), TypeScript
- **Web**: TanStack Start, React, TypeScript
- **Testing**: Vitest
- **Linting**: ESLint, Prettier

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:

- Setting up the development environment
- Code standards and style guidelines
- Testing requirements
- Pull request process
- Monorepo-specific guidelines

## License

MIT License - see [LICENSE](./LICENSE) file for details
