"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitClassDeclaration = void 0;
const typescript_1 = __importDefault(require("typescript"));
const collectImplementations_1 = require("./collectImplementations");
function visitClassDeclaration(context, node) {
    const implementations = (0, collectImplementations_1.getImplementations)(context.program.getTypeChecker(), node);
    const implementsDependencyInjection = implementations.some((interfaceDeclaration) => interfaceDeclaration.name.text === "DependencyInjection");
    if (implementsDependencyInjection) {
        handleDependencyInjections(context, node);
    }
    return node;
}
exports.visitClassDeclaration = visitClassDeclaration;
function handleDependencyInjections(context, node) {
    typescript_1.default.addSyntheticLeadingComment(node, typescript_1.default.SyntaxKind.SingleLineCommentTrivia, "Implements DependencyInjection", true);
}
