# Contributing Guidelines

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing to the fullstack monorepo template.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Monorepo Guidelines](#monorepo-guidelines)
- [Pull Request Process](#pull-request-process)
- [Architecture Guidelines](#architecture-guidelines)

## Getting Started

### Prerequisites

- Node.js >= 24
- pnpm (`npm install -g pnpm`)
- Git
- A Cloudflare account (for deployment testing)

### Initial Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/fullstack-monorepo-template.git
   cd fullstack-monorepo-template
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Create a new branch for your work:

   ```bash
   git checkout -b feature/your-feature-name
   ```

5. Start the development servers:

   ```bash
   # Terminal 1: Worker
   pnpm dev:worker

   # Terminal 2: Web app
   pnpm dev:web
   ```

## Development Workflow

### Working on a Specific Package

To work on a specific package, use pnpm filters:

```bash
# Add a dependency to the worker package
pnpm --filter @fullstack-monorepo-template/worker add package-name

# Run tests for the web package
pnpm --filter @fullstack-monorepo-template/web test

# Start development for a specific package
pnpm --filter @fullstack-monorepo-template/worker dev
```

### Running Tests

Before submitting a pull request, ensure all tests pass:

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @fullstack-monorepo-template/worker test

# Run tests in watch mode (within package directory)
cd packages/worker
pnpm test --watch
```

### Linting and Formatting

We use ESLint v9 with TypeScript support and Prettier for formatting:

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format all code
pnpm format

# Check formatting without changes
pnpm format:check
```

**Important:** All code must pass linting and formatting checks before being merged.

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict type checking
- Avoid using `any` - use `unknown` or proper types instead
- Define interfaces for all data structures
- Use type inference where appropriate

### Code Style

- Use tabs for indentation (configured in Prettier)
- Single quotes for strings
- Trailing commas in objects and arrays
- 120 character line width
- Use async/await over promises where possible

### Naming Conventions

- **Files**: Use kebab-case (e.g., `worker-rpc.ts`)
- **Components**: Use PascalCase (e.g., `Header.tsx`)
- **Functions/Variables**: Use camelCase (e.g., `sayHello`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `API_VERSION`)
- **Types/Interfaces**: Use PascalCase (e.g., `WorkerRpc`, `UserData`)

### Comments and Documentation

- Write JSDoc comments for all exported functions and classes
- Add inline comments for complex logic
- Update README.md when adding new features
- Update package-specific READMEs when relevant

## Testing

### Writing Tests

- Place test files alongside source files with `.test.ts` or `.test.tsx` extension
- Use descriptive test names that explain what is being tested
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies appropriately

Example test structure:

```typescript
import { describe, it, expect } from 'vitest';

describe('WorkerRpc', () => {
	it('should return greeting with timestamp', async () => {
		// Arrange
		const name = 'World';

		// Act
		const result = await workerRpc.sayHello(name);

		// Assert
		expect(result.message).toBe('Hello, World!');
		expect(result.timestamp).toBeDefined();
	});
});
```

### Test Coverage

- Write tests for all new features
- Maintain or improve existing test coverage
- Test edge cases and error conditions
- Test RPC methods thoroughly

## Monorepo Guidelines

### Package Structure

This is a pnpm workspace monorepo with two packages:

- `packages/worker`: Cloudflare Worker (backend)
- `packages/web`: TanStack Start app (frontend)

### Adding Dependencies

Always specify the package when adding dependencies:

```bash
# Add to worker package
pnpm --filter @fullstack-monorepo-template/worker add package-name

# Add dev dependency to web package
pnpm --filter @fullstack-monorepo-template/web add -D package-name

# Add to root (for shared tooling like ESLint)
pnpm add -D package-name -w
```

### Cross-Package Dependencies

The web package imports types from the worker package:

```typescript
// packages/web/env.d.ts
import type { WorkerRpc } from '../worker/src/rpc';
```

When modifying the worker's RPC interface, ensure the web package's types are updated accordingly.

### Workspace Scripts

Use the root `package.json` scripts for common operations:

```bash
pnpm dev:worker      # Start worker dev server
pnpm dev:web         # Start web dev server
pnpm test            # Run all tests
pnpm lint            # Lint all packages
pnpm deploy          # Deploy all packages
```

## Pull Request Process

1. **Update your branch** with the latest main:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Ensure all checks pass**:

   ```bash
   pnpm lint
   pnpm test
   pnpm format:check
   ```

3. **Commit your changes** with clear, descriptive messages:

   ```bash
   git add .
   git commit -m "feat: add new RPC method for user data"
   ```

   Use conventional commit prefixes:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Test additions or changes
   - `chore:` Maintenance tasks

4. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** on GitHub with:
   - Clear title describing the change
   - Description explaining what changed and why
   - Reference any related issues
   - Screenshots/videos for UI changes

6. **Respond to feedback** promptly and make requested changes

7. **Wait for approval** from maintainers before merging

## Architecture Guidelines

### Worker RPC Pattern

When adding new RPC methods:

1. **Define the method in `packages/worker/src/rpc.ts`**:

   ```typescript
   export class WorkerRpc extends WorkerEntrypoint {
   	async myNewMethod(param: string): Promise<Result> {
   		// implementation
   	}
   }
   ```

2. **TypeScript types are automatically available** in the web package via `env.d.ts`

3. **Call from the web package** in server functions:

   ```typescript
   const { WORKER_RPC } = getServerContext().cloudflare.env;
   const result = await WORKER_RPC.myNewMethod('value');
   ```

4. **Add tests** for the new RPC method

5. **Update documentation** in the worker's README.md

### HTTP API Endpoints

When adding new HTTP endpoints to the worker:

1. **Add routes in `packages/worker/src/index.ts`**:

   ```typescript
   app.get('/api/v1/users', (c) => {
   	return c.json({ users: [] });
   });
   ```

2. **Follow RESTful conventions**:
   - `GET` for retrieving data
   - `POST` for creating resources
   - `PUT/PATCH` for updating resources
   - `DELETE` for removing resources

3. **Use appropriate HTTP status codes**

4. **Add CORS headers** if needed (already configured globally)

5. **Document the endpoint** in the worker's README.md

### Cloudflare Bindings

When adding KV, D1, R2, or other bindings:

1. **Update `wrangler.jsonc`** in the appropriate package
2. **Add TypeScript types** for the binding
3. **Update environment interfaces**
4. **Document the binding** in the README

### TanStack Start Patterns

For the web package:

- Use server functions for data fetching
- Use loaders for SSR data requirements
- Keep client-side JavaScript minimal
- Use the RPC binding for worker communication
- Follow TanStack Start conventions for routing

## Questions or Issues?

If you have questions or run into issues:

1. Check the [README.md](./README.md) for setup instructions
2. Check the [CLAUDE.md](./CLAUDE.md) for architecture details
3. Review existing code for examples
4. Open an issue on GitHub for discussion

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow
- Follow the project's guidelines

Thank you for contributing! 🎉
