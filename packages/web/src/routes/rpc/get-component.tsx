import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getWorkerRpc } from '@/lib/rpc';
import { deserializeJSX, type SerializableNode } from '@/lib/jsx-deserializer';

export const getComponent = createServerFn({ method: 'GET' }).handler(async () => {
	const workerRpc = getWorkerRpc();

	// Get the serialized JSX payload from the worker
	const serializedPayload = await workerRpc.getComponent();

	// Return it to the client
	return serializedPayload;
});

export const Route = createFileRoute('/rpc/get-component')({
	loader: async () => getComponent(),
	component: RouteComponent,
});

function RouteComponent() {
	const serializedPayload = Route.useLoaderData() as SerializableNode;

	// Deserialize the JSX - reconstructs the React element from the serialized format
	const component = deserializeJSX(serializedPayload);

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
					<h1 className="text-4xl font-bold text-white mb-4">Get Component RPC Method</h1>
					<p className="text-gray-400 mb-6">
						Returns JSX from the Worker with server-side fetched data (like React Server Components)
					</p>

					<div className="bg-slate-900/50 rounded-lg p-6 mb-6">
						<h2 className="text-xl font-semibold text-cyan-400 mb-3">Rendered Component</h2>
						<div className="text-gray-300">{component}</div>
					</div>

					<div className="bg-slate-900/50 rounded-lg p-6 mb-6">
						<h2 className="text-xl font-semibold text-cyan-400 mb-3">How It Works</h2>
						<div className="space-y-3 text-gray-300">
							<p>
								✨ The component above was returned as <strong className="text-white">pure JSX</strong> from the
								Cloudflare Worker with <strong className="text-white">server-side data</strong>!
							</p>
							<p>
								The worker fetches data from external APIs (ipify.org){' '}
								<strong className="text-white">server-side</strong> and reads environment variables — the browser never
								makes these requests! This demonstrates true worker-only functionality that cannot happen in the client.
							</p>
							<div className="mt-4 space-y-2">
								<p className="font-semibold text-white">Worker-Only Features Demonstrated:</p>
								<ul className="list-disc list-inside space-y-1 pl-4">
									<li>Server-side fetch() calls without CORS restrictions</li>
									<li>Access to environment variables (worker context only)</li>
									<li>Worker execution context and metadata</li>
									<li>JSX serialization & deserialization</li>
								</ul>
							</div>
							<div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded">
								<p className="text-sm text-orange-200">
									<strong>🔥 Pro Tip:</strong> Open your browser's Network tab and refresh. You won't see any requests
									to ipify.org — it happens entirely in the worker!
								</p>
							</div>
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
