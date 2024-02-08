import ts from "typescript";
import { TransformContext } from "../../transformer";

export function transformImportDeclaration(context: TransformContext, node: ts.ClassDeclaration) {
    // Add a comment to the top of the class, this is a synthetic comment
    // this would typically be some sort of watermark or compiler flag but there is no need.

    // Under other circumstances you could make this register strict mode or something else.
    ts.addSyntheticLeadingComment(node, ts.SyntaxKind.SingleLineCommentTrivia, "Import Decloration Compiled", true)

    return node;
}
