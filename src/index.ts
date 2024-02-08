import ts, { first } from "typescript";
import { TransformContext, TransformerConfig } from "./transformer";
import { f } from "./modding/factory";
import { viewFile } from "./information/viewFile";
import { transformFile } from "./transformations/transformFile";

/**
 * @file index.ts
 * @author iAmNode
 */


// Define a function to transform a file and return the result
function scanFile(context : TransformContext, file: ts.SourceFile): ts.SourceFile {
	const result = transformFile(context, file);
	return result
}

// Define a function to view a file
function collectFileInformation(context : TransformContext, file: ts.SourceFile) {
	viewFile(context, file)
};

// Define a function to check if a file path is a descendant of the src directory
function isDescendantOfSrcDirectory(filePath: string): boolean {
	const srcDirectory = "/src/";
	return filePath.includes(srcDirectory);
}

/**
 * The transformer entry point.
 * This provides access to necessary resources and the user specified configuration.
 */
export default function (program: ts.Program, config: TransformerConfig) {
	return (transformationContext: ts.TransformationContext): ((file: ts.SourceFile) => ts.Node) => {
		// Create a new transformation context
		const context = new TransformContext(program, transformationContext, config);
		f.setFactory(context.factory);

		// Initialize a flag to indicate whether information has been collected
		let hasCollectedInformation = false;

		return(file) => {
			// If information has not been collected
			if (!hasCollectedInformation) {
				// Set the flag to true
				hasCollectedInformation = true;

				// Collect information from each source file in the program
				program.getSourceFiles().forEach((file) => {
					if (isDescendantOfSrcDirectory(file.fileName)) {
						collectFileInformation(context, file);
					};
				});
			};

			// If the file is a descendant of the src directory and does not include "core-framework"
			if (isDescendantOfSrcDirectory(file.fileName) && !file.fileName.includes("core-framework")) {
				// Transform the file and return the result
				const updatedFile = scanFile(context, file);
				return updatedFile;
			}

			// If the file does not meet the conditions, return it as is
			return file;
		};
	};
}