import ts, { Identifier, parameterNamePart } from "typescript";
import { TransformContext } from "../../transformer";
import { ClassSymbol } from "../../modding/symbols";
import { f } from "../../modding/factory";
import path from "path";

/**
 * @file transformClassDeclaration.ts
 * @author iAmNode
 */

/**
 * Function to transform a TypeScript class declaration.
 * @param {TransformContext} context - The transformation context.
 * @param {ts.ClassDeclaration} node - The class declaration node to transform.
 */

export function transformClassDeclaration(context: TransformContext, node: ts.ClassDeclaration) {
	// Get the file symbol for the current source file
	const file = context.symbols.fileSymbols.get(node.getSourceFile().fileName);

	// If the file symbol or class name is not found, return the node as is
	if(!file || !node.name) return node;

	// Get the class symbol for the current class declaration
	const classSymbol : ClassSymbol | undefined = file.classes.get(node.name?.text);

	// If the class symbol is not found, return the node as is
	if(!classSymbol) return node;

	// Add a synthetic leading comment to the class declaration
	ts.addSyntheticLeadingComment(node, ts.SyntaxKind.SingleLineCommentTrivia, "Class Declaration Compiled", true)

	// If the class name is not found, return the updated class
	if(!classSymbol.node.name?.getText()) return [updateClass(context, node)];

	// Initialize an array to hold metatags
	let metatags : ts.PropertyAssignment[] = []

	// Initialize an array to hold real fields
	const realFields: ts.Statement[] = [];

	// Find the constructor in the class members
	const constructor = node.members.find(ts.isConstructorDeclaration);

	// Define the keywords to check in the class's heritage clauses
	const implementKeywords: { type: string, metatag: string }[] = [
		{ type: "Start", metatag: "start" },
		{ type: "Initialize", metatag: "initialize" },
		{ type: "Tick", metatag: "ticked" },
		{ type: "Thread", metatag: "thread"},
	];

	// Check if the class implements any of the keywords
	implementKeywords
		.filter(keyword => node.heritageClauses?.some(clause =>
			clause.token === ts.SyntaxKind.ImplementsKeyword &&
			clause.types.some(type => type.getText() === keyword.type)
		))
		// If a keyword is implemented, add a corresponding metatag
		.flatMap(keyword => metatags.push(ts.factory.createPropertyAssignment(keyword.metatag, ts.factory.createTrue())));

	// If any metatags were added, add additional properties
	if(metatags.length > 0) {
		metatags.push(ts.factory.createPropertyAssignment("singleton", ts.factory.createTrue()))

		metatags.push(ts.factory.createPropertyAssignment("container", ts.factory.createIdentifier("script")))    
		metatags.push(ts.factory.createPropertyAssignment("directory", ts.factory.createIdentifier(node.name?.getText())))
		//node.name?.getText()
	}

	// Check if the class has a constructor and if any metatags were added
	if(constructor && (metatags.length > 0)) {
		// Get the source file of the class
		const sourceFile = node.getSourceFile();

		// Get the imports of the class
		const directories: {[name: string] : string} = getClassImports(sourceFile);

		// Initialize an array to hold dependencies
		const dependencies : Array<string> = [];

		// Map over the parameters of the constructor
		constructor.parameters.map((parameter : ts.ParameterDeclaration) => {
			// Get the type of the parameter
			const type = parameter.type ? parameter.type.getText() : "any";

			// Check if the parameter type is a type reference
			const parameterType = parameter.type;
			if (!parameterType || !ts.isTypeReferenceNode(parameterType)) return undefined;
			
			// Get the directory of the type
			const directory = directories[type];

			// Add the directory and type to the dependencies
			dependencies.push(directory + "/" + type)
		});

		// If any dependencies were added
		if(dependencies.length > 0) {
			// Create an array literal expression for the dependencies
			const dependenciesArray = ts.factory.createArrayLiteralExpression(
				dependencies.map((dep) => ts.factory.createStringLiteral(dep))
			);

			// Add a "dependencies" property to the metatags
			metatags.push(
				ts.factory.createPropertyAssignment("dependencies", dependenciesArray)
			);
		}
	}

	// If any metatags were added
	if(metatags.length > 0) {
		// Add an import for "Reflect" to the file
		file.addFileImport("Reflect", "shared/core-framework/utils/reflect");
		
		// Get the source of the file, removing "/index" if present
		const fileSource = file.source.endsWith("/index") ? file.source.slice(0, -6) : file.source;

		// Add an "id" property to the metatags
		metatags.push(ts.factory.createPropertyAssignment("id", ts.factory.createStringLiteral(fileSource + "/" + node.name?.getText())))

		// Create an object literal expression for the metatags
		const objectIdentifier: ts.ObjectLiteralExpression = ts.factory.createObjectLiteralExpression(
			metatags,
			true
		);
		  
		// Create a call expression to add the metadata to the class
		const callExpression: ts.CallExpression = ts.factory.createCallExpression(
			ts.factory.createPropertyAccessExpression(
				ts.factory.createIdentifier("Reflect"),
				ts.factory.createIdentifier("addMetaData")
			),
			undefined,
			[
				ts.factory.createIdentifier(classSymbol.node.name?.getText()),
				objectIdentifier,
			]
		);

		// Create an expression statement for the call expression
		const callStatement: ts.Statement = ts.factory.createExpressionStatement(callExpression);

		// Add the call statement to the real fields
		realFields.push(callStatement);
	};

	// Return the updated class and the real fields
	return [updateClass(context, node), ...realFields];
}

// Define a function to get the imports of a class
function getClassImports(sourceFile : ts.SourceFile) {
	// Initialize an object to hold the directories of the imports
	const directories: {[name: string] : string} = {};

	// Define a function to create a directory for an import
	function createDirectory(importModuleSpecifier : ts.StringLiteral, importName : string) {
		// Get the path of the import
		const importPath = importModuleSpecifier.text;

		// Get the directory of the source file
		const importDirectory = path.dirname(sourceFile.fileName);

		// Resolve the path of the import
		const resolvedImportPath = path.resolve(importDirectory, importPath).replace(/\\/g, "/");

		// Trim the resolved import path to remove the "/src/" prefix
		const trimmedImportPath = resolvedImportPath.substring(resolvedImportPath.indexOf("/src/") + 5);
		
		// Add the trimmed import path to the directories object
		directories[importName] = trimmedImportPath;
	}

	// Iterate over the children of the source file
	ts.forEachChild(sourceFile, (child) => {
		// Check if the child is an import declaration
		if (ts.isImportDeclaration(child)) {
			const importClause = child.importClause;

			// Check if the import clause has named bindings
			if (importClause && importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
				const imports = importClause.namedBindings.elements;

				// Iterate over the imports
				imports.forEach((importSpecifier) => {
					const importName = importSpecifier.name.text;
					const importModuleSpecifier = child.moduleSpecifier;

					// Check if the module specifier is a string literal
					if (importModuleSpecifier && ts.isStringLiteral(importModuleSpecifier)) {
						// Create a directory for the import
						createDirectory(importModuleSpecifier, importName)
					}
				});
			} else if (importClause && importClause.name) {
				const importName = importClause.name.text;
				const importModuleSpecifier = child.moduleSpecifier;

				// Check if the module specifier is a string literal
				if (importModuleSpecifier && ts.isStringLiteral(importModuleSpecifier)) {
					// Create a directory for the import
					createDirectory(importModuleSpecifier, importName)
				}
			}
		};
	});

	// Return the directories object
	return directories
}

// Define a function to update a class declaration
function updateClass(context: TransformContext, node: ts.ClassDeclaration) {
	// Get the modifiers of the class, if any
	const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
	
	// Return an updated class declaration
	return f.update.classDeclaration(
		node, // The class declaration to update
		node.name ? context.transformNode(node.name) : undefined, // Transform the name of the class, if it exists
		node.members.map((node) => context.transformNode(node)), // Transform the members of the class
		node.heritageClauses, // The heritage clauses of the class
		node.typeParameters, // The type parameters of the class
		modifiers && transformModifiers(context, modifiers), // Transform the modifiers of the class, if they exist
	);
}

// Define a function to transform modifiers
function transformModifiers(context: TransformContext, modifiers: readonly ts.ModifierLike[]) {
	// Return the transformed modifiers
	return modifiers.map((decorator) => context.transform(decorator));
}