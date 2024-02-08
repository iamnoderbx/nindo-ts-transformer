"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformClassDeclaration = void 0;
const typescript_1 = __importDefault(require("typescript"));
const factory_1 = require("../../modding/factory");
const path_1 = __importDefault(require("path"));
function transformClassDeclaration(context, node) {
    var _a, _b, _c, _d, _e;
    const file = context.symbols.fileSymbols.get(node.getSourceFile().fileName);
    if (!file || !node.name)
        return node;
    const classSymbol = file.classes.get((_a = node.name) === null || _a === void 0 ? void 0 : _a.text);
    if (!classSymbol)
        return node;
    typescript_1.default.addSyntheticLeadingComment(node, typescript_1.default.SyntaxKind.SingleLineCommentTrivia, "Class Decloration Compiled", true);
    if (!((_b = classSymbol.node.name) === null || _b === void 0 ? void 0 : _b.getText()))
        return [updateClass(context, node)];
    let metatags = [];
    const realFields = [];
    const constructor = node.members.find(typescript_1.default.isConstructorDeclaration);
    const implementKeywords = [
        { type: "Start", metatag: "start" },
        { type: "Initalize", metatag: "initalize" },
        { type: "Tick", metatag: "ticked" },
        { type: "Thread", metatag: "thread" },
    ];
    implementKeywords
        .filter(keyword => {
        var _a;
        return (_a = node.heritageClauses) === null || _a === void 0 ? void 0 : _a.some(clause => clause.token === typescript_1.default.SyntaxKind.ImplementsKeyword &&
            clause.types.some(type => type.getText() === keyword.type));
    })
        .flatMap(keyword => metatags.push(typescript_1.default.factory.createPropertyAssignment(keyword.metatag, typescript_1.default.factory.createTrue())));
    if (metatags.length > 0) {
        metatags.push(typescript_1.default.factory.createPropertyAssignment("singleton", typescript_1.default.factory.createTrue()));
        metatags.push(typescript_1.default.factory.createPropertyAssignment("container", typescript_1.default.factory.createIdentifier("script")));
        metatags.push(typescript_1.default.factory.createPropertyAssignment("directory", typescript_1.default.factory.createIdentifier((_c = node.name) === null || _c === void 0 ? void 0 : _c.getText())));
        //node.name?.getText()
    }
    if (constructor && (metatags.length > 0)) {
        const sourceFile = node.getSourceFile();
        const directories = getClassImports(sourceFile);
        const dependencies = [];
        constructor.parameters.map((parameter) => {
            const type = parameter.type ? parameter.type.getText() : "any";
            const parameterType = parameter.type;
            if (!parameterType || !typescript_1.default.isTypeReferenceNode(parameterType))
                return undefined;
            const directory = directories[type];
            dependencies.push(directory + "/" + type);
        });
        if (dependencies.length > 0) {
            const dependenciesArray = typescript_1.default.factory.createArrayLiteralExpression(dependencies.map((dep) => typescript_1.default.factory.createStringLiteral(dep)));
            metatags.push(typescript_1.default.factory.createPropertyAssignment("dependencies", dependenciesArray));
        }
    }
    if (metatags.length > 0) {
        file.addFileImport("Reflect", "shared/core-framework/utils/reflect");
        const fileSource = file.source.endsWith("/index") ? file.source.slice(0, -6) : file.source;
        metatags.push(typescript_1.default.factory.createPropertyAssignment("id", typescript_1.default.factory.createStringLiteral(fileSource + "/" + ((_d = node.name) === null || _d === void 0 ? void 0 : _d.getText()))));
        const objectIdentifier = typescript_1.default.factory.createObjectLiteralExpression(metatags, true);
        const callExpression = typescript_1.default.factory.createCallExpression(typescript_1.default.factory.createPropertyAccessExpression(typescript_1.default.factory.createIdentifier("Reflect"), typescript_1.default.factory.createIdentifier("addMetaData")), undefined, [
            typescript_1.default.factory.createIdentifier((_e = classSymbol.node.name) === null || _e === void 0 ? void 0 : _e.getText()),
            objectIdentifier,
        ]);
        const callStatement = typescript_1.default.factory.createExpressionStatement(callExpression);
        realFields.push(callStatement);
    }
    ;
    return [updateClass(context, node), ...realFields];
}
exports.transformClassDeclaration = transformClassDeclaration;
function getClassImports(sourceFile) {
    const directories = {};
    function createDirectory(importModuleSpecifier, importName) {
        const importPath = importModuleSpecifier.text;
        const importDirectory = path_1.default.dirname(sourceFile.fileName);
        const resolvedImportPath = path_1.default.resolve(importDirectory, importPath).replace(/\\/g, "/");
        const trimmedImportPath = resolvedImportPath.substring(resolvedImportPath.indexOf("/src/") + 5);
        directories[importName] = trimmedImportPath;
    }
    typescript_1.default.forEachChild(sourceFile, (child) => {
        if (typescript_1.default.isImportDeclaration(child)) {
            const importClause = child.importClause;
            if (importClause && importClause.namedBindings && typescript_1.default.isNamedImports(importClause.namedBindings)) {
                const imports = importClause.namedBindings.elements;
                imports.forEach((importSpecifier) => {
                    const importName = importSpecifier.name.text;
                    const importModuleSpecifier = child.moduleSpecifier;
                    if (importModuleSpecifier && typescript_1.default.isStringLiteral(importModuleSpecifier)) {
                        createDirectory(importModuleSpecifier, importName);
                    }
                });
            }
            else if (importClause && importClause.name) {
                const importName = importClause.name.text;
                const importModuleSpecifier = child.moduleSpecifier;
                if (importModuleSpecifier && typescript_1.default.isStringLiteral(importModuleSpecifier)) {
                    createDirectory(importModuleSpecifier, importName);
                }
            }
        }
        ;
    });
    return directories;
}
function updateClass(context, node) {
    const modifiers = typescript_1.default.canHaveModifiers(node) ? typescript_1.default.getModifiers(node) : undefined;
    return factory_1.f.update.classDeclaration(node, node.name ? context.transformNode(node.name) : undefined, node.members
        .map((node) => context.transformNode(node)), node.heritageClauses, node.typeParameters, modifiers && transformModifiers(context, modifiers));
}
function transformModifiers(context, modifiers) {
    return modifiers
        .map((decorator) => context.transform(decorator));
}
