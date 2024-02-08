"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassSymbol = exports.MetatagTypes = exports.MetaTag = exports.SymbolProvider = void 0;
const factory_1 = require("./factory");
var MetatagTypes;
(function (MetatagTypes) {
    MetatagTypes[MetatagTypes["START"] = 1] = "START";
})(MetatagTypes || (exports.MetatagTypes = MetatagTypes = {}));
class MetaTag {
    constructor(id, value) {
        this.id = id;
        this.value = value;
    }
}
exports.MetaTag = MetaTag;
class SymbolProvider {
    constructor() {
        this.fileSymbols = new Map();
        this.sources = new Map();
        this.taggedClasses = [];
    }
    getFileSymbolFromSource(src) {
        return this.sources.get(src);
    }
    registerFileSymbol(file) {
        const fileSymbol = new FileSymbol(this, file);
        this.fileSymbols.set(file.fileName, fileSymbol);
        this.sources.set(fileSymbol.source, fileSymbol);
    }
    ;
}
exports.SymbolProvider = SymbolProvider;
class ClassSymbol {
    constructor(fileSymbol, node) {
        this.fileSymbol = fileSymbol;
        this.node = node;
        //console.log("Registered new class symbol: " + node.getText())
        this.metatags = [];
    }
    hasMetaTag(tag) {
        return this.metatags.includes(tag);
    }
    addMetaTag(tag) {
        this.metatags.push(tag.id);
        if (!this.fileSymbol.provider.taggedClasses.includes(this)) {
            this.fileSymbol.provider.taggedClasses.push(this);
        }
        ;
    }
}
exports.ClassSymbol = ClassSymbol;
class FileSymbol {
    constructor(provider, file) {
        this.provider = provider;
        this.file = file;
        this.classes = new Map();
        this.imports = [];
        this.register();
        const filePath = file.fileName;
        const srcIndex = filePath.indexOf("/src/");
        const trimmedFileName = srcIndex !== -1 ? filePath.substring(srcIndex + 5) : filePath;
        const fileNameWithoutExtension = trimmedFileName.replace(/\.(ts|tsx)$/, '');
        this.source = fileNameWithoutExtension;
    }
    registerClass(node) {
        if (!node.name)
            return;
        const classSymbol = new ClassSymbol(this, node);
        this.classes.set(node.name.text, classSymbol);
    }
    addFileImport(name, directory) {
        if (this.imports.filter(e => e.name === name).length > 0) {
            return;
        }
        this.imports.push({
            name: name,
            directory: directory,
        });
    }
    register() {
        for (const statement of this.file.statements) {
            if (factory_1.f.is.classDeclaration(statement)) {
                this.registerClass(statement);
            }
            ;
        }
        ;
    }
}
