import ts from "typescript";
import { f } from "./factory";

/**
 * @file symbols.ts
 * @author iAmNode
 */

/**
 * Enum for metatag types.
 */
enum MetatagTypes {
    START = 1,
}

/**
 * Class for meta tags.
 */
class MetaTag {
    constructor(public id: MetatagTypes, public value: any) {}
}

/**
 * Class for providing symbols.
 */
class SymbolProvider {
    public fileSymbols = new Map<string, FileSymbol>();
    public sources = new Map<string, FileSymbol>();
    public taggedClasses : Array<ClassSymbol>

    constructor() {
        this.taggedClasses = [];
    }

    /**
     * Get file symbol from source.
     */
    getFileSymbolFromSource(src: string) {
        return this.sources.get(src);
    }

    /**
     * Register file symbol.
     */
    registerFileSymbol(file: ts.SourceFile) {
        const fileSymbol = new FileSymbol(this, file)

        this.fileSymbols.set(file.fileName, fileSymbol);
        this.sources.set(fileSymbol.source, fileSymbol);
    };
}

/**
 * Class for class symbols.
 */
class ClassSymbol {
    classSymbol: any;
    metatags: Array<MetatagTypes>

    constructor(
        public fileSymbol: FileSymbol,
        public node: ts.ClassDeclaration,
    ) {
        this.metatags = [];
    }

    /**
     * Check if class symbol has a specific meta tag.
     */
    hasMetaTag(tag: MetatagTypes) {
        return this.metatags.includes(tag);
    }

    /**
     * Add a meta tag to class symbol.
     */
    addMetaTag(tag: MetaTag) {
        this.metatags.push(tag.id);

        if(!this.fileSymbol.provider.taggedClasses.includes(this)) {
            this.fileSymbol.provider.taggedClasses.push(this);
        };
    }
}

/**
 * @file symbols.ts
 * @author iAmNode
 */

/**
 * Class for file symbols.
 */
class FileSymbol {
    public classes = new Map<string, ClassSymbol>();
    public imports: {name: string, directory: string}[] = []

    source: string;

    /**
     * Constructs a new FileSymbol instance.
     * @param {SymbolProvider} provider - The symbol provider.
     * @param {ts.SourceFile} file - The TypeScript source file.
     */
    constructor(public provider : SymbolProvider, public file: ts.SourceFile) {
        this.register()

        const filePath = file.fileName;
        const srcIndex = filePath.indexOf("/src/");
        const trimmedFileName = srcIndex !== -1 ? filePath.substring(srcIndex + 5) : filePath;
        const fileNameWithoutExtension = trimmedFileName.replace(/\.(ts|tsx)$/, '');

        this.source = fileNameWithoutExtension;
    }

    /**
     * Registers a class symbol.
     * @param {ts.ClassDeclaration} node - The class declaration node.
     */
    private registerClass(node: ts.ClassDeclaration) {
        if (!node.name) return;
        
        const classSymbol = new ClassSymbol(this, node);
        this.classes.set(node.name.text, classSymbol);
    }

    /**
     * Adds a file import.
     * @param {string} name - The name of the import.
     * @param {string} directory - The directory of the import.
     */
    addFileImport(name: string, directory: string) {
        if (this.imports.filter(e => e.name === name).length > 0) {
            return;
        }

        this.imports.push({
            name: name,
            directory: directory,
        })
    }

    /**
     * Registers all class declarations in the file.
     */
    register() {
        for (const statement of this.file.statements) {
            if (f.is.classDeclaration(statement)) {
                this.registerClass(statement)
            };
        };
    }
}

export { SymbolProvider, MetaTag, MetatagTypes, ClassSymbol }