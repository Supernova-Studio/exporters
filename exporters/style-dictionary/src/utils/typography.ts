import { CSSHelper, sureOptionalReference, TokenToCSSOptions } from "@supernovaio/export-utils"
import { Token, TokenType, TypographyTokenValue } from "@supernovaio/sdk-exporters"

type TypographyPropertyName =
  | "fontFamily"
  | "fontWeight"
  | "fontSize"
  | "lineHeight"
  | "paragraphSpacing"
  | "textCase"
  | "letterSpacing"
  | "paragraphIndent"
  | "textDecoration"

type TypographyStyleDictionaryValue = Partial<Record<TypographyPropertyName, string>>

const TYPOGRAPHY_PROPERTY_ORDER: TypographyPropertyName[] = [
  "fontFamily",
  "fontWeight",
  "fontSize",
  "lineHeight",
  "paragraphSpacing",
  "textCase",
  "letterSpacing",
  "paragraphIndent",
  "textDecoration"
]

const TYPOGRAPHY_PROPERTY_TOKEN_TYPES: Record<TypographyPropertyName, TokenType> = {
  fontFamily: TokenType.fontFamily,
  fontWeight: TokenType.fontWeight,
  fontSize: TokenType.fontSize,
  lineHeight: TokenType.lineHeight,
  paragraphSpacing: TokenType.paragraphSpacing,
  textCase: TokenType.textCase,
  letterSpacing: TokenType.letterSpacing,
  paragraphIndent: TokenType.paragraphSpacing,
  textDecoration: TokenType.textDecoration
}

function withoutWrappingQuotes(value: string): string {
  return value.replace(/^(['"])(.*)\1$/, "$2")
}

export function typographyTokenValueToStyleDictionaryValue(
  typography: TypographyTokenValue,
  sourceToken: Token,
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): string | TypographyStyleDictionaryValue {
  const reference = sureOptionalReference(typography.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }

  const value: TypographyStyleDictionaryValue = {}

  TYPOGRAPHY_PROPERTY_ORDER.forEach((property) => {
    const propertyValue = typography[property]
    if (propertyValue === undefined || propertyValue === null) {
      return
    }

    const cssValue = CSSHelper.tokenToCSS(
      {
        ...sourceToken,
        tokenType: TYPOGRAPHY_PROPERTY_TOKEN_TYPES[property],
        value: propertyValue
      } as unknown as Token,
      allTokens,
      options
    )

    value[property] = withoutWrappingQuotes(cssValue)
  })

  return value
}
