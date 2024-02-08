import ts from "typescript";

/**
 * Namespace 'f' to group related code elements.
 * @namespace f
 * @author fireboltofdeath
 * @author Osyris
 */

export namespace f {
	// Reference to TypeScript's factory object
	let factory = ts.factory;

	/**
	 * Type alias for an array of TypeScript nodes.
	 * @template T extends ts.Node
	 * @typedef NodeArray
	 */
	type NodeArray<T extends ts.Node> = ReadonlyArray<T> | ts.NodeArray<T>;

	/**
	 * Type alias for an optional array of TypeScript nodes.
	 * @template T extends ts.Node
	 * @typedef ONodeArray
	 */
	type ONodeArray<T extends ts.Node> = NodeArray<T> | undefined;

	/**
	 * Type alias for an expression that can be converted to a TypeScript expression.
	 * @typedef ConvertableExpression
	 */
	export type ConvertableExpression = string | number | ts.Expression | Array<ConvertableExpression> | boolean;

	/**
	 * Function to convert a convertible expression into a TypeScript expression.
	 * @param {ConvertableExpression} expression - The expression to convert.
	 * @param {(param: string) => ts.Expression} stringFn - Optional function to convert strings.
	 * @returns {ts.Expression} The converted TypeScript expression.
	 */
	export function toExpression(
		expression: ConvertableExpression,
		stringFn: (param: string) => ts.Expression = string,
	): ts.Expression {
		if (typeof expression === "string") {
			return stringFn(expression);
		} else if (typeof expression === "number") {
			return number(expression);
		} else if (typeof expression === "boolean") {
			return bool(expression);
		} else if (Array.isArray(expression)) {
			return array(expression.map((x) => toExpression(x)));
		} else {
			return expression;
		}
	}

	// Expressions

	/**
	 * Function to create a TypeScript string literal.
	 * @param {string} str - The string value.
	 * @returns {ts.StringLiteral} The created string literal.
	 */
	export function string(str: string) {
		return factory.createStringLiteral(str);
	}

	/**
	 * Function to create a TypeScript boolean literal.
	 * @param {boolean} value - The boolean value.
	 * @returns {ts.BooleanLiteral} The created boolean literal.
	 */
	export function bool(value: boolean) {
		return value ? factory.createTrue() : factory.createFalse();
	}

	/**
	 * Function to create a TypeScript array literal expression.
	 * @param {ts.Expression[]} values - The array values.
	 * @param {boolean} [multiLine=true] - Whether to format the array over multiple lines.
	 * @returns {ts.ArrayLiteralExpression} The created array literal expression.
	 */
	export function array(values: ts.Expression[], multiLine = true) {
		return factory.createArrayLiteralExpression(values, multiLine);
	}

	/**
	 * Function to create a TypeScript numeric literal.
	 * @param {number | string} value - The numeric value.
	 * @param {ts.TokenFlags} [flags] - Optional flags for the numeric literal.
	 * @returns {ts.NumericLiteral} The created numeric literal.
	 */
	export function number(value: number | string, flags?: ts.TokenFlags) {
		return factory.createNumericLiteral(value, flags);
	}

	/**
	 * Function to create a TypeScript identifier.
	 * @param {string} name - The identifier name.
	 * @param {boolean} [unique=false] - Whether to create a unique identifier.
	 * @returns {ts.Identifier} The created identifier.
	 */
	export function identifier(name: string, unique = false) {
		return unique ? factory.createUniqueName(name) : factory.createIdentifier(name);
	}

	/**
	 * Function to create a TypeScript identifier for 'undefined'.
	 * @returns {ts.Identifier} The created identifier.
	 */
	export function nil() {
		return identifier("undefined");
	}

	/**
	 * Function to create a TypeScript element access or property access expression.
	 * @param {ts.Expression | string} name - The object expression.
	 * @param {ts.Expression | ts.PropertyName | ts.MemberName | string} property - The property name.
	 * @returns {ts.ElementAccessExpression | ts.PropertyAccessExpression} The created access expression.
	 */
	export function field(
		name: ts.Expression | string,
		property: ts.Expression | ts.PropertyName | ts.MemberName | string,
	): ts.ElementAccessExpression | ts.PropertyAccessExpression {
		if (typeof property === "string") {
			return factory.createElementAccessExpression(toExpression(name, identifier), string(property));
		}

		if (ts.isComputedPropertyName(property)) {
			return field(name, property.expression);
		}

		if (ts.isMemberName(property)) {
			return factory.createPropertyAccessExpression(toExpression(name, identifier), property);
		} else {
			return factory.createElementAccessExpression(toExpression(name, identifier), toExpression(property));
		}
	}

	/**
	 * Function to create a TypeScript expression statement.
	 * @param {ConvertableExpression} [expression] - The expression to convert into a statement.
	 * @returns {ts.ExpressionStatement} The created expression statement.
	 */
	export function statement(expression?: ConvertableExpression) {
		if (expression !== undefined) {
			return factory.createExpressionStatement(toExpression(expression));
		} else {
			return factory.createExpressionStatement(identifier("undefined"));
		}
	}

	/**
	 * Function to create a TypeScript call expression.
	 * @param {ts.Expression | string} expression - The expression to call.
	 * @param {ConvertableExpression[]} [args] - The arguments to pass to the call.
	 * @param {ts.TypeNode[]} [typeArguments] - The type arguments for the call.
	 * @returns {ts.CallExpression} The created call expression.
	 */
	export function call(
		expression: ts.Expression | string,
		args?: ConvertableExpression[],
		typeArguments?: ts.TypeNode[],
	) {
		return factory.createCallExpression(
			toExpression(expression, identifier),
			typeArguments,
			args?.map((x) => toExpression(x)),
		);
	}

	/**
	 * Function to create a TypeScript object literal expression.
	 * @param {readonly ts.ObjectLiteralElementLike[] | { [key: string]: ConvertableExpression | Array<ConvertableExpression> }} properties - The properties of the object.
	 * @param {boolean} [multiLine=true] - Whether to format the object over multiple lines.
	 * @returns {ts.ObjectLiteralExpression} The created object literal expression.
	 */
	export function object(
		properties:
			| readonly ts.ObjectLiteralElementLike[]
			| { [key: string]: ConvertableExpression | Array<ConvertableExpression> },
		multiLine = true,
	) {
		if (properties instanceof Array) {
			return factory.createObjectLiteralExpression(properties, multiLine);
		} else {
			const realProperties: ts.ObjectLiteralElementLike[] = [];
			for (const key of Object.keys(properties)) {
				realProperties.push(propertyAssignmentDeclaration(key, properties[key]));
			}
			return factory.createObjectLiteralExpression(realProperties, multiLine);
		}
	}

	/**
	 * @file factory.ts
	 * @author iAmNode
	 */

	/**
	 * Function to create a TypeScript 'as' expression.
	 * @param {ts.Expression} expression - The expression to cast.
	 * @param {ts.TypeNode} node - The type to cast to.
	 * @param {boolean} [explicit=false] - Whether to explicitly cast to 'unknown' before casting to the target type.
	 * @returns {ts.AsExpression} The created 'as' expression.
	 */
	export function as(expression: ts.Expression, node: ts.TypeNode, explicit = false) {
		return explicit
			? factory.createAsExpression(
				  factory.createAsExpression(expression, keywordType(ts.SyntaxKind.UnknownKeyword)),
				  node,
			  )
			: factory.createAsExpression(expression, node);
	}

	/**
	 * Function to create a TypeScript 'as never' expression.
	 * @param {ts.Expression} expression - The expression to cast.
	 * @returns {ts.AsExpression} The created 'as never' expression.
	 */
	export function asNever(expression: ts.Expression) {
		return f.as(expression, keywordType(ts.SyntaxKind.NeverKeyword));
	}

	/**
	 * Function to create a TypeScript binary expression.
	 * @param {ConvertableExpression} left - The left-hand side of the binary expression.
	 * @param {ts.BinaryOperator | ts.BinaryOperatorToken} op - The binary operator.
	 * @param {ConvertableExpression} right - The right-hand side of the binary expression.
	 * @returns {ts.BinaryExpression} The created binary expression.
	 */
	export function binary(
		left: ConvertableExpression,
		op: ts.BinaryOperator | ts.BinaryOperatorToken,
		right: ConvertableExpression,
	) {
		return factory.createBinaryExpression(toExpression(left), op, toExpression(right));
	}

	/**
	 * Function to create a TypeScript element access expression.
	 * @param {ConvertableExpression} expression - The expression to access.
	 * @param {ConvertableExpression} index - The index to access.
	 * @returns {ts.ElementAccessExpression} The created element access expression.
	 */
	export function elementAccessExpression(expression: ConvertableExpression, index: ConvertableExpression) {
		return factory.createElementAccessExpression(toExpression(expression), toExpression(index));
	}

	/**
	 * Function to create a TypeScript property access expression.
	 * @param {ConvertableExpression} expression - The expression to access.
	 * @param {ts.MemberName} name - The property name to access.
	 * @returns {ts.PropertyAccessExpression} The created property access expression.
	 */
	export function propertyAccessExpression(expression: ConvertableExpression, name: ts.MemberName) {
		return factory.createPropertyAccessExpression(toExpression(expression), name);
	}

	/**
	 * Function to create a TypeScript arrow function.
	 * @param {ts.ConciseBody} body - The body of the arrow function.
	 * @param {ts.ParameterDeclaration[]} [parameters] - The parameters of the arrow function.
	 * @param {ts.TypeParameterDeclaration[]} [typeParameters] - The type parameters of the arrow function.
	 * @param {ts.TypeNode} [type] - The return type of the arrow function.
	 * @returns {ts.ArrowFunction} The created arrow function.
	 */
	export function arrowFunction(
		body: ts.ConciseBody,
		parameters?: ts.ParameterDeclaration[],
		typeParameters?: ts.TypeParameterDeclaration[],
		type?: ts.TypeNode,
	) {
		return factory.createArrowFunction(
			undefined,
			typeParameters,
			parameters ?? [],
			type,
			factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
			body,
		);
	}

	/**
	 * Function to create a TypeScript non-null expression.
	 * @param {ConvertableExpression} expression - The expression to assert as non-null.
	 * @returns {ts.NonNullExpression} The created non-null expression.
	 */
	export function bang(expression: ConvertableExpression) {
		return factory.createNonNullExpression(toExpression(expression, identifier));
	}

	/**
	 * Function to create a TypeScript 'this' expression.
	 * @returns {ts.ThisExpression} The created 'this' expression.
	 */
	export function self() {
		return ts.factory.createThis();
	}

	/**
	 * Function to create a TypeScript 'super' expression.
	 * @returns {ts.SuperExpression} The created 'super' expression.
	 */
	export function superExpression() {
		return ts.factory.createSuper();
	}

	/**
	 * Function to create a TypeScript block statement.
	 * @param {ts.Statement[]} statements - The statements in the block.
	 * @param {boolean} [multiLine=true] - Whether to format the block over multiple lines.
	 * @returns {ts.Block} The created block statement.
	 */
	export function block(statements: ts.Statement[], multiLine = true) {
		return factory.createBlock(statements, multiLine);
	}

	/**
	 * Function to create a TypeScript return statement.
	 * @param {ConvertableExpression} [expression] - The expression to return.
	 * @returns {ts.ReturnStatement} The created return statement.
	 */
	export function returnStatement(expression?: ConvertableExpression) {
		return factory.createReturnStatement(expression ? toExpression(expression) : undefined);
	}

	/**
	 * Function to create a TypeScript variable statement.
	 * @param {string | ts.BindingName} name - The name of the variable.
	 * @param {ts.Expression} [initializer] - The initial value of the variable.
	 * @param {ts.TypeNode} [type] - The type of the variable.
	 * @param {boolean} [isMutable=false] - Whether the variable is mutable.
	 * @returns {ts.VariableStatement} The created variable statement.
	 */
	export function variableStatement(
		name: string | ts.BindingName,
		initializer?: ts.Expression,
		type?: ts.TypeNode,
		isMutable = false,
	) {
		return factory.createVariableStatement(
			undefined,
			factory.createVariableDeclarationList(
				[factory.createVariableDeclaration(name, undefined, type, initializer)],
				isMutable ? ts.NodeFlags.Let : ts.NodeFlags.Const,
			),
		);
	}

	/**
	 * Function to create a TypeScript method declaration.
	 * @param {string | ts.PropertyName} name - The name of the method.
	 * @param {ts.Block} [body] - The body of the method.
	 * @param {ts.ParameterDeclaration[]} [parameters] - The parameters of the method.
	 * @param {ts.TypeNode} [type] - The return type of the method.
	 * @param {boolean} [isOptional=false] - Whether the method is optional.
	 * @param {ts.TypeParameterDeclaration[]} [typeParameters] - The type parameters of the method.
	 * @returns {ts.MethodDeclaration} The created method declaration.
	 */
	export function methodDeclaration(
		name: string | ts.PropertyName,
		body?: ts.Block,
		parameters?: ts.ParameterDeclaration[],
		type?: ts.TypeNode,
		isOptional = false,
		typeParameters?: ts.TypeParameterDeclaration[],
	) {
		return factory.createMethodDeclaration(
			undefined,
			undefined,
			name,
			isOptional ? token(ts.SyntaxKind.QuestionToken) : undefined,
			typeParameters,
			parameters ?? [],
			type,
			body,
		);
	}

	/**
	 * Function to create a TypeScript array binding pattern.
	 * @param {Array<ts.Identifier | string>} elements - The elements of the array.
	 * @returns {ts.ArrayBindingPattern} The created array binding pattern.
	 */
	export function arrayBindingDeclaration(elements: Array<ts.Identifier | string>) {
		return factory.createArrayBindingPattern(
			elements.map((x) => factory.createBindingElement(undefined, undefined, x, undefined)),
		);
	}

	/**
	 * Function to create a TypeScript parameter declaration.
	 * @param {string | ts.BindingName} name - The name of the parameter.
	 * @param {ts.TypeNode} [type] - The type of the parameter.
	 * @param {ts.Expression} [value] - The default value of the parameter.
	 * @param {boolean} [isOptional] - Whether the parameter is optional.
	 * @param {boolean} [isSpread] - Whether the parameter is a spread parameter.
	 * @returns {ts.ParameterDeclaration} The created parameter declaration.
	 */
	export function parameterDeclaration(
		name: string | ts.BindingName,
		type?: ts.TypeNode,
		value?: ts.Expression,
		isOptional?: boolean,
		isSpread?: boolean,
	) {
		return factory.createParameterDeclaration(
			undefined,
			isSpread ? factory.createToken(ts.SyntaxKind.DotDotDotToken) : undefined,
			name,
			isOptional ? factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
			type,
			value,
		);
	}

	// TODO, FINALIZE DOCUMENTATION

	export function typeParameterDeclaration(
		name: string | ts.Identifier,
		constraint?: ts.TypeNode,
		defaultType?: ts.TypeNode,
	) {
		return factory.createTypeParameterDeclaration(undefined, name, constraint, defaultType);
	}

	export function propertyAssignmentDeclaration(name: ts.PropertyName | string, value: ConvertableExpression) {
		return factory.createPropertyAssignment(typeof name === "string" ? string(name) : name, toExpression(value));
	}

	export function propertyDeclaration(
		name: ts.PropertyName | string,
		initializer?: ts.Expression,
		type?: ts.TypeNode,
		tokenType?: ts.QuestionToken | ts.ExclamationToken,
	) {
		return factory.createPropertyDeclaration(undefined, name, tokenType, type, initializer);
	}

	export function importDeclaration(
		path: string | ts.StringLiteral,
		imports?: (ts.Identifier | [string | ts.Identifier, ts.Identifier])[],
		defaultImport?: ts.Identifier,
		typeOnly = false,
	) {
		return factory.createImportDeclaration(
			undefined,
			factory.createImportClause(
				typeOnly,
				defaultImport,
				imports
					? factory.createNamedImports(
							imports.map((x) => {
								if (Array.isArray(x)) {
									return factory.createImportSpecifier(
										false,
										typeof x[0] === "string" ? f.identifier(x[0]) : x[0],
										x[1],
									);
								} else {
									return factory.createImportSpecifier(false, undefined, x);
								}
							}),
					  )
					: undefined,
			),
			toExpression(path),
		);
	}

	export function functionDeclaration(
		name: string | ts.Identifier,
		body?: ts.Block,
		parameters: ts.ParameterDeclaration[] = [],
		type?: ts.TypeNode,
		typeParams?: ts.TypeParameterDeclaration[],
	) {
		return factory.createFunctionDeclaration(undefined, undefined, name, typeParams, parameters, type, body);
	}

	export function typeAliasDeclaration(
		name: string | ts.Identifier,
		type: ts.TypeNode,
		typeParameters?: ts.TypeParameterDeclaration[],
	) {
		return factory.createTypeAliasDeclaration(undefined, name, typeParameters, type);
	}

	/// Type Nodes

	export function functionType(
		parameters: ts.ParameterDeclaration[],
		returnType: ts.TypeNode,
		typeParameters?: ts.TypeParameterDeclaration[],
	) {
		return factory.createFunctionTypeNode(typeParameters ?? [], parameters, returnType);
	}

	export function unionType(types: ts.TypeNode[]) {
		return factory.createUnionTypeNode(types);
	}

	export function intersectionType(types: ts.TypeNode[]) {
		return factory.createIntersectionTypeNode(types);
	}

	export function importType(
		argument: ts.TypeNode | string,
		qualifier?: ts.EntityName,
		isTypeOf?: boolean,
		typeArguments?: ts.TypeNode[],
	) {
		return factory.createImportTypeNode(
			typeof argument === "string" ? literalType(string(argument)) : argument,
			undefined,
			qualifier,
			typeArguments,
			isTypeOf,
		);
	}

	export function referenceType(typeName: string | ts.EntityName, typeArguments?: ts.TypeNode[]) {
		return factory.createTypeReferenceNode(typeName, typeArguments);
	}

	export function keywordType(kind: ts.KeywordTypeSyntaxKind) {
		return factory.createKeywordTypeNode(kind);
	}

	export function qualifiedNameType(left: ts.EntityName, right: string | ts.Identifier) {
		return factory.createQualifiedName(left, right);
	}

	export function typeLiteralType(members: ts.TypeElement[]) {
		return factory.createTypeLiteralNode(members);
	}

	export function indexSignatureType(indexType: ts.TypeNode, valueType: ts.TypeNode) {
		return factory.createIndexSignature(undefined, [parameterDeclaration("key", indexType)], valueType);
	}

	export function callSignatureType(
		parameters: ts.ParameterDeclaration[],
		returnType: ts.TypeNode,
		typeParameters?: ts.TypeParameterDeclaration[],
	) {
		return factory.createCallSignature(typeParameters, parameters, returnType);
	}

	export function tupleType(elements: Array<ts.TypeNode | ts.NamedTupleMember>) {
		return factory.createTupleTypeNode(elements);
	}

	export function literalType(expr: ts.LiteralTypeNode["literal"]) {
		return factory.createLiteralTypeNode(expr);
	}

	export function propertySignatureType(name: string | ts.PropertyName, type: ts.TypeNode, isOptional?: boolean) {
		return factory.createPropertySignature(
			undefined,
			name,
			isOptional ? token(ts.SyntaxKind.QuestionToken) : undefined,
			type,
		);
	}

	export function indexedAccessType(left: ts.TypeNode, right: ts.TypeNode) {
		return factory.createIndexedAccessTypeNode(left, right);
	}

	export function queryType(expression: ts.EntityName) {
		return factory.createTypeQueryNode(expression);
	}

	export function selfType() {
		return factory.createThisTypeNode();
	}

	// Other

	export function token<T extends ts.SyntaxKind>(kind: T) {
		return factory.createToken(kind);
	}

	export function modifier<T extends ts.ModifierSyntaxKind>(kind: T) {
		return factory.createModifier(kind);
	}

	export namespace is {
		/// Expressions

		export function statement(node?: ts.Node): node is ts.ExpressionStatement {
			return node !== undefined && ts.isExpressionStatement(node);
		}

		export function string(node?: ts.Node): node is ts.StringLiteral {
			return node !== undefined && ts.isStringLiteral(node);
		}

		export function bool(node?: ts.Node): node is ts.BooleanLiteral {
			return node !== undefined && (node === f.bool(true) || node === f.bool(false));
		}

		export function array(node?: ts.Node): node is ts.ArrayLiteralExpression {
			return node !== undefined && ts.isArrayLiteralExpression(node);
		}

		export function number(node?: ts.Node): node is ts.NumericLiteral {
			return node !== undefined && ts.isNumericLiteral(node);
		}

		export function identifier(node?: ts.Node): node is ts.Identifier {
			return node !== undefined && ts.isIdentifier(node);
		}

		export function nil(node?: ts.Node): node is ts.Identifier & { text: "undefined " } {
			return node !== undefined && identifier(node) && node.text === "undefined";
		}

		export function call(node?: ts.Node): node is ts.CallExpression {
			return node !== undefined && ts.isCallExpression(node);
		}

		export function object(node?: ts.Node): node is ts.ObjectLiteralExpression {
			return node !== undefined && ts.isObjectLiteralExpression(node);
		}

		export function functionExpression(node?: ts.Node): node is ts.ArrowFunction | ts.FunctionExpression {
			return node !== undefined && (ts.isArrowFunction(node) || ts.isFunctionExpression(node));
		}

		export function omitted(node?: ts.Node): node is ts.OmittedExpression {
			return node !== undefined && ts.isOmittedExpression(node);
		}

		export function accessExpression(node?: ts.Node): node is ts.AccessExpression {
			return node !== undefined && ts.isAccessExpression(node);
		}

		export function propertyAccessExpression(node?: ts.Node): node is ts.PropertyAccessExpression {
			return node !== undefined && ts.isPropertyAccessExpression(node);
		}

		export function elementAccessExpression(node?: ts.Node): node is ts.ElementAccessExpression {
			return node !== undefined && ts.isElementAccessExpression(node);
		}

		export function postfixUnary(node?: ts.Node): node is ts.PostfixUnaryExpression {
			return node !== undefined && ts.isPostfixUnaryExpression(node);
		}

		export function superExpression(node?: ts.Node): node is ts.SuperExpression {
			return node !== undefined && ts.isSuperKeyword(node);
		}

		/// Statements
		/// Declarations

		export function enumDeclaration(node?: ts.Node): node is ts.EnumDeclaration {
			return node !== undefined && ts.isEnumDeclaration(node);
		}

		export function constructor(node?: ts.Node): node is ts.ConstructorDeclaration {
			return node !== undefined && ts.isConstructorDeclaration(node);
		}

		export function propertyDeclaration(node?: ts.Node): node is ts.PropertyDeclaration {
			return node !== undefined && ts.isPropertyDeclaration(node);
		}

		export function propertyAssignmentDeclaration(node?: ts.Node): node is ts.PropertyAssignment {
			return node !== undefined && ts.isPropertyAssignment(node);
		}

		export function importDeclaration(node?: ts.Node): node is ts.ImportDeclaration {
			return node !== undefined && ts.isImportDeclaration(node);
		}

		export function classDeclaration(node?: ts.Node): node is ts.ClassDeclaration {
			return node !== undefined && ts.isClassDeclaration(node);
		}

		export function methodDeclaration(node?: ts.Node): node is ts.MethodDeclaration {
			return node !== undefined && ts.isMethodDeclaration(node);
		}

		export function namespaceDeclaration(node?: ts.Node): node is ts.NamespaceDeclaration {
			return (
				(node !== undefined &&
					ts.isModuleDeclaration(node) &&
					identifier(node.name) &&
					node.body &&
					ts.isNamespaceBody(node.body)) ||
				false
			);
		}

		export function moduleBlockDeclaration(node?: ts.Node): node is ts.ModuleBlock {
			return node !== undefined && ts.isModuleBlock(node);
		}

		export function importClauseDeclaration(node?: ts.Node): node is ts.ImportClause {
			return node !== undefined && ts.isImportClause(node);
		}

		export function namedDeclaration(node?: ts.Node): node is ts.NamedDeclaration & { name: ts.DeclarationName } {
			return node !== undefined && ts.isNamedDeclaration(node);
		}

		export function interfaceDeclaration(node?: ts.Node): node is ts.InterfaceDeclaration {
			return node !== undefined && ts.isInterfaceDeclaration(node);
		}

		export function typeAliasDeclaration(node?: ts.Node): node is ts.TypeAliasDeclaration {
			return node !== undefined && ts.isTypeAliasDeclaration(node);
		}

		/// Type Nodes

		export function referenceType(node?: ts.Node): node is ts.TypeReferenceNode {
			return node !== undefined && ts.isTypeReferenceNode(node);
		}

		export function queryType(node?: ts.Node): node is ts.TypeQueryNode {
			return node !== undefined && ts.isTypeQueryNode(node);
		}

		export function importType(node?: ts.Node): node is ts.ImportTypeNode {
			return node !== undefined && ts.isImportTypeNode(node);
		}

		/// OTHERS
		export function namedImports(node?: ts.Node): node is ts.NamedImports {
			return node !== undefined && ts.isNamedImports(node);
		}

		export function file(node?: ts.Node): node is ts.SourceFile {
			return node !== undefined && ts.isSourceFile(node);
		}
	}

	export namespace update {
		/// Expressions

		export function call(
			node: ts.CallExpression,
			expression = node.expression,
			args?: ConvertableExpression[],
			typeArguments?: ts.TypeNode[],
		) {
			return factory.updateCallExpression(
				node,
				expression,
				typeArguments ?? node.typeArguments,
				args?.map((x) => toExpression(x)) ?? node.arguments,
			);
		}

		export function object(node: ts.ObjectLiteralExpression, properties?: ts.ObjectLiteralElementLike[]) {
			return factory.updateObjectLiteralExpression(node, properties ?? node.properties);
		}

		export function propertyAccessExpression(
			node: ts.PropertyAccessExpression,
			expression: ConvertableExpression,
			name: ts.MemberName | string,
		) {
			return factory.updatePropertyAccessExpression(
				node,
				toExpression(expression),
				typeof name === "string" ? f.identifier(name) : name,
			);
		}

		export function elementAccessExpression(
			node: ts.ElementAccessExpression,
			expression: ConvertableExpression,
			name: ConvertableExpression,
		) {
			return factory.updateElementAccessExpression(node, toExpression(expression), toExpression(name));
		}

		/// Statements
		/// Declarations

		export function classDeclaration(
			node: ts.ClassDeclaration,
			name = node.name,
			members: NodeArray<ts.ClassElement> = node.members,
			heritageClauses = node.heritageClauses,
			typeParameters = node.typeParameters,
			modifiers: ONodeArray<ts.ModifierLike> = ts.getModifiers(node),
		) {
			return factory.updateClassDeclaration(node, modifiers, name, typeParameters, heritageClauses, members);
		}

		export function constructor(
			node: ts.ConstructorDeclaration,
			parameters: NodeArray<ts.ParameterDeclaration>,
			body: ts.Block,
		) {
			return factory.updateConstructorDeclaration(node, undefined, parameters, body);
		}

		export function parameterDeclaration(
			node: ts.ParameterDeclaration,
			name = node.name,
			type = node.type,
			initializer = node.initializer,
			modifiers: ONodeArray<ts.ModifierLike> = ts.getModifiers(node),
			isRest = node.dotDotDotToken !== undefined,
			isOptional = node.questionToken !== undefined,
		) {
			return factory.updateParameterDeclaration(
				node,
				modifiers?.length ? modifiers : undefined,
				isRest ? token(ts.SyntaxKind.DotDotDotToken) : undefined,
				name,
				isOptional ? token(ts.SyntaxKind.QuestionToken) : undefined,
				type,
				initializer,
			);
		}

		export function methodDeclaration(
			node: ts.MethodDeclaration,
			name: string | ts.PropertyName = node.name,
			body = node.body,
			parameters: ONodeArray<ts.ParameterDeclaration> = node.parameters,
			typeParameters: ONodeArray<ts.TypeParameterDeclaration> = node.typeParameters,
			modifiers: ONodeArray<ts.ModifierLike> = ts.getModifiers(node),
			isOptional = node.asteriskToken !== undefined,
			type = node.type,
		) {
			return factory.updateMethodDeclaration(
				node,
				modifiers?.length === 0 ? undefined : modifiers,
				undefined,
				typeof name === "string" ? identifier(name) : name,
				isOptional ? factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
				typeParameters?.length === 0 ? undefined : typeParameters,
				parameters,
				type,
				Array.isArray(body) ? f.block(body) : body,
			);
		}

		export function propertyDeclaration(
			node: ts.PropertyDeclaration,
			initializer: ConvertableExpression | null | undefined = node.initializer,
			name = node.name,
			modifiers: ONodeArray<ts.ModifierLike> = ts.getModifiers(node),
			tokenType: "?" | "!" | undefined = node.questionToken ? "?" : node.exclamationToken ? "!" : undefined,
			type = node.type,
		) {
			const syntaxToken =
				tokenType === "!"
					? token(ts.SyntaxKind.ExclamationToken)
					: tokenType === "?"
					? token(ts.SyntaxKind.QuestionToken)
					: undefined;
			return factory.updatePropertyDeclaration(
				node,
				modifiers?.length === 0 ? undefined : modifiers,
				name,
				syntaxToken,
				type,
				!initializer ? undefined : toExpression(initializer),
			);
		}

		export function propertyAssignmentDeclaration(
			node: ts.PropertyAssignment,
			initializer: ConvertableExpression = node.initializer,
			name: ts.PropertyName | string = node.name,
		) {
			return factory.updatePropertyAssignment(
				node,
				typeof name === "string" ? f.identifier(name) : name,
				toExpression(initializer),
			);
		}

		/// Type Nodes
		/// Other
		export function sourceFile(
			sourceFile: ts.SourceFile,
			statements: ts.NodeArray<ts.Statement> | ts.Statement[] = sourceFile.statements,
			isDeclarationFile = sourceFile.isDeclarationFile,
			referencedFiles = sourceFile.referencedFiles,
			typeReferences = sourceFile.typeReferenceDirectives,
			hasNoDefaultLib = sourceFile.hasNoDefaultLib,
			libReferences = sourceFile.libReferenceDirectives,
		) {
			return factory.updateSourceFile(
				sourceFile,
				statements,
				isDeclarationFile,
				referencedFiles,
				typeReferences,
				hasNoDefaultLib,
				libReferences,
			);
		}
	}

	export function setFactory(newFactory: ts.NodeFactory) {
		factory = newFactory;
	}
}