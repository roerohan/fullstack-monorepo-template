import type { ReactElement, ReactNode } from 'react';

/**
 * Serializable representation of a React element
 */
export interface SerializableElement {
	type: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	props: Record<string, any>;
	children?: SerializableNode[];
}

export type SerializableNode = SerializableElement | string | number | boolean | null | undefined;

/**
 * Converts a React element to a serializable format
 */
export function serializeJSX(node: ReactNode): SerializableNode {
	// Handle primitives
	if (
		node === null ||
		node === undefined ||
		typeof node === 'string' ||
		typeof node === 'number' ||
		typeof node === 'boolean'
	) {
		return node;
	}

	// Handle arrays - flatten them (React handles this the same way)
	if (Array.isArray(node)) {
		// For arrays, we serialize each child and return the first element if single, or null
		// In practice, React fragments are rendered as arrays, so we handle the children individually
		const serialized = node
			.map(serializeJSX)
			.filter((child): child is NonNullable<SerializableNode> => child !== null && child !== undefined);
		// If there's only one element, return it directly
		if (serialized.length === 1) {
			return serialized[0];
		}
		// For multiple children, wrap in a fragment-like div
		if (serialized.length > 1) {
			return {
				type: 'div',
				props: {},
				children: serialized,
			};
		}
		return null;
	}

	// Handle React elements
	if (typeof node === 'object' && 'type' in node && 'props' in node) {
		const element = node as ReactElement;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { children, ...restProps } = element.props as { children?: ReactNode; [key: string]: any };

		const serialized: SerializableElement = {
			type: typeof element.type === 'string' ? element.type : 'div', // Only support HTML elements for now
			props: restProps || {},
		};

		// Serialize children
		if (children !== undefined && children !== null) {
			const childArray = Array.isArray(children) ? children : [children];
			const serializedChildren = childArray
				.map(serializeJSX)
				.filter((child): child is NonNullable<SerializableNode> => child !== null && child !== undefined);

			if (serializedChildren.length > 0) {
				serialized.children = serializedChildren;
			}
		}

		return serialized;
	}

	// Fallback
	return null;
}
