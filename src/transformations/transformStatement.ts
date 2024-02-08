import ts from "typescript";
import { TransformContext } from "../transformer";
import { getNodeList } from "../modding/getNodeList";
import { transformNode } from "./transformNode";
import { catchDiagnostic } from "../utils/diagnostics";
import { transformClassDeclaration } from "./statements/transformClassDecloration";

/**
 * @file transformStatement.ts
 * @author iAmNode
 */

// Define a map of transformers for different syntax kinds
const TRANSFORMERS = new Map<ts.SyntaxKind, (context: TransformContext, node: any) => ts.Statement | ts.Statement[]>([
	// Add a transformer for class declarations
	[ts.SyntaxKind.ClassDeclaration, transformClassDeclaration],
]);

// Define a function to transform a statement
export function transformStatement(context: TransformContext, statement: ts.Statement): ts.Statement | ts.Statement[] {
	// Catch any diagnostics that occur during transformation
	return catchDiagnostic<ts.Statement | ts.Statement[]>(statement, () => {
		// Capture the transformation of the statement and any prerequisites
		const [node, prereqs] = context.capture(() => {
			// Get the transformer for the syntax kind of the statement
			const transformer = TRANSFORMERS.get(statement.kind);
			// If a transformer exists, use it to transform the statement
			if (transformer) {
				return transformer(context, statement);
			}

			// If no transformer exists, visit each child of the statement and transform it
			return ts.visitEachChild(statement, (newNode) => transformNode(context, newNode), context.context);
		});

		// Return the transformed statement and any prerequisites
		return [...prereqs, ...getNodeList(node)];
	});
}