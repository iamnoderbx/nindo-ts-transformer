import ts from "typescript";
import { MetaTag, MetatagTypes } from "../../modding/symbols";
import { TransformContext } from "../../transformer";

/**
 * Function to view a TypeScript import declaration.
 * @param {TransformContext} context - The transformation context, which includes symbols for the current file.
 * @param {ts.ImportDeclaration} node - The TypeScript import declaration node to check.
 * @author iAmNode
 */
export function viewImportDeclaration(context: TransformContext, node: ts.ImportDeclaration) {
    // Deprecated, no longer needed

    // const file = context.symbols.fileSymbols.get(node.getSourceFile().fileName);

    // const moduleSpecifier = node.moduleSpecifier;
    // if (!ts.isStringLiteral(moduleSpecifier)) return;

    // const name = node.importClause?.name?.text;
    // const directory = moduleSpecifier.text;
    
    // if(!name) return;

    // console.log(name + " : " + directory)

    // file?.addFileImport(name, directory)
};