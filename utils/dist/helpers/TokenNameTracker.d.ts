import { Token, TokenGroup } from "@supernovaio/sdk-exporters";
import { StringCase } from "../enums/StringCase";
export declare class TokenNameTracker {
    private tokenNameMap;
    private nameToTokenMap;
    reset(): void;
    getTokenName(token: Token, tokenGroups: Array<TokenGroup>, format: StringCase, prefix: string | null, forExport?: boolean): string;
}
