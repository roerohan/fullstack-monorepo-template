# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## IMPORTANT: This is a Template Repository

**You MUST read this section carefully before making any changes.**

### Determining Context: Template vs Application

Check the current working directory name:

- **If directory is `fullstack-monorepo-template`**: You are working on the template itself. Keep all demo content and examples intact.
- **If directory is anything else**: You are working on an application built from this template. You MUST clean up template artifacts before implementing features.

### When Working on an Application (NOT the template)

Before implementing any features, you MUST:

1. **Delete demo/example content**:
   - `packages/web/src/routes/demo/` - All demo routes
   - `packages/web/src/data/` - Demo data files
   - `packages/web/src/routes/rpc/` - Example RPC route files (but keep the pattern in mind)
   - Any other placeholder or example code

2. **Remove template styling**:
   - Do NOT use TanStack-specific theming, logos, or branding
   - Replace placeholder styles with application-specific styling
   - Remove TanStack logo files from `packages/web/public/` if not needed
   - **Keep TanStack Router DevTools** - The development debugging tools are useful and should remain

3. **Update package names** in `package.json` files from `@fullstack-monorepo-template/*` to match the application name

4. **Update service binding names** in `wrangler.jsonc` files to match the application name (replace `fullstack-monorepo-template-worker`)

### When Working on the Template Itself

Keep all demo content intact as it serves as reference examples for users of the template.

## Monorepo Architecture

This is a pnpm workspace monorepo with two packages:

- **`packages/worker`**: Cloudflare Worker (backend)
- **`packages/web`**: TanStack Start app (frontend)

### Key Architectural Pattern: Worker RPC via Service Bindings

The web package communicates with the worker package through **two mechanisms**:

1. **HTTP API** (traditional): REST endpoints exposed by Hono in `packages/worker/src/index.ts`
2. **RPC calls** (service bindings): Type-safe method calls via `WorkerRpc` class in `packages/worker/src/rpc.ts`

**Critical understanding**: The worker exports TWO things from `src/index.ts`:

- `export default app` - Hono HTTP handler (default export)
- `export { WorkerRpc } from './rpc'` - Named export for RPC entrypoint

The web package's `wrangler.jsonc` configures a service binding:

```jsonc
"services": [{
  "binding": "WORKER_RPC",
  "service": "fullstack-monorepo-template-worker",
  "entrypoint": "WorkerRpc"  // References the named export
}]
```

### Type Safety Across Packages

The web package imports types directly from the worker package:

```typescript
// packages/web/env.d.ts
import type { WorkerRpc } from '../worker/src/rpc';
```

This creates a **direct TypeScript dependency** between packages. The monorepo structure enables this cross-package type sharing.

### Calling Worker RPC Methods

**CORRECT way to access Worker RPC** in TanStack Start server functions:

```typescript
import { getWorkerRpc } from '@/lib/rpc';

const workerRpc = getWorkerRpc();
const result = await workerRpc.sayHello('World');
```

**DO NOT use** `getServerContext().cloudflare.env` - this is incorrect. Always use the `getWorkerRpc()` helper from `@/lib/rpc.ts`.

See `packages/web/src/routes/rpc/` for complete examples of proper RPC usage patterns.

## Commands

### Development

```bash
# Run both services in separate terminals
pnpm dev:worker    # Worker on localhost:8787
pnpm dev:web       # Web on localhost:3000

# Or run just one
pnpm --filter @fullstack-monorepo-template/worker dev
pnpm --filter @fullstack-monorepo-template/web dev
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @fullstack-monorepo-template/worker test
pnpm --filter @fullstack-monorepo-template/web test

# Run tests in watch mode (within package directory)
cd packages/worker && pnpm test --watch
```

### Linting & Formatting

```bash
pnpm lint           # Lint all packages + check formatting
pnpm lint:fix       # Fix linting issues in all packages
pnpm format         # Format all code
pnpm format:check   # Check formatting without changes
```

### Deployment

```bash
# Deploy both packages
pnpm deploy

# Deploy individually
pnpm deploy:worker
pnpm deploy:web

# Login to Cloudflare first (one-time)
cd packages/worker && pnpm wrangler login
```

### Working with Workspace Packages

```bash
# Add dependency to specific package
pnpm --filter @fullstack-monorepo-template/worker add <package-name>
pnpm --filter @fullstack-monorepo-template/web add <package-name>

# Add dev dependency
pnpm --filter @fullstack-monorepo-template/worker add -D <package-name>
```

## Adding New RPC Methods

When adding RPC methods that the web package will call:

1. **Add method to `packages/worker/src/rpc.ts`**:

```typescript
export class WorkerRpc extends WorkerEntrypoint {
	async myNewMethod(param: string): Promise<Result> {
		// implementation
	}
}
```

2. **TypeScript will automatically provide types** in the web package because `env.d.ts` imports the `WorkerRpc` type

3. **Call from web package** in any server function:

```typescript
import { getWorkerRpc } from '@/lib/rpc';

const workerRpc = getWorkerRpc();
const result = await workerRpc.myNewMethod('value');
```

4. **Optional**: Add helper function in `packages/web/src/lib/worker-rpc.ts` for convenience

## Adding Cloudflare Bindings

To add KV, D1, R2, or other bindings to the worker:

1. Update `packages/worker/wrangler.jsonc`:

```jsonc
{
	"kv_namespaces": [
		{
			"binding": "MY_KV",
			"id": "your-namespace-id",
		},
	],
}
```

2. Update TypeScript types in `packages/worker/src/index.ts` or create a separate `env.ts`:

```typescript
interface Env {
	MY_KV: KVNamespace;
}
```

3. Access in RPC methods or HTTP handlers:

```typescript
// In rpc.ts
export class WorkerRpc extends WorkerEntrypoint<Env> {
	async getData(key: string) {
		return await this.env.MY_KV.get(key);
	}
}
```

## Vitest Configuration for Cloudflare Workers

The worker package uses `@cloudflare/vitest-pool-workers` for testing. The config pattern is:

```typescript
// vitest.config.mts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		pool: '@cloudflare/vitest-pool-workers',
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
	},
});
```

**Do not use** `defineWorkersConfig` from `@cloudflare/vitest-pool-workers/config` - it causes TypeScript module resolution issues.

## pnpm Workspace Configuration

The `pnpm-workspace.yaml` includes `onlyBuiltDependencies` for native dependencies:

```yaml
onlyBuiltDependencies:
  - esbuild
  - sharp
  - workerd
```

This ensures these packages are built correctly in the monorepo context.

## Package Naming Convention

Packages use the `@fullstack-monorepo-template/*` scope:

- `@fullstack-monorepo-template/worker`
- `@fullstack-monorepo-template/web`

When filtering commands, use these exact names: `pnpm --filter @fullstack-monorepo-template/worker <command>`

## ESLint Configuration

The project uses **ESLint v9** with the new flat config format (`eslint.config.js`).

Key points:

- Uses `@typescript-eslint/eslint-plugin` v8+ (compatible with ESLint 9)
- Configured for both TypeScript and TSX/JSX files
- The `no-undef` rule is disabled for TypeScript files (TypeScript handles this)
- Ignores: `node_modules/`, `dist/`, `.wrangler/`, `build/`

Both packages (`worker` and `web`) have `lint` and `lint:fix` scripts that use the shared root config.
