import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getWorkerRpc } from '@/lib/rpc';

interface ProcessBatchInput {
	items: string[];
}

const processBatch = createServerFn({ method: 'POST' }).handler(async (ctx: { data?: ProcessBatchInput }) => {
	const workerRpc = getWorkerRpc();

	// Get the items from the context data
	const data = ctx.data as ProcessBatchInput | undefined;
	const items = data?.items;

	if (!items || !Array.isArray(items)) {
		throw new Error('Missing required parameter: items (must be an array)');
	}

	// Call the RPC method from the worker
	return workerRpc.processBatch(items);
});

export const Route = createFileRoute('/rpc/process-batch')({
	loader: async (ctx) => {
		// Extract items from search params (comma-separated)
		const search = ctx.location.search as { items?: string };
		const itemsStr = search.items || 'apple,banana,cherry';

		// Split comma-separated string into array
		const items = itemsStr.split(',').map((item) => item.trim());

		// Call the server function with the items
		// @ts-expect-error - createServerFn types don't properly infer data parameter
		return processBatch({ data: { items } });
	},
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
					<h1 className="text-4xl font-bold text-white mb-4">Process Batch RPC Method</h1>
					<p className="text-gray-400 mb-6">Processes batch operations on array of items</p>

					<div className="bg-slate-900/50 rounded-lg p-6 mb-6">
						<h2 className="text-xl font-semibold text-cyan-400 mb-3">Result</h2>
						<pre className="text-gray-300 font-mono overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
					</div>

					<div className="bg-slate-900/50 rounded-lg p-6 mb-6">
						<h2 className="text-xl font-semibold text-cyan-400 mb-3">Usage Examples</h2>
						<div className="space-y-2">
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">?items=apple,banana,cherry</code> → Process 3 fruits
							</p>
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">?items=hello,world,test</code> → Process 3 words
							</p>
							<p className="text-gray-400 text-sm mt-4">
								💡 Pass comma-separated values in the <code className="text-cyan-400">items</code> parameter. The current implementation converts them to uppercase.
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
