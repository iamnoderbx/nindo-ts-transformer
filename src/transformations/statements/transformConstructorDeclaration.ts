import ts from "typescript";
import { TransformContext } from "../../transformer";

export function transformConstructorDeclaration(context: TransformContext, node: ts.ClassDeclaration) {
    // No longer need to transform constructor declarations, is done within the class declaration
    return node
}