import ts, { getSourceFileOfNode } from "typescript";
import {} from "ts-expose-internals";
import { SymbolProvider } from "./modding/symbols";
import { transformNode } from "./transformations/transformNode";

/**
 * @file transformer.ts
 * @author iAmNode
 */


/**
 * This is the transformer's configuration, the values are passed from the tsconfig.
 */
export interface TransformerConfig {
	
}

/**
 * This is a utility object to pass around your dependencies.
 *
 * You can also use this object to store state, e.g prereqs.
 */
export class TransformContext {
	public factory: ts.NodeFactory;
	symbols: SymbolProvider;

	constructor(
		public program: ts.Program,
		public context: ts.TransformationContext,
		public config: TransformerConfig,
	) {
		this.factory = context.factory;
		this.symbols = new SymbolProvider()
	}

	private prereqStack = new Array<Array<ts.Statement>>();
	
	capture<T>(cb: () => T): [T, ts.Statement[]] {
		this.prereqStack.push([]);
		const result = cb();
		return [result, this.prereqStack.pop()!];
	}

	transformNode<T extends ts.Node>(node: T): T {
		return ts.visitNode(node, (newNode) => transformNode(this, newNode));
	}


	/**
	 * Transforms the children of the specified node.
	 */
	transform<T extends ts.Node>(node: T): T {
		return ts.visitEachChild(node, (node) => visitNode(this, node), this.context);
	}

	addStartImplementation(node: ts.ClassDeclaration) {
        throw new Error("Method not implemented.");
    }
}

function visitNode(context: TransformContext, node: ts.Node): ts.Node | ts.Node[] {
	if (ts.isClassDeclaration(node)) {
		//return visitClassDeclaration(context, node)
	}

	// We encountered a node that we don't handle above,
	// but we should keep iterating the AST in case we find something we want to transform.
	return context.transform(node);
}

