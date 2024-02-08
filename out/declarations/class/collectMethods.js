"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassMethods = void 0;
const typescript_1 = __importDefault(require("typescript"));
function getClassMethods(classDeclaration) {
    return classDeclaration.members.filter(typescript_1.default.isMethodDeclaration);
}
exports.getClassMethods = getClassMethods;
