/**
 * Shared RPC utilities for accessing Worker RPC binding
 */
import { env } from 'cloudflare:workers'
import type { WorkerRpc } from '../../../worker/src/rpc'

/**
 * Get the typed WORKER_RPC binding
 * This helper centralizes the type assertion needed due to env typing limitations
 */
export const getWorkerRpc = (): WorkerRpc => {
  return env.WORKER_RPC as unknown as WorkerRpc
}
