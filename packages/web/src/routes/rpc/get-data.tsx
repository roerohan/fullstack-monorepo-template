import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getWorkerRpc } from '@/lib/rpc';

interface GetDataInput {
	key: string;
}

const getData = createServerFn({ method: 'GET' }).handler(async (ctx: { data?: GetDataInput }) => {
	const workerRpc = getWorkerRpc();

	// Get the key from the context data
	const data = ctx.data as GetDataInput | undefined;
	const key = data?.key;

	if (!key) {
		throw new Error('Missing required parameter: key');
	}

	// Call the RPC method from the worker
	return workerRpc.getData(key);
});

export const Route = createFileRoute('/rpc/get-data')({
	loader: async (ctx) => {
		// Extract key from search params
		const search = ctx.location.search as { key?: string };
		const key = search.key || 'myKey';

		// Call the server function with the key
		// @ts-expect-error - createServerFn types don't properly infer data parameter
		return getData({ data: { key } });
	},
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
					<h1 className="text-4xl font-bold text-white mb-4">Get Data RPC Method</h1>
					<p className="text-gray-400 mb-6">Fetches data by key (mock implementation ready for KV, D1, R2, etc.)</p>

					<div className="bg-slate-900/50 rounded-lg p-6 mb-6">
						<h2 className="text-xl font-semibold text-cyan-400 mb-3">Result</h2>
						<pre className="text-gray-300 font-mono overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
					</div>

					<div className="bg-slate-900/50 rounded-lg p-6 mb-6">
						<h2 className="text-xl font-semibold text-cyan-400 mb-3">Usage Examples</h2>
						<div className="space-y-2">
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">?key=user123</code> → Fetch data for key
								"user123"
							</p>
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">?key=config</code> → Fetch data for key
								"config"
							</p>
							<p className="text-gray-400 text-sm mt-4">
								💡 This is a mock implementation. Connect to Cloudflare KV, D1, or R2 by adding bindings to{' '}
								<code className="text-orange-400">wrangler.jsonc</code>
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
