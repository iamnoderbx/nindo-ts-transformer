"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImplementations = void 0;
const typescript_1 = __importDefault(require("typescript"));
function getImplementations(checker, classDeclaration) {
    const implementedInterfaces = [];
    // Get the class symbol
    const classSymbol = checker.getSymbolAtLocation(classDeclaration.name);
    // If the class symbol is valid
    if (classSymbol) {
        // Find interfaces implemented by the class
        const heritageClauses = classDeclaration.heritageClauses;
        if (heritageClauses) {
            for (const clause of heritageClauses) {
                if (clause.token === typescript_1.default.SyntaxKind.ImplementsKeyword) {
                    for (const type of clause.types) {
                        const implementedInterfaceSymbol = checker.getSymbolAtLocation(type.expression);
                        if (implementedInterfaceSymbol && implementedInterfaceSymbol.declarations) {
                            for (const declaration of implementedInterfaceSymbol.declarations) {
                                if (declaration.kind === typescript_1.default.SyntaxKind.ImportSpecifier) {
                                    const interfaceDeclaration = declaration;
                                    implementedInterfaces.push(interfaceDeclaration);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return implementedInterfaces;
}
exports.getImplementations = getImplementations;
