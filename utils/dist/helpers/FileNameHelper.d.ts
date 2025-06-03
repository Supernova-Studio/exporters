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
     * Gets the default style file name for a token type
     */
    static getDefaultStyleFileName(type: TokenType, extension?: string, stringCase?: StringCase): string;
}
