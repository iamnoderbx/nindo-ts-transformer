"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddImportDeclarationToNode = void 0;
function AddImportDeclarationToNode(context, node, declaration) {
    if (!node.name)
        return node;
    const importFramework = context.factory.createImportDeclaration(undefined, context.factory.createImportClause(false, context.factory.createIdentifier(declaration.name), undefined), context.factory.createStringLiteral(declaration.directory));
    return [
        importFramework,
        context.transform(node),
    ];
}
exports.AddImportDeclarationToNode = AddImportDeclarationToNode;
