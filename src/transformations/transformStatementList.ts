import ts from "typescript";
import { TransformContext } from "../transformer";
import { getNodeList } from "../modding/getNodeList";
import { transformStatement } from "./transformStatement";

/**
 * @file transformStatementList.ts
 * @author iAmNode
 */

// Define a function to transform a list of statements
export function transformStatementList(context: TransformContext, statements: ReadonlyArray<ts.Statement>) {
	// Initialize an array to hold the transformed statements
	const result = new Array<ts.Statement>();

	// Iterate over the statements
	for (const statement of statements) {
		// Capture the transformation of the statement and any prerequisites
		const [newStatements, prereqs] = context.capture(() => transformStatement(context, statement));

		// Add the prerequisites to the result
		result.push(...prereqs);
		// Add the transformed statement to the result
		result.push(...getNodeList(newStatements));
	}

	// Return the transformed statements
	return result;
}