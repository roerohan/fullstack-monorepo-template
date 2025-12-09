import { createFileRoute, Link } from '@tanstack/react-router';
import { Zap, Server, Route as RouteIcon, Shield, Network, Package } from 'lucide-react';
import { sayHello } from './rpc/say-hello';

export const Route = createFileRoute('/')({
	component: App,
	loader: async (ctx) => {
		// Extract name from search params
		const name = (ctx.location.search as { name?: string })?.name;

		if (name) {
			// @ts-expect-error - createServerFn types don't properly infer data parameter
			return sayHello({ data: { name } });
		}

		return sayHello();
	}
});

function App() {
	const data = Route.useLoaderData();

	const features = [
		{
			icon: <Network className="w-12 h-12 text-cyan-400" />,
			title: 'Worker RPC Integration',
			description:
				'Type-safe RPC calls from TanStack Start to Cloudflare Workers via service bindings. Full end-to-end type safety.',
		},
		{
			icon: <Zap className="w-12 h-12 text-cyan-400" />,
			title: 'Powerful Server Functions',
			description:
				'Write server-side code that seamlessly integrates with your client components. Type-safe, secure, and simple.',
		},
		{
			icon: <Server className="w-12 h-12 text-cyan-400" />,
			title: 'Flexible Server Side Rendering',
			description:
				'Full-document SSR, streaming, and progressive enhancement out of the box. Control exactly what renders where.',
		},
		{
			icon: <RouteIcon className="w-12 h-12 text-cyan-400" />,
			title: 'HTTP API Routes',
			description: 'Access Cloudflare Worker HTTP endpoints at /api/* routes or use type-safe RPC calls.',
		},
		{
			icon: <Shield className="w-12 h-12 text-cyan-400" />,
			title: 'Strongly Typed Everything',
			description: 'End-to-end type safety from server to client. Catch errors before they reach production.',
		},
		{
			icon: <Package className="w-12 h-12 text-cyan-400" />,
			title: 'Monorepo Template',
			description:
				'Full-stack pnpm workspace with separate Worker and Web packages. Share types across the stack seamlessly.',
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			<section className="relative py-20 px-6 text-center overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
				<div className="relative max-w-5xl mx-auto">
					<div className="flex items-center justify-center gap-6 mb-6">
						<img src="/tanstack-circle-logo.png" alt="TanStack Logo" className="w-24 h-24 md:w-32 md:h-32" />
						<h1 className="text-6xl md:text-7xl font-black text-white [letter-spacing:-0.08em]">
							<span className="text-gray-300">TANSTACK</span>{' '}
							<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">START</span>
						</h1>
					</div>
					<a
						href="https://github.com/roerohan/fullstack-monorepo-template"
						target="_blank"
						rel="noopener noreferrer"
						className="text-2xl md:text-3xl text-gray-300 mb-4 font-light hover:text-cyan-400 transition-colors inline-block"
					>
						roerohan/fullstack-monorepo-template
					</a>
					<p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
						TanStack Start + Cloudflare Workers monorepo. Build modern fullstack applications with type-safe RPC,
						server functions, and edge deployment.
					</p>

					<div className="mb-8 p-4 bg-slate-800/70 border border-cyan-500/30 rounded-lg max-w-2xl mx-auto">
						<p className="text-sm text-gray-400 mb-2">Live RPC Demo:</p>
						<p className="text-lg text-cyan-400 font-mono">{JSON.stringify(data)}</p>
						<p className="text-xs text-gray-500 mt-2">
							Called <code className="text-cyan-400">WORKER_RPC.sayHello()</code> from server loader •{' '}
							<Link to="/rpc" className="text-cyan-400 hover:text-cyan-300 underline">
								View more RPC examples at /rpc
							</Link>
						</p>
					</div>

					<div className="flex flex-col items-center gap-4">
						<div className="flex gap-3 flex-wrap justify-center">
							<a
								href="https://tanstack.com/start"
								target="_blank"
								rel="noopener noreferrer"
								className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
							>
								TanStack Docs
							</a>
							<a
								href="https://developers.cloudflare.com/workers"
								target="_blank"
								rel="noopener noreferrer"
								className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-orange-500/50"
							>
								Cloudflare Workers
							</a>
						</div>
						<p className="text-gray-400 text-sm mt-2">
							Edit <code className="px-2 py-1 bg-slate-700 rounded text-cyan-400">/src/routes/index.tsx</code> or add
							RPC methods in{' '}
							<code className="px-2 py-1 bg-slate-700 rounded text-orange-400">packages/worker/src/rpc.ts</code>
						</p>
					</div>
				</div>
			</section>

			<section className="py-16 px-6 max-w-7xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, index) => (
						<div
							key={index}
							className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
						>
							<div className="mb-4">{feature.icon}</div>
							<h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
							<p className="text-gray-400 leading-relaxed">{feature.description}</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
