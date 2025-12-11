import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getWorkerRpc } from '@/lib/rpc';

interface SayHelloData {
	name: string;
}

export const sayHello = createServerFn({ method: 'GET' }).handler(async (ctx: { data?: SayHelloData }) => {
	const workerRpc = getWorkerRpc();

	// Get the name from the context data
	const data = ctx.data as SayHelloData | undefined;
	const name = data?.name || 'World';

	// Call the RPC method from the worker
	return workerRpc.sayHello(name);
});

export const Route = createFileRoute('/rpc/say-hello')({
	loader: async (ctx) => {
		// Extract name from search params using ctx.location.search
		const name = (ctx.location.search as { name?: string })?.name || 'World';

		// Call the server function with the name
		// @ts-expect-error - createServerFn types don't properly infer data parameter
		return sayHello({ data: { name } });
	},
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
					<h1 className="text-4xl font-bold text-white mb-4">Say Hello RPC Method</h1>
					<p className="text-gray-400 mb-6">Returns a greeting message with timestamp</p>

					<div className="bg-slate-900/50 rounded-lg p-6 mb-6">
						<h2 className="text-xl font-semibold text-cyan-400 mb-3">Result</h2>
						<pre className="text-gray-300 font-mono overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
					</div>

					<div className="bg-slate-900/50 rounded-lg p-6 mb-6">
						<h2 className="text-xl font-semibold text-cyan-400 mb-3">Usage Examples</h2>
						<div className="space-y-2">
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">?name=Alice</code> → Say hello to Alice
							</p>
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">?name=Bob</code> → Say hello to Bob
							</p>
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">(no parameter)</code> → Defaults to
								"World"
							</p>
						</div>
					</div>

					<a
						href="/rpc"
						className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
					>
						← Back to RPC Methods
					</a>
				</div>
			</div>
		</div>
	);
}
