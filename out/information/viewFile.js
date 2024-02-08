"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewFile = void 0;
const typescript_1 = __importDefault(require("typescript"));
const viewNode_1 = __importDefault(require("./viewNode"));
function viewFile(context, file) {
    context.symbols.registerFileSymbol(file);
    function visitor(node) {
        (0, viewNode_1.default)(context, node);
        typescript_1.default.forEachChild(node, visitor);
    }
    typescript_1.default.forEachChild(file, visitor);
}
exports.viewFile = viewFile;
