import { Token, TokenGroup } from "@supernovaio/sdk-exporters";
import { StringCase } from "../enums/StringCase";
import { RepeatedWords } from "../enums/RepeatedWords";
export declare class NamingHelper {
    /**
     * Helper method to apply find/replace patterns to a string
     * @param text The text to apply replacements to
     * @param findReplace Record of find/replace patterns
     * @returns The text with all replacements applied
     */
    private static applyFindReplace;
    /**
     * Builds a token's variable name from the prefix, its group path and its name. By default, a word repeated where two
     * of these parts meet is written once ("Neutral" + "Neutral 500" → neutral-500); a word repeated inside one part is kept.
     * Keep writes every word ("Neutral" + "Neutral 500" → neutral-neutral-500)
     */
    static codeSafeVariableNameForToken(token: Pick<Token, 'name'>, format: StringCase, parent: Pick<TokenGroup, 'path' | 'isRoot' | 'name'> | null, prefix: string | null, findReplace?: Record<string, string>, repeatedWords?: RepeatedWords): string;
    /**
     * Transforms name into specific case from provided path fragments. Will also smartly split fragments into subfragments -
     * if they contain spaces, case changes from one letter to another and so on.
     *
     * Also fixes additional problems, like the fact that variable name can't start with numbers - variable will be prefixed with "_" in that case
     */
    static codeSafeVariableName(fragments: Array<string> | string, format: StringCase, findReplace?: Record<string, string>, repeatedWords?: RepeatedWords): string;
    /** Convert any string to CSS variable reference */
    static nameAsCSSVarReference(name: string): string;
    /** Convert any string to CSS variable declaration */
    static nameAsCSSVarDeclaration(name: string): string;
}
