import ts from "typescript";

/**
 * @file getNodeList.ts
 * @author iAmNode
 */

/**
 * Function to ensure a given input is an array of TypeScript nodes.
 * If the input is a single node, it wraps the node in an array.
 * If the input is already an array of nodes, it returns the array as is.
 * @param {T | T[]} statements - The input which is either a single node or an array of nodes.
 * @returns {T[]} An array of TypeScript nodes.
 */
export function getNodeList<T extends ts.Node>(statements: T | T[]): T[] {
	return Array.isArray(statements) ? statements : [statements];
}