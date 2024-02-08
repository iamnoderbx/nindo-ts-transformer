"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findClassesImplementingString = void 0;
const typescript_1 = __importStar(require("typescript"));
const typescript_2 = require("typescript");
function findClassesImplementingString(program, string) {
    const classesImplementingString = [];
    const typeChecker = program.getTypeChecker();
    const sourceFiles = program.getSourceFiles();
    for (const sourceFile of sourceFiles) {
        const sourceFilePath = sourceFile.fileName.replace(/\\/g, "/");
        const srcIndex = sourceFilePath.indexOf("/src/") + 5;
        const directory = srcIndex > 4 ? sourceFilePath.substring(srcIndex).replace(/\.ts$/, "") : "";
        typescript_1.default.forEachChild(sourceFile, function visit(node) {
            if ((0, typescript_2.isClassDeclaration)(node)) {
                node.members.forEach((member) => {
                    if ((0, typescript_1.isMethodDeclaration)(member) &&
                        member.name.getText() === string) {
                        if (!node.name)
                            return;
                        const typeName = node.name && node.name.getText();
                        const symbol = typeChecker.getSymbolAtLocation(node.name);
                        if (typeName && symbol && symbol.valueDeclaration) {
                            const declarationSourceFile = symbol.valueDeclaration.getSourceFile();
                            if (declarationSourceFile == sourceFile) {
                                classesImplementingString.push({ name: typeName, directory: directory });
                            }
                        }
                    }
                });
            }
            typescript_1.default.forEachChild(node, visit);
        });
    }
    console.log(classesImplementingString);
    return classesImplementingString;
}
exports.findClassesImplementingString = findClassesImplementingString;
