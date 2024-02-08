import ts from "typescript";
import { TransformContext } from "../transformer";
import { transformStatement } from "./transformStatement";

/**
 * @file transformNode.ts
 * @author iAmNode
 */

// Define a function to transform a node
export function transformNode(context: TransformContext, node: ts.Node): ts.Node | ts.Statement[] {
	try {
		// If the node is a statement, transform it
		if (ts.isStatement(node)) {
			return transformStatement(context, node);
		}
	} catch (e) {
		// If an error occurs during transformation, throw the error
		throw e;
	}

	// If the node is not a statement, visit each child of the node and transform it
	return ts.visitEachChild(node, (newNode) => transformNode(context, newNode), context.context);
}