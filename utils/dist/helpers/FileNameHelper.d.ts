import { TokenType } from "@supernovaio/sdk-exporters";
import { StringCase } from "../enums/StringCase";
export declare class FileNameHelper {
    /**
     * Ensures a filename has the correct extension
     */
    static ensureFileExtension(fileName: string, extension: string): string;
    /**
     * Replaces file extension
     */
    static replaceFileExtension(fileName: string, oldExt: string, newExt: string): string;
    /**
     * Computes a posix-style relative path between two directory specs.
     *
     * Output module specifiers must use forward slashes regardless of host OS, and
     * the Node `path` module is not always available in bundled exporter runtimes,
     * so this implements the small subset we need without that dependency.
     *
     * Both inputs are interpreted as directory paths. Leading "./" and trailing
     * "/" are stripped before computing.
     *
     * Examples:
     *   posixRelativeDir("darkMode", "base")              -> "../base"
     *   posixRelativeDir("darkMode", "tokens/base")       -> "../tokens/base"
     *   posixRelativeDir("tokens/dark", "tokens/base")    -> "../base"
     *   posixRelativeDir(".", ".")                        -> "."
     */
    static posixRelativeDir(from: string, to: string): string;
    /**
     * Gets the default style file name for a token type
     */
    static getDefaultStyleFileName(type: TokenType, extension?: string, stringCase?: StringCase): string;
}
