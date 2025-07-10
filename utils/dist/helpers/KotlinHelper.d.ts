import { AnyDimensionTokenValue, AnyOptionTokenValue, AnyStringTokenValue, BlurTokenValue, BorderTokenValue, ColorTokenValue, GradientTokenValue, ShadowTokenValue, TextCase, TextDecoration, Token, TokenType, TypographyTokenValue, Unit, VisibilityType } from "@supernovaio/sdk-exporters";
import { ColorFormatOptions } from "./ColorHelper";
export declare enum ImportFlag {
    Color = 0,
    Dp = 1,
    Sp = 2,
    Em = 3,
    Offset = 4,
    Brush = 5,
    TileMode = 6,
    Shadow = 7,
    BorderStroke = 8,
    Modifier = 9,
    Blur = 10,
    Font = 11,
    FontFamily = 12,
    FontWeight = 13,
    TextDecoration = 14,
    TextStyle = 15,
    R = 16
}
/** Collect flags while generating literals, turn into imports at the end */
export declare class ImportCollector {
    private readonly rPackageName;
    private importFlags;
    constructor(rPackageName: string);
    /**
     * Marks a specific feature to be imported.
     * @param flags
     */
    use(...flags: ImportFlag[]): void;
    /**
     * Output a list of all sorted import literals needed for the specified tokens.
     */
    allImports(): string[];
}
export type TokenToKotlinOptions = Pick<ColorFormatOptions, "allowReferences" | "decimals" | "tokenToVariableRef"> & {
    indent: number;
};
/**
 * A utility class for working with Kotlin code generation for various token types.
 * This class provides methods to transform design tokens (e.g., colors, borders, gradients, shadows) into Kotlin representations.
 */
export declare class KotlinHelper {
    /**
     * Converts a given token to its Kotlin string representation based on its type.
     *
     * @param token - The token to be converted.
     * @param allTokens - A map of all tokens, used for reference during conversion.
     * @param options - The options used to customize the token conversion process.
     * @param importCollector - An object responsible for managing and collecting imports needed for the Kotlin representation.
     * @return The Kotlin string representation of the given token.
     */
    static tokenValue(token: Token, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    static colorTokenValueToKotlin(color: ColorTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    static borderTokenValueToKotlin(border: BorderTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    static gradientTokenValueToKotlin(gradients: Array<GradientTokenValue>, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    /** Converts one gradient layer to a Brush literal */
    static gradientLayerToKotlin(value: GradientTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    static shadowTokenValueToKotlin(shadows: Array<ShadowTokenValue>, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    static shadowLayerToKotlin(value: ShadowTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    static dimensionTokenValueToKotlin(dimension: AnyDimensionTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    /** Always output a Compose TextUnit value (sp or em) for typography tokens */
    static textUnitTokenValueToKotlin(dimension: AnyDimensionTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector, useEmForPercent?: boolean): string;
    /**
     * Converts letter-spacing tokens to Compose TextUnit.
     * Percentage values correspond to em units, hence the final `true` flag.
     */
    static letterSpacingTokenValueToKotlin(dimension: AnyDimensionTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    /** Maps Supernova units to Kotlin / Compose extension suffixes */
    static unitToKotlin(unit: Unit, importCollector: ImportCollector): string;
    static stringTokenValueToKotlin(value: AnyStringTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions): string;
    static optionTokenValueToKotlin(option: AnyOptionTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, tokenType: TokenType, importCollector: ImportCollector): string;
    static textCaseToKotlin(textCase: TextCase): string;
    static textDecorationToKotlin(textDecoration: TextDecoration, importCollector: ImportCollector): string;
    static visibilityToKotlin(visibility: VisibilityType): string;
    static blurTokenValueToKotlin(blur: BlurTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    static fontWeightTokenValueToKotlin(value: AnyStringTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    static fontWeightIntToKotlin(weight: number, importCollector: ImportCollector): string;
    static fontFamilyTokenValueToKotlin(value: AnyStringTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
    static typographyTokenValueToKotlin(typography: TypographyTokenValue, allTokens: Map<string, Token>, options: TokenToKotlinOptions, importCollector: ImportCollector): string;
}
