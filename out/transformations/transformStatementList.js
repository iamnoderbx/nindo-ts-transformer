"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformStatementList = void 0;
const getNodeList_1 = require("../modding/getNodeList");
const transformStatement_1 = require("./transformStatement");
function transformStatementList(context, statements) {
    const result = new Array();
    for (const statement of statements) {
        const [newStatements, prereqs] = context.capture(() => (0, transformStatement_1.transformStatement)(context, statement));
        result.push(...prereqs);
        result.push(...(0, getNodeList_1.getNodeList)(newStatements));
    }
    return result;
}
exports.transformStatementList = transformStatementList;
