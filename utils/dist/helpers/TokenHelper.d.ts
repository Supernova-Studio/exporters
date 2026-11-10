import { Token } from '@supernovaio/sdk-exporters';
/** Finds reference and makes sure it exists if reference was provided. If null was provided, null is on the output as well to make seeking outside few lines smaller */
export declare function sureOptionalReference(referenceId: string | undefined | null, allTokens: Map<string, Token>, allowReferences?: boolean): Token | null;
export declare function normalizeTextWeight(weight: string): number;
