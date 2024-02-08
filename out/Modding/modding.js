"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformFile = exports.getFileFromNode = void 0;
const factory_1 = require("./factory");
function transformStatementList(context, statements) {
    return statements;
}
function getFileFromNode(node) {
    const file = node.getSourceFile();
    return file;
}
exports.getFileFromNode = getFileFromNode;
function transformFile(context, file) {
    const statements = transformStatementList(context, file.statements);
    const sourceFile = factory_1.f.update.sourceFile(file, statements);
    return sourceFile;
}
exports.transformFile = transformFile;
