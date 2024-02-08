"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolProvider = void 0;
const typescript_1 = __importDefault(require("typescript"));
const factory_1 = require("../factory");
class SymbolProvider {
    constructor(context) {
        this.context = context;
        this.fileSymbols = new Map();
    }
    registerFileSymbol(file) {
        const symbol = new FileSymbol(file);
        let fileDirectory = symbol.getFileDirectory();
        if (!fileDirectory)
            return;
        this.fileSymbols.set(fileDirectory, symbol);
    }
}
exports.SymbolProvider = SymbolProvider;
;
class ClassSymbol {
    constructor(fileSymbol, node) {
        this.fileSymbol = fileSymbol;
        this.node = node;
    }
    getClassConstructor() {
        const constructor = this.node.members.find(member => typescript_1.default.isConstructorDeclaration(member));
        return constructor;
    }
    getClassConstructorArguments() {
        const constructor = this.getClassConstructor();
        if (constructor) {
            const parameters = constructor.parameters.map(parameter => {
                const typeName = parameter.type ? parameter.type.getText() : "any";
                return { name: parameter.name.getText(), type: typeName };
            });
            return parameters;
        }
        return [];
    }
}
class FileSymbol {
    constructor(file) {
        this.file = file;
        if (!this.getFileDirectory())
            return;
        this.register();
    }
    getFileDirectory() {
        if (this.directory)
            return this.directory;
        const fullFileName = this.file.fileName;
        if (!fullFileName.includes("/src/"))
            return;
        const startIndex = fullFileName.indexOf("/src/") + 5;
        const endIndex = fullFileName.lastIndexOf(".ts");
        const fileDirectory = fullFileName.substring(startIndex, endIndex);
        this.directory = fileDirectory;
        return this.directory;
    }
    ;
    registerClassDeclaration(statement) {
        const classSymbol = new ClassSymbol(this, statement);
        console.log(classSymbol.getClassConstructorArguments());
    }
    register() {
        for (const statement of this.file.statements) {
            if (factory_1.f.is.namespaceDeclaration(statement)) {
                // console.log(statement.getText())
            }
            else if (factory_1.f.is.classDeclaration(statement)) {
                this.registerClassDeclaration(statement);
            }
        }
        ;
    }
}
;
