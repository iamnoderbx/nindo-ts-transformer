"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transformer_1 = require("./transformer");
const factory_1 = require("./modding/factory");
const viewFile_1 = require("./information/viewFile");
const transformFile_1 = require("./transformations/transformFile");
function scanFile(context, file) {
    const result = (0, transformFile_1.transformFile)(context, file);
    return result;
}
function collectFileInformation(context, file) {
    (0, viewFile_1.viewFile)(context, file);
}
;
function isDescendantOfSrcDirectory(filePath) {
    const srcDirectory = "/src/";
    return filePath.includes(srcDirectory);
}
/**
 * The transformer entry point.
 * This provides access to necessary resources and the user specified configuration.
 */
/**
 * The transformer entry point.
 * This provides access to necessary resources and the user specified configuration.
 */
function default_1(program, config) {
    return (transformationContext) => {
        const context = new transformer_1.TransformContext(program, transformationContext, config);
        factory_1.f.setFactory(context.factory);
        let hasCollectedInformation = false;
        return (file) => {
            if (!hasCollectedInformation) {
                hasCollectedInformation = true;
                program.getSourceFiles().forEach((file) => {
                    if (isDescendantOfSrcDirectory(file.fileName)) {
                        collectFileInformation(context, file);
                    }
                    ;
                });
            }
            ;
            if (isDescendantOfSrcDirectory(file.fileName) && !file.fileName.includes("core-framework")) {
                const updatedFile = scanFile(context, file);
                return updatedFile;
            }
            return file;
        };
    };
}
exports.default = default_1;
