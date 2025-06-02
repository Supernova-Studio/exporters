import { AnyDimensionTokenValue, AnyOptionTokenValue, AnyStringTokenValue, BlurTokenValue, BorderTokenValue, ColorTokenValue, GradientTokenValue, ShadowTokenValue, TextCase, TextDecoration, Token, TokenType, TypographyTokenValue, Unit, VisibilityType } from "@supernovaio/sdk-exporters";
import { ColorFormatOptions } from "./ColorHelper";
type InternalOptions = ColorFormatOptions & {
    indent: number;
};
export type TokenToKotlinOptions = Omit<InternalOptions, "rawColorTokenFormatter">;
export declare class KotlinHelper {
    static tokenValue(token: Token, allTokens: Map<string, Token>, options: TokenToKotlinOptions): string;
    static colorTokenValueToKotlin(color: ColorTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string;
    static borderTokenValueToKotlin(border: BorderTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string;
    static gradientTokenValueToKotlin(gradients: Array<GradientTokenValue>, allTokens: Map<string, Token>, options: InternalOptions): string;
    /** Converts one gradient layer to a Brush literal */
    static gradientLayerToKotlin(value: GradientTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string;
    static shadowTokenValueToKotlin(shadows: Array<ShadowTokenValue>, allTokens: Map<string, Token>, options: InternalOptions): string;
    static shadowLayerToKotlin(value: ShadowTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string;
    static dimensionTokenValueToKotlin(dimension: AnyDimensionTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string;
    /** Maps Supernova units to Kotlin / Compose extension suffixes */
    static unitToKotlin(unit: Unit): string;
    static stringTokenValueToKotlin(value: AnyStringTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string;
    static optionTokenValueToKotlin(option: AnyOptionTokenValue, allTokens: Map<string, Token>, options: InternalOptions, tokenType: TokenType): string;
    static textCaseToKotlin(textCase: TextCase): string;
    static textDecorationToKotlin(textDecoration: TextDecoration): string;
    static visibilityToKotlin(visibility: VisibilityType): string;
    static blurTokenValueToKotlin(blur: BlurTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string;
    static fontWeightTokenValueToKotlin(value: AnyStringTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string;
    static fontWeightIntToKotlin(weight: number): string;
    static typographyTokenValueToKotlin(typography: TypographyTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string;
}
export {};
