import ts from "typescript";
import { TransformContext } from "../transformer";
import { transformNode } from "./transformNode";
import { catchDiagnostic } from "../utils/diagnostics";

/**
 * @file transformExpression.ts
 * @author iAmNode
 */

// Define a map of transformers for different syntax kinds
const TRANSFORMERS = new Map<ts.SyntaxKind, (context: TransformContext, node: any) => ts.Expression>([
	// Uncomment the line below to add a transformer for class declarations
	//[ts.SyntaxKind.ClassDeclaration, transformClassDeclaration],
]);

// Define a function to transform an expression
export function transformExpression(context: TransformContext, expression: ts.Expression): ts.Expression {
	// Catch any diagnostics that occur during transformation
	return catchDiagnostic(expression, () => {
		// Get the transformer for the syntax kind of the expression
		const transformer = TRANSFORMERS.get(expression.kind);
		// If a transformer exists, use it to transform the expression
		if (transformer) {
			return transformer(context, expression);
		}
		// If no transformer exists, visit each child of the expression and transform it
		return ts.visitEachChild(expression, (newNode) => transformNode(context, newNode), context.context);
	});
}