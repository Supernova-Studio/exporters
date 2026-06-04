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

function referencedValue(
  value: { referencedTokenId?: string | null },
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): string | null {
  const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
  return reference ? options.tokenToVariableRef(reference) : null
}

function unitToDtcgUnit(unit: Unit): string {
  switch (unit) {
    case Unit.percent:
      return "%"
    case Unit.pixels:
      return "px"
    case Unit.rem:
      return "rem"
    case Unit.ms:
      return "ms"
    case Unit.raw:
      return ""
    default:
      return "px"
  }
}

function normalizedDimensionValue(
  dimension: AnyDimensionTokenValue,
  options: TokenToCSSOptions
): DtcgDimensionValue {
  if (options.forceRemUnit && dimension.unit === Unit.pixels) {
    const remBase = options.remBase || 16
    return {
      value: ColorHelper.roundToDecimals(dimension.measure / remBase, options.decimals),
      unit: "rem"
    }
  }

  return {
    value: ColorHelper.roundToDecimals(dimension.measure, options.decimals),
    unit: unitToDtcgUnit(dimension.unit)
  }
}

function dimensionPropertyValue(
  dimension: AnyDimensionTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): string | DtcgDimensionValue {
  return referencedValue(dimension, allTokens, options) ?? normalizedDimensionValue(dimension, options)
}

function lineHeightPropertyValue(
  lineHeight: AnyDimensionTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): string | number {
  const reference = referencedValue(lineHeight, allTokens, options)
  if (reference) {
    return reference
  }

  if (lineHeight.unit === Unit.raw) {
    return ColorHelper.roundToDecimals(lineHeight.measure, options.decimals)
  }

  return CSSHelper.dimensionTokenValueToCSS(lineHeight, allTokens, options)
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

function optionPropertyValue(
  option: AnyOptionTokenValue,
  tokenType: TokenType,
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): string {
  return referencedValue(option, allTokens, options) ?? CSSHelper.optionTokenValueToCSS(option, allTokens, options, tokenType)
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
      return dimensionPropertyValue(value as AnyDimensionTokenValue, allTokens, options)
    case "lineHeight":
      return lineHeightPropertyValue(value as AnyDimensionTokenValue, allTokens, options)
    case "textCase":
    case "textDecoration":
      return optionPropertyValue(value as AnyOptionTokenValue, TYPOGRAPHY_PROPERTY_TOKEN_TYPES[property], allTokens, options)
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
