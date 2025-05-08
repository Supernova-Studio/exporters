import { CSSHelper } from "@supernovaio/export-utils";
import type { Token, TypographyToken, TypographyTokenValue, TextCase, TextDecoration } from "@supernovaio/sdk-exporters";
import { TokenType } from "@supernovaio/sdk-exporters";
import { exportConfiguration } from ".."; 

export type TokenRecord = Record<string, string | number>;

/**
 * Creates a structured object for typography tokens, formatted for Style Dictionary output.
 * 
 * @param token - The token to process, must be of type TypographyToken
 * @param mappedTokens - Map of all available tokens for reference resolution
 * @returns A TokenRecord containing formatted typography properties or null if token is not a typography token
 * 
 * @example
 * ```typescript
 * const typographyToken = // ... typography token
 * const mappedTokens = new Map<string, Token>();
 * const result = createTypographyObject(typographyToken, mappedTokens);
 * // Returns: {
 * //   fontFamily: "Inter",
 * //   fontWeight: "400",
 * //   fontSize: "16px",
 * //   lineHeight: "24px",
 * //   letterSpacing: "0px",
 * //   textDecoration: "none",
 * //   textCase: "none",
 * //   paragraphIndent: "0px",
 * //   paragraphSpacing: "0px"
 * // }
 * ```
 */
export function createTypographyObject(
  token: Token,
  mappedTokens: Map<string, Token>
): TokenRecord | null {
  if (token.tokenType !== TokenType.typography) {
    return null;
  }

  const typographyToken = token as TypographyToken;
  const typographyValue = typographyToken.value as TypographyTokenValue;

  return {
    fontFamily: typographyValue.fontFamily.text,
    fontWeight: typographyValue.fontWeight.text,
    fontSize: CSSHelper.dimensionTokenValueToCSS(typographyValue.fontSize, mappedTokens, {
      allowReferences: exportConfiguration.useReferences,
      decimals: exportConfiguration.colorPrecision,
      colorFormat: exportConfiguration.colorFormat,
      forceRemUnit: exportConfiguration.forceRemUnit,
      remBase: exportConfiguration.remBase,
      tokenToVariableRef: () => '' 
    }),
    lineHeight: typographyValue.lineHeight ? CSSHelper.dimensionTokenValueToCSS(typographyValue.lineHeight, mappedTokens, {
      allowReferences: exportConfiguration.useReferences,
      decimals: exportConfiguration.colorPrecision,
      colorFormat: exportConfiguration.colorFormat,
      forceRemUnit: exportConfiguration.forceRemUnit,
      remBase: exportConfiguration.remBase,
      tokenToVariableRef: () => ''
    }) : "0px",
    letterSpacing: typographyValue.letterSpacing ? CSSHelper.dimensionTokenValueToCSS(typographyValue.letterSpacing, mappedTokens, {
      allowReferences: exportConfiguration.useReferences,
      decimals: exportConfiguration.colorPrecision,
      colorFormat: exportConfiguration.colorFormat,
      forceRemUnit: exportConfiguration.forceRemUnit,
      remBase: exportConfiguration.remBase,
      tokenToVariableRef: () => ''
    }) : "0px",
    textDecoration: CSSHelper.textDecorationToCSS(typographyValue.textDecoration.value as TextDecoration),
    textCase: CSSHelper.textCaseToCSS(typographyValue.textCase.value as TextCase),
    paragraphIndent: typographyValue.paragraphIndent ? CSSHelper.dimensionTokenValueToCSS(typographyValue.paragraphIndent, mappedTokens, {
      allowReferences: exportConfiguration.useReferences,
      decimals: exportConfiguration.colorPrecision,
      colorFormat: exportConfiguration.colorFormat,
      forceRemUnit: exportConfiguration.forceRemUnit,
      remBase: exportConfiguration.remBase,
      tokenToVariableRef: () => ''
    }) : "0px",
    paragraphSpacing: typographyValue.paragraphSpacing ? CSSHelper.dimensionTokenValueToCSS(typographyValue.paragraphSpacing, mappedTokens, {
      allowReferences: exportConfiguration.useReferences,
      decimals: exportConfiguration.colorPrecision,
      colorFormat: exportConfiguration.colorFormat,
      forceRemUnit: exportConfiguration.forceRemUnit,
      remBase: exportConfiguration.remBase,
      tokenToVariableRef: () => ''
    }) : "0px"
  };
} 
