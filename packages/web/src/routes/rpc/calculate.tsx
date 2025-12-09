import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getWorkerRpc } from '@/lib/rpc';

interface CalculateData {
	operation: 'add' | 'subtract' | 'multiply' | 'divide';
	a: number;
	b: number;
}

const calculate = createServerFn({ method: 'GET' }).handler(async (ctx: { data?: CalculateData }) => {
	const workerRpc = getWorkerRpc();

	// Get the calculation data from the context
	const data = ctx.data as CalculateData | undefined;

	if (!data) {
		throw new Error('Missing calculation parameters');
	}

	// Call the RPC method from the worker
	return workerRpc.calculate(data.operation, data.a, data.b);
});

export const Route = createFileRoute('/rpc/calculate')({
	loader: async (ctx) => {
		// Extract parameters from search params
		const search = ctx.location.search as { operation?: string; a?: string; b?: string };
		const operation = (search.operation || 'add') as 'add' | 'subtract' | 'multiply' | 'divide';
		const a = search.a ? parseFloat(search.a) : 10;
		const b = search.b ? parseFloat(search.b) : 20;

		// Call the server function with the parameters
		// @ts-expect-error - createServerFn types don't properly infer data parameter
		return calculate({ data: { operation, a, b } });
	},
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
					<h1 className="text-4xl font-bold text-white mb-4">Calculate RPC Method</h1>
					<p className="text-gray-400 mb-6">Performs arithmetic operations on two numbers</p>

					<div className="bg-slate-900/50 rounded-lg p-6 mb-6">
						<h2 className="text-xl font-semibold text-cyan-400 mb-3">Result</h2>
						<p className="text-3xl text-white font-mono">{data}</p>
					</div>

					<div className="bg-slate-900/50 rounded-lg p-6 mb-6">
						<h2 className="text-xl font-semibold text-cyan-400 mb-3">Usage Examples</h2>
						<div className="space-y-2">
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">?operation=add&a=10&b=20</code> → Addition
							</p>
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">?operation=subtract&a=50&b=15</code> → Subtraction
							</p>
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">?operation=multiply&a=7&b=8</code> → Multiplication
							</p>
							<p className="text-gray-300">
								<code className="text-cyan-400 bg-slate-800 px-2 py-1 rounded">?operation=divide&a=100&b=5</code> → Division
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
