import ts from "typescript";
import { TransformContext } from "../transformer";
import { viewClassDeclaration } from "./statements/viewClassDecloration";
import { viewImportDeclaration } from "./statements/viewImportDeclaration";

/**
 * A map of TypeScript syntax kinds to their respective viewer functions.
 * @type {Map<ts.SyntaxKind, (context: TransformContext, node: any) => void>}
 * @author iAmNode
 */
const VIEWERS = new Map<ts.SyntaxKind, (context: TransformContext, node: any) => void>([
	[ts.SyntaxKind.ClassDeclaration, viewClassDeclaration],
	[ts.SyntaxKind.ImportDeclaration, viewImportDeclaration]
]);

/**
 * Function to view a TypeScript statement and call the appropriate function based on its type.
 * @param {TransformContext} context - The transformation context, which includes symbols for the current file.
 * @param {ts.Statement} expression - The TypeScript statement to check.
 * @author iAmNode
 */
export default function viewStatement(context: TransformContext, expression: ts.Statement) {
	const viewer = VIEWERS.get(expression.kind);
	
	if (viewer) {
		viewer(context, expression);
	}
}