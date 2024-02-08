import ts from "typescript";
import { TransformContext } from "../transformer";
import viewNode from "./viewNode";

export function viewFile(context: TransformContext, file: ts.SourceFile) {
	context.symbols.registerFileSymbol(file);

    function visitor(node: ts.Node) {
		viewNode(context, node);
		ts.forEachChild(node, visitor);
	}

	ts.forEachChild(file, visitor);
}