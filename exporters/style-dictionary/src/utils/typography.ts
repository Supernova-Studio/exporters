import { CSSHelper, ColorHelper, normalizeTextWeight, sureOptionalReference, TokenToCSSOptions } from "@supernovaio/export-utils"
import { AnyDimensionTokenValue, AnyOptionTokenValue, AnyStringTokenValue, Token, TokenType, TypographyTokenValue, Unit } from "@supernovaio/sdk-exporters"

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

type DtcgDimensionValue = {
  value: number
  unit: string
}

type TypographyPropertyValue = string | number | DtcgDimensionValue

type TypographyStyleDictionaryValue = Partial<Record<TypographyPropertyName, TypographyPropertyValue>>

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

function withoutWrappingQuotes(value: string): string {
  return value.replace(/^(['"])(.*)\1$/, "$2")
}

function referencedValue(
  value: { referencedTokenId?: string | null },
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): string | null {
  const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
  return reference ? options.tokenToVariableRef(reference) : null
}

function normalizedDimensionValue(
  dimension: AnyDimensionTokenValue,
  options: TokenToCSSOptions
): number | DtcgDimensionValue {
  if (options.forceRemUnit && dimension.unit === Unit.pixels) {
    const remBase = options.remBase || 16
    return {
      value: ColorHelper.roundToDecimals(dimension.measure / remBase, options.decimals),
      unit: "rem"
    }
  }

  if (dimension.unit === Unit.raw) {
    return ColorHelper.roundToDecimals(dimension.measure, options.decimals)
  }

  return {
    value: ColorHelper.roundToDecimals(dimension.measure, options.decimals),
    unit: CSSHelper.unitToCSS(dimension.unit)
  }
}

function dimensionPropertyValue(
  dimension: AnyDimensionTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): string | number | DtcgDimensionValue {
  return referencedValue(dimension, allTokens, options) ?? normalizedDimensionValue(dimension, options)
}

function fontFamilyPropertyValue(
  fontFamily: AnyStringTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): string {
  return referencedValue(fontFamily, allTokens, options) ?? fontFamily.text
}

function fontWeightPropertyValue(
  fontWeight: AnyStringTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): string | number {
  return referencedValue(fontWeight, allTokens, options) ?? normalizeTextWeight(fontWeight.text)
}

function typographyPropertyValue(
  property: TypographyPropertyName,
  value: TypographyTokenValue[TypographyPropertyName],
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): TypographyPropertyValue {
  switch (property) {
    case "fontFamily":
      return fontFamilyPropertyValue(value as AnyStringTokenValue, allTokens, options)
    case "fontWeight":
      return fontWeightPropertyValue(value as AnyStringTokenValue, allTokens, options)
    case "fontSize":
    case "letterSpacing":
    case "paragraphSpacing":
    case "paragraphIndent":
    case "lineHeight":
      return dimensionPropertyValue(value as AnyDimensionTokenValue, allTokens, options)
    // optionTokenValueToCSS resolves references itself
    case "textCase":
      return CSSHelper.optionTokenValueToCSS(value as AnyOptionTokenValue, allTokens, options, TokenType.textCase)
    case "textDecoration":
      return CSSHelper.optionTokenValueToCSS(value as AnyOptionTokenValue, allTokens, options, TokenType.textDecoration)
  }
}

export function typographyTokenValueToStyleDictionaryValue(
  typography: TypographyTokenValue,
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

    const styleDictionaryValue = typographyPropertyValue(property, propertyValue, allTokens, options)
    value[property] = typeof styleDictionaryValue === "string"
      ? withoutWrappingQuotes(styleDictionaryValue)
      : styleDictionaryValue
  })

  return value
}
