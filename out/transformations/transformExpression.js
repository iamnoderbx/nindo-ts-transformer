"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformExpression = void 0;
const typescript_1 = __importDefault(require("typescript"));
const transformNode_1 = require("./transformNode");
const diagnostics_1 = require("../utils/diagnostics");
const TRANSFORMERS = new Map([
//[ts.SyntaxKind.ClassDeclaration, transformClassDeclaration],
]);
function transformExpression(context, expression) {
    return (0, diagnostics_1.catchDiagnostic)(expression, () => {
        const transformer = TRANSFORMERS.get(expression.kind);
        if (transformer) {
            return transformer(context, expression);
        }
        return typescript_1.default.visitEachChild(expression, (newNode) => (0, transformNode_1.transformNode)(context, newNode), context.context);
    });
}
exports.transformExpression = transformExpression;
