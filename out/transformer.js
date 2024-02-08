"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformContext = void 0;
const typescript_1 = __importDefault(require("typescript"));
const symbols_1 = require("./modding/symbols");
const transformNode_1 = require("./transformations/transformNode");
/**
 * This is a utility object to pass around your dependencies.
 *
 * You can also use this object to store state, e.g prereqs.
 */
class TransformContext {
    constructor(program, context, config) {
        this.program = program;
        this.context = context;
        this.config = config;
        this.prereqStack = new Array();
        this.factory = context.factory;
        this.symbols = new symbols_1.SymbolProvider();
    }
    capture(cb) {
        this.prereqStack.push([]);
        const result = cb();
        return [result, this.prereqStack.pop()];
    }
    transformNode(node) {
        return typescript_1.default.visitNode(node, (newNode) => (0, transformNode_1.transformNode)(this, newNode));
    }
    /**
     * Transforms the children of the specified node.
     */
    transform(node) {
        return typescript_1.default.visitEachChild(node, (node) => visitNode(this, node), this.context);
    }
    addStartImplementation(node) {
        throw new Error("Method not implemented.");
    }
}
exports.TransformContext = TransformContext;
function visitNode(context, node) {
    if (typescript_1.default.isClassDeclaration(node)) {
        //return visitClassDeclaration(context, node)
    }
    // We encountered a node that we don't handle above,
    // but we should keep iterating the AST in case we find something we want to transform.
    return context.transform(node);
}
