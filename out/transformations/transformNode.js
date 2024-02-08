"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformNode = void 0;
const typescript_1 = __importDefault(require("typescript"));
const transformStatement_1 = require("./transformStatement");
function transformNode(context, node) {
    try {
        if (typescript_1.default.isStatement(node)) {
            return (0, transformStatement_1.transformStatement)(context, node);
        }
    }
    catch (e) {
        throw e;
    }
    return typescript_1.default.visitEachChild(node, (newNode) => transformNode(context, newNode), context.context);
}
exports.transformNode = transformNode;
