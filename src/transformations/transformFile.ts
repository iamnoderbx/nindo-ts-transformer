import ts from "typescript";
import { TransformContext } from "../transformer";
import { transformStatementList } from "./transformStatementList";
import { f } from "../modding/factory";

/**
 * @file transformFile.ts
 * @author iAmNode
 */

// Define a function to transform a file
export function transformFile(context: TransformContext, file: ts.SourceFile) : ts.SourceFile {
	// Transform the statements in the file
	const statements : ts.Statement[] = transformStatementList(context, file.statements);

	// Get the symbol for the file
	const fileSymbol = context.symbols.fileSymbols.get(file.fileName);
	// Get the imports for the file
	const imports = fileSymbol?.imports;

	// If there are any imports
	if (imports) {
		// Add import declarations for the imports to the start of the statements
		statements.unshift(
			...imports.map((info : {name: string, directory: string}) => 
				// Create an import declaration for the import
				ts.factory.createImportDeclaration(
					undefined,
					// Create an import clause for the import
					ts.factory.createImportClause(
						false,
						undefined,
						// Create named imports for the import
						ts.factory.createNamedImports([
							// Create an import specifier for the import
							ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(info.name)),
						])
					),
					// Create a string literal for the directory of the import
					ts.factory.createStringLiteral(info.directory)
				)
			),
		);
	};

	// Update the source file with the transformed statements
	const sourceFile = f.update.sourceFile(file, statements);
	// Return the transformed source file
	return sourceFile;
}