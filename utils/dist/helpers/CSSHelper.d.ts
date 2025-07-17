import { BorderPosition, BorderStyle, TextCase, TextDecoration, Token, TokenType, Unit } from '@supernovaio/sdk-exporters';
import { AnyDimensionTokenValue, AnyOptionTokenValue, AnyStringTokenValue, BlurTokenValue, BorderTokenValue, ColorTokenValue, GradientTokenValue, ShadowTokenValue, TypographyTokenValue } from '@supernovaio/sdk-exporters';
import { ColorFormat } from '../enums/ColorFormat';
export type TokenToCSSOptions = {
    /** Whether to allow references to other tokens */
    allowReferences: boolean;
    /** Number of decimals to round any number to */
    decimals: number;
    /** Color format */
    colorFormat: ColorFormat;
    /** Function to convert token to variable reference. Only used when allowReferences is true and reference is detected */
    tokenToVariableRef: (token: Token, context?: {
        needsRgb?: boolean;
    }) => string;
    /** Force conversion of pixel values to rem */
    forceRemUnit?: boolean;
    /** Base value for rem conversion (default: 16) */
    remBase?: number;
    /** Optional transformer for CSS values based on token type and value */
    valueTransformer?: (value: string, token: Token) => string | undefined;
};
/** A utility class to help with transformation of tokens and Supernova token-like values to various formats */
export declare class CSSHelper {
    /**
     * Helper function to handle color with custom opacity, using channel-based utilities when available
     */
    private static handleColorWithCustomOpacity;
    static tokenToCSS(token: Token, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static colorTokenValueToCSS(color: ColorTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static borderTokenValueToCSS(border: BorderTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static gradientTokenValueToCSS(gradients: Array<GradientTokenValue>, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    /** Converts gradient token value to css definition */
    static gradientLayerToCSS(value: GradientTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static dimensionTokenValueToCSS(dimension: AnyDimensionTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static shadowTokenValueToCSS(shadows: Array<ShadowTokenValue>, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static shadowLayerToCSS(value: ShadowTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static fontWeightTokenValueToCSS(value: AnyStringTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static stringTokenValueToCSS(value: AnyStringTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static optionTokenValueToCSS(option: AnyOptionTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions, tokenType: TokenType): string;
    static blurTokenValueToCSS(blur: BlurTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static typographyTokenValueToCSS(typography: TypographyTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string;
    static borderStyleToCSS(borderStyle: BorderStyle): string;
    static borderPositionToCSS(borderPosition: BorderPosition): string;
    static unitToCSS(unit: Unit): string;
    static textCaseToCSS(textCase: TextCase): string;
    static textDecorationToCSS(textDecoration: TextDecoration): string;
}
