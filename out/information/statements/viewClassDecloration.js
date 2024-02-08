"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewClassDeclaration = void 0;
const symbols_1 = require("../../modding/symbols");
function viewClassDeclaration(context, node) {
    var _a;
    const implementsStartInterface = (_a = node.heritageClauses) === null || _a === void 0 ? void 0 : _a.some((clause) => clause.types.some((type) => type.expression.getText() === "Start"));
    if (implementsStartInterface) {
        const fileSymbol = context.symbols.fileSymbols.get(node.getSourceFile().fileName);
        if (!fileSymbol || !node.name)
            return;
        const classSymbol = fileSymbol.classes.get(node.name.text);
        classSymbol === null || classSymbol === void 0 ? void 0 : classSymbol.addMetaTag(new symbols_1.MetaTag(symbols_1.MetatagTypes.START, true));
    }
    ;
}
exports.viewClassDeclaration = viewClassDeclaration;
;
