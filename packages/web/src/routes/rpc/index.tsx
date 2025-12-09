import { createFileRoute, Link } from '@tanstack/react-router';
import { Network, Calculator, Database, Package2, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/rpc/')({
	component: RouteComponent,
});

function RouteComponent() {
	const rpcMethods = [
		{
			name: 'sayHello',
			path: '/rpc/say-hello',
			icon: <Network className="w-8 h-8 text-cyan-400" />,
			description: 'Returns a greeting message with timestamp',
			signature: 'sayHello(name: string): Promise<{ message: string; timestamp: number }>',
			example: '/rpc/say-hello?name=World',
		},
		{
			name: 'calculate',
			path: '/rpc/calculate',
			icon: <Calculator className="w-8 h-8 text-green-400" />,
			description: 'Performs arithmetic operations (add, subtract, multiply, divide)',
			signature: 'calculate(operation: string, a: number, b: number): Promise<number>',
			example: '/rpc/calculate?operation=add&a=10&b=20',
		},
		{
			name: 'getData',
			path: '/rpc/get-data',
			icon: <Database className="w-8 h-8 text-blue-400" />,
			description: 'Fetches data by key (mock implementation, can be connected to KV, D1, R2, etc.)',
			signature: 'getData(key: string): Promise<{ key: string; found: boolean; value?: string }>',
			example: '/rpc/get-data?key=myKey',
		},
		{
			name: 'processBatch',
			path: '/rpc/process-batch',
			icon: <Package2 className="w-8 h-8 text-purple-400" />,
			description: 'Processes batch operations on array of items',
			signature: 'processBatch(items: string[]): Promise<{ processed: number; items: string[] }>',
			example: '/rpc/process-batch',
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			<div className="max-w-6xl mx-auto p-8">
				<div className="mb-12">
					<h1 className="text-5xl font-black text-white mb-4">
						<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
							Worker RPC Methods
						</span>
					</h1>
					<p className="text-xl text-gray-400 mb-4">
						Type-safe RPC calls from TanStack Start to Cloudflare Workers via service bindings
					</p>
					<p className="text-gray-500">
						All methods are defined in{' '}
						<code className="px-2 py-1 bg-slate-700 rounded text-orange-400">packages/worker/src/rpc.ts</code>
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6">
					{rpcMethods.map((method) => (
						<Link
							key={method.name}
							to={method.path}
							className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group"
						>
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">{method.icon}</div>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<h2 className="text-2xl font-bold text-white">{method.name}</h2>
										<ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors group-hover:translate-x-1 transition-transform" />
									</div>
									<p className="text-gray-400 mb-3">{method.description}</p>
									<div className="bg-slate-900/50 rounded-lg p-3 mb-3">
										<code className="text-sm text-gray-300 font-mono break-all">{method.signature}</code>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-xs text-gray-500">Try it:</span>
										<code className="text-xs text-cyan-400 bg-slate-900/50 px-2 py-1 rounded">{method.example}</code>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>

				<div className="mt-12 p-6 bg-slate-800/30 border border-slate-700 rounded-xl">
					<h3 className="text-xl font-bold text-white mb-3">Adding New RPC Methods</h3>
					<ol className="list-decimal list-inside space-y-2 text-gray-400">
						<li>
							Add your method to the <code className="text-orange-400">WorkerRpc</code> class in{' '}
							<code className="text-orange-400">packages/worker/src/rpc.ts</code>
						</li>
						<li>
							TypeScript will automatically provide types in the web package via{' '}
							<code className="text-cyan-400">packages/web/env.d.ts</code>
						</li>
						<li>
							Create a route in <code className="text-cyan-400">packages/web/src/routes/rpc/</code> to call your
							method
						</li>
						<li>
							Use <code className="text-cyan-400">getWorkerRpc()</code> helper to access the typed RPC binding
						</li>
					</ol>
				</div>

				<div className="mt-8 text-center">
					<Link
						to="/"
						className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
					>
						← Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}
