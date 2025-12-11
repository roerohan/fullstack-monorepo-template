import React, { ReactNode } from 'react';

/**
 * Serializable representation of a React element (matches worker definition)
 */
export interface SerializableElement {
	type: string;
	props: Record<string, any>;
	children?: SerializableNode[];
}

export type SerializableNode = SerializableElement | string | number | boolean | null | undefined;

/**
 * Converts a serializable element back to a React element
 */
export function deserializeJSX(node: SerializableNode): ReactNode {
	// Handle primitives
	if (node === null || node === undefined || typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
		return node;
	}

	// Handle arrays
	if (Array.isArray(node)) {
		return node.map((child, index) => React.createElement(React.Fragment, { key: index }, deserializeJSX(child)));
	}

	// Handle serialized elements
	if (typeof node === 'object' && 'type' in node) {
		const element = node as SerializableElement;
		const children = element.children ? element.children.map((child) => deserializeJSX(child)) : [];

		return React.createElement(element.type as string, element.props, ...children);
	}

	return null;
}
