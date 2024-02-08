"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformStatement = void 0;
const typescript_1 = __importDefault(require("typescript"));
const getNodeList_1 = require("../modding/getNodeList");
const transformNode_1 = require("./transformNode");
const diagnostics_1 = require("../utils/diagnostics");
const transformClassDecloration_1 = require("./statements/transformClassDecloration");
const TRANSFORMERS = new Map([
    [typescript_1.default.SyntaxKind.ClassDeclaration, transformClassDecloration_1.transformClassDeclaration],
]);
function transformStatement(context, statement) {
    return (0, diagnostics_1.catchDiagnostic)(statement, () => {
        const [node, prereqs] = context.capture(() => {
            const transformer = TRANSFORMERS.get(statement.kind);
            if (transformer) {
                return transformer(context, statement);
            }
            return typescript_1.default.visitEachChild(statement, (newNode) => (0, transformNode_1.transformNode)(context, newNode), context.context);
        });
        return [...prereqs, ...(0, getNodeList_1.getNodeList)(node)];
    });
}
exports.transformStatement = transformStatement;
