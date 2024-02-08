"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function StartTransformation(context, node) {
    if (!node.name)
        return node;
    const importFramework = context.factory.createImportDeclaration(undefined, context.factory.createImportClause(false, context.factory.createIdentifier('Framework'), undefined), context.factory.createStringLiteral('server/framework/core'));
    const addToStartRegistryCall = context.factory.createExpressionStatement(context.factory.createCallExpression(context.factory.createPropertyAccessExpression(context.factory.createIdentifier('Framework'), context.factory.createIdentifier('AddToStartRegistry')), undefined, [context.factory.createIdentifier(node.name.getText())]));
    return [
        importFramework,
        context.transform(node),
        addToStartRegistryCall
    ];
}
exports.default = StartTransformation;
