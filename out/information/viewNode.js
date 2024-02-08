"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const viewStatement_1 = __importDefault(require("./viewStatement"));
const viewExpression_1 = __importDefault(require("./viewExpression"));
function viewNode(context, node) {
    if (typescript_1.default.isExpression(node)) {
        (0, viewExpression_1.default)(context, node);
    }
    else if (typescript_1.default.isStatement(node)) {
        (0, viewStatement_1.default)(context, node);
    }
}
exports.default = viewNode;
