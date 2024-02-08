"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformImportDeclaration = void 0;
const typescript_1 = __importDefault(require("typescript"));
function transformImportDeclaration(context, node) {
    typescript_1.default.addSyntheticLeadingComment(node, typescript_1.default.SyntaxKind.SingleLineCommentTrivia, "Import Decloration Compiled", true);
    return node;
}
exports.transformImportDeclaration = transformImportDeclaration;
