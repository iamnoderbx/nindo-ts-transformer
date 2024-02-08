import ts from "typescript";
import { TransformContext } from "../../transformer";
import { MetaTag, MetatagTypes } from "../../modding/symbols";

/**
 * Function to view a TypeScript class declaration and add a meta tag if it implements the 'Start' interface.
 * @param {TransformContext} context - The transformation context, which includes symbols for the current file.
 * @param {ts.ClassDeclaration} node - The TypeScript class declaration node to check.
 * @author iAmNode
 */
export function viewClassDeclaration(context: TransformContext, node: ts.ClassDeclaration) {
    const implementsStartInterface = node.heritageClauses?.some((clause) =>
        clause.types.some((type) => type.expression.getText() === "Start")
    );

    if (implementsStartInterface) {
        const fileSymbol = context.symbols.fileSymbols.get(node.getSourceFile().fileName)
        if(!fileSymbol || !node.name) return;

        const classSymbol = fileSymbol.classes.get(node.name.text)
        classSymbol?.addMetaTag(new MetaTag(MetatagTypes.START, true))
    };
};