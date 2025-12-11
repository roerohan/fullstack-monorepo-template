import { WorkerEntrypoint } from 'cloudflare:workers';
import React from 'react';
import { serializeJSX, type SerializableNode } from './jsx-serializer';

/**
 * RPC Worker Entrypoint
 * This class enables RPC-style calls to the worker from service bindings.
 * Methods defined here can be called directly from other workers or systems
 * that have a service binding to this worker.
 */
export class WorkerRpc extends WorkerEntrypoint {
	/**
	 * Example RPC method - returns a greeting message
	 */
	async sayHello(name: string): Promise<{ message: string; timestamp: number }> {
		return {
			message: `Hello, ${name}!`,
			timestamp: Date.now(),
		};
	}

	/**
	 * Example RPC method - performs a calculation
	 */
	async calculate(operation: 'add' | 'subtract' | 'multiply' | 'divide', a: number, b: number): Promise<number> {
		switch (operation) {
			case 'add':
				return a + b;
			case 'subtract':
				return a - b;
			case 'multiply':
				return a * b;
			case 'divide':
				if (b === 0) throw new Error('Division by zero');
				return a / b;
			default:
				throw new Error(`Unknown operation: ${operation}`);
		}
	}

	/**
	 * Example RPC method - fetches data (could interact with bindings)
	 */
	async getData(key: string): Promise<{ key: string; found: boolean; value?: string }> {
		// Example: You could interact with KV, D1, R2, etc. here
		// For now, just return a mock response
		return {
			key,
			found: false,
			value: undefined,
		};
	}

	/**
	 * Example RPC method - processes batch operations
	 */
	async processBatch(items: string[]): Promise<{ processed: number; items: string[] }> {
		const processed = items.map((item) => item.toUpperCase());
		return {
			processed: items.length,
			items: processed,
		};
	}

	/**
	 * Returns JSX serialized to JSON
	 * This allows you to return JSX from the worker and render it on the client
	 * Write JSX here just like you would in a React Server Component!
	 */
	async getComponent(): Promise<SerializableNode> {
		// Worker-ONLY functionality that CANNOT run in the browser:

		// 1. Server-side fetch to external API (no CORS issues, browser never sees this request)
		let workerIp = 'Unable to fetch';

		try {
			// Fetch the worker's public IP (this happens on the server, not in the browser)
			const ipResponse = await fetch('https://api.ipify.org?format=json');
			const ipData = (await ipResponse.json()) as { ip: string };
			workerIp = ipData.ip;
		} catch (error) {
			console.error('Failed to fetch worker IP:', error);
		}

		// 2. Access environment variables (only available in worker, not browser)
		// Note: You can set these in wrangler.jsonc under "vars"
		const envEntries: Array<{ key: string; value: string }> = [];
		for (const key of Object.keys(this.env)) {
			// Filter out internal bindings
			if (!key.startsWith('ASSETS') && !key.includes('__')) {
				const value = this.env[key];
				// Only show string values for safety
				if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
					envEntries.push({ key, value: String(value) });
				}
			}
		}
		const hasEnvVars = envEntries.length > 0;

		// 3. Worker execution metadata
		const timestamp = Date.now();
		const date = new Date(timestamp);

		// Define your JSX here - it includes worker-ONLY data fetched server-side
		const component = (
			<div
				style={{
					padding: '24px',
					border: '2px solid #f97316',
					borderRadius: '12px',
					background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
					color: '#fff',
				}}
			>
				<h2
					style={{
						color: '#fb923c',
						marginBottom: '16px',
						fontSize: '24px',
						fontWeight: 'bold',
					}}
				>
					🔥 Generated in Cloudflare Worker (Server-Side Only!)
				</h2>
				<p style={{ marginBottom: '12px', color: '#e2e8f0' }}>
					This JSX was created in the Worker with data fetched server-side. The browser never made these requests!
				</p>

				{/* Server-side API calls section */}
				<div
					style={{
						background: '#0f172a',
						padding: '16px',
						borderRadius: '8px',
						marginTop: '16px',
						marginBottom: '16px',
					}}
				>
					<strong style={{ color: '#fb923c', display: 'block', marginBottom: '8px' }}>
						🌐 Worker's Public IP Address
					</strong>
					<p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '6px' }}>
						Fetched from api.ipify.org (server-side, no CORS!)
					</p>
					<div
						style={{
							color: '#fff',
							fontFamily: 'monospace',
							fontSize: '16px',
							background: '#1e293b',
							padding: '8px 12px',
							borderRadius: '4px',
							border: '1px solid #fb923c',
						}}
					>
						{workerIp}
					</div>
				</div>

				{/* Environment variables section */}
				<div
					style={{
						background: '#0f172a',
						padding: '16px',
						borderRadius: '8px',
						marginBottom: '16px',
					}}
				>
					<strong style={{ color: '#fb923c', display: 'block', marginBottom: '8px' }}>
						🔐 Environment Variables Access
					</strong>
					{hasEnvVars ? (
						<div>
							<p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
								Found {envEntries.length} environment variable(s):
							</p>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
								{envEntries.map((entry, i) => (
									<div
										key={i}
										style={{
											background: '#1e293b',
											padding: '10px',
											borderRadius: '4px',
											border: '1px solid #fb923c',
										}}
									>
										<div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#fb923c', marginBottom: '4px' }}>
											{entry.key}
										</div>
										<div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#e2e8f0' }}>{entry.value}</div>
									</div>
								))}
							</div>
						</div>
					) : (
						<p style={{ color: '#94a3b8', fontSize: '14px' }}>
							No environment variables configured. Add them in wrangler.jsonc under "vars"!
						</p>
					)}
				</div>

				{/* Metadata section */}
				<div
					style={{
						background: '#0f172a',
						padding: '16px',
						borderRadius: '8px',
						marginBottom: '16px',
					}}
				>
					<strong style={{ color: '#fb923c', display: 'block', marginBottom: '8px' }}>⏰ Server-Side Timestamp</strong>
					<div
						style={{
							color: '#94a3b8',
							fontFamily: 'monospace',
							fontSize: '14px',
						}}
					>
						{date.toISOString()}
					</div>
				</div>

				<ul
					style={{
						marginTop: '16px',
						paddingLeft: '20px',
						color: '#cbd5e1',
						fontSize: '14px',
					}}
				>
					<li style={{ marginBottom: '8px' }}>✅ Server-side fetch() calls (no CORS!)</li>
					<li style={{ marginBottom: '8px' }}>✅ Access to environment variables</li>
					<li style={{ marginBottom: '8px' }}>✅ Worker execution context</li>
					<li style={{ marginBottom: '8px' }}>✅ JSX serialization & deserialization</li>
				</ul>

				<p
					style={{
						marginTop: '16px',
						fontSize: '12px',
						color: '#64748b',
						fontStyle: 'italic',
						background: '#1e293b',
						padding: '8px',
						borderRadius: '4px',
					}}
				>
					💡 Refresh the page to see new data! The browser never makes the external API call to ipify.org.
				</p>
			</div>
		);

		// Serialize the React element to a JSON-serializable format
		return serializeJSX(component);
	}
}

// Export the RPC worker as the default export
export default WorkerRpc;
