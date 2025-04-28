import { Token, TokenGroup } from "@supernovaio/sdk-exporters";
import { StringCase } from "../enums/StringCase";
export declare class NamingHelper {
    static codeSafeVariableNameForToken(token: Pick<Token, 'name'>, format: StringCase, parent: Pick<TokenGroup, 'path' | 'isRoot' | 'name'> | null, prefix: string | null, collectionName?: string | null, globalPrefix?: string | null): string;
    /**
     * Transforms name into specific case from provided path fragments. Will also smartly split fragments into subfragments -
     * if they contain spaces, case changes from one letter to another and so on.
     *
     * Also fixes additional problems, like the fact that variable name can't start with numbers - variable will be prefixed with "_" in that case
     */
    static codeSafeVariableName(fragments: Array<string> | string, format: StringCase): string;
    /** Convert any string to CSS variable reference */
    static nameAsCSSVarReference(name: string): string;
    /** Convert any string to CSS variable declaration */
    static nameAsCSSVarDeclaration(name: string): string;
}
