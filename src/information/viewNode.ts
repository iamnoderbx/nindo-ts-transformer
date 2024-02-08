import ts from "typescript";
import { TransformContext } from "../transformer";
import viewStatement from "./viewStatement";
import viewExpression from "./viewExpression";

/**
 * Function to view a TypeScript node and call the appropriate function based on its type.
 * @param {TransformContext} context - The transformation context, which includes symbols for the current file.
 * @param {ts.Node} node - The TypeScript node to check.
 * @author iAmNode
 */
export default function viewNode(context: TransformContext, node: ts.Node) {
	// If the node is an expression, call the viewExpression function
	if (ts.isExpression(node)) {
		viewExpression(context, node);
	} 
	// If the node is a statement, call the viewStatement function
	else if (ts.isStatement(node)) {
		viewStatement(context, node);
	}
}