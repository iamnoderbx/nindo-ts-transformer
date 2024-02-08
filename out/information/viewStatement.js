"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const viewClassDecloration_1 = require("./statements/viewClassDecloration");
const viewImportDeclaration_1 = require("./statements/viewImportDeclaration");
const VIEWERS = new Map([
    [typescript_1.default.SyntaxKind.ClassDeclaration, viewClassDecloration_1.viewClassDeclaration],
    [typescript_1.default.SyntaxKind.ImportDeclaration, viewImportDeclaration_1.viewImportDeclaration]
]);
function viewStatement(context, expression) {
    const viewer = VIEWERS.get(expression.kind);
    if (viewer) {
        viewer(context, expression);
    }
}
exports.default = viewStatement;
