"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMassDeclarations = exports.MassImportDeclarationAndImports = exports.AddExpressionStatementToNode = void 0;
function AddMassDeclarations(context, node, results) {
    const factory = context.factory;
    // Create an array of expression statements for each result
    const expressions = results.map(result => {
        console.log(result);
        const expression = factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("Framework"), factory.createIdentifier("addInitalization") // Updated method name
        ), undefined, [factory.createIdentifier(result.name)]);
        return factory.createExpressionStatement(expression);
    });
    return [
        node,
        ...expressions,
    ];
}
exports.AddMassDeclarations = AddMassDeclarations;
function MassImportDeclarationAndImports(context, node, results) {
    const factory = context.factory;
    // Collect import declarations for each result
    const importDeclarations = [];
    results.forEach((result) => {
        const importSpecifier = factory.createImportDeclaration(undefined, factory.createImportClause(false, factory.createIdentifier(result.name), undefined), factory.createStringLiteral(result.directory));
        importDeclarations.push(importSpecifier);
    });
    // Return the modified node with the import declarations
    return [
        ...importDeclarations,
        node, // Add the original node after the import declarations
    ];
}
exports.MassImportDeclarationAndImports = MassImportDeclarationAndImports;
function AddExpressionStatementToNode(context, node, object, func, argument) {
    if (!node.name)
        return;
    const addToStartRegistryCall = context.factory.createExpressionStatement(context.factory.createCallExpression(context.factory.createPropertyAccessExpression(context.factory.createIdentifier(object), context.factory.createIdentifier(func)), undefined, [context.factory.createIdentifier(argument)] // node.name.getText()
    ));
    return [
        context.transform(node),
        addToStartRegistryCall
    ];
}
exports.AddExpressionStatementToNode = AddExpressionStatementToNode;
