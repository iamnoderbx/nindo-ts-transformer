"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformFile = void 0;
const typescript_1 = __importDefault(require("typescript"));
const transformStatementList_1 = require("./transformStatementList");
const factory_1 = require("../modding/factory");
function transformFile(context, file) {
    const statements = (0, transformStatementList_1.transformStatementList)(context, file.statements);
    const fileSymbol = context.symbols.fileSymbols.get(file.fileName);
    const imports = fileSymbol === null || fileSymbol === void 0 ? void 0 : fileSymbol.imports;
    if (imports) {
        statements.unshift(...imports.map((info) => typescript_1.default.factory.createImportDeclaration(undefined, typescript_1.default.factory.createImportClause(false, undefined, typescript_1.default.factory.createNamedImports([
            typescript_1.default.factory.createImportSpecifier(false, undefined, typescript_1.default.factory.createIdentifier(info.name)),
        ])), typescript_1.default.factory.createStringLiteral(info.directory))));
    }
    ;
    const sourceFile = factory_1.f.update.sourceFile(file, statements);
    return sourceFile;
}
exports.transformFile = transformFile;
