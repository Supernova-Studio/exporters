import {
  AnyDimensionToken,
  AnyDimensionTokenValue, AnyStringToken, AnyStringTokenValue,
  BorderToken, BorderTokenValue,
  ColorToken,
  ColorTokenValue,
  Token,
  TokenType, Unit,
  UnreachableCaseError
} from "@supernovaio/sdk-exporters"
import {
  ColorFormat,
  ColorFormatOptions,
  ColorHelper,
  sureOptionalReference, TokenToCSSOptions
} from "@supernovaio/export-utils"

export type TokenToKotlinOptions = ColorFormatOptions

export function tokenValue(
  token: Token,
  allTokens: Map<string, Token>,
  options: TokenToKotlinOptions
): string {
  //todo remove default value
  /** Use subroutines to convert specific token types to different representations. Many tokens are of the same type */
  let value: string = ""
  switch (token.tokenType) {
    case TokenType.color:
      value = convertColorToken((token as ColorToken).value, allTokens, options)
      break
    case TokenType.border:
      // value = convertBorderToken((token as BorderToken).value, allTokens, options)
      break
    case TokenType.gradient:
      // value = this.gradientTokenValueToCSS((token as GradientToken).value, allTokens, options)
      break
    case TokenType.dimension:
    case TokenType.size:
    case TokenType.space:
    case TokenType.opacity:
    case TokenType.fontSize:
    case TokenType.lineHeight:
    case TokenType.letterSpacing:
    case TokenType.paragraphSpacing:
    case TokenType.borderWidth:
    case TokenType.radius:
    case TokenType.duration:
    case TokenType.zIndex:
      value = convertDimensionToken((token as AnyDimensionToken).value, allTokens, options)
      break
    case TokenType.shadow:
      // value = this.shadowTokenValueToCSS((token as ShadowToken).value, allTokens, options)
      break
    case TokenType.fontWeight:
      // value = this.fontWeightTokenValueToCSS((token as FontWeightToken).value, allTokens, options)
      break
    case TokenType.fontFamily:
    case TokenType.productCopy:
    case TokenType.string:
      value = convertStringToken((token as AnyStringToken).value, allTokens, options)
      break
    case TokenType.textCase:
    case TokenType.textDecoration:
    case TokenType.visibility:
      // value = this.optionTokenValueToCSS((token as AnyOptionToken).value, allTokens, options, token.tokenType)
      break
    case TokenType.blur:
      // value = this.blurTokenValueToCSS((token as BlurToken).value, allTokens, options)
      break
    case TokenType.typography:
      // value = this.typographyTokenValueToCSS((token as TypographyToken).value, allTokens, options)
      break
    default:
      throw new UnreachableCaseError(token.tokenType, "Unsupported token type for transformation:")
  }

  // Allow value transformation if transformer exists
  // if (options.valueTransformer) {
  //   const transformedValue = options.valueTransformer(value, token)
  //   if (transformedValue !== undefined) {
  //     return transformedValue
  //   }
  // }


  return value
}

//todo fix options
//todo rem? - config option
function convertColorToken(
  color: ColorTokenValue,
  allTokens: Map<string, Token>,
  options: ColorFormatOptions
): string {
  //todo test partial references
  return ColorHelper.formattedColorOrVariableName(color, allTokens, options)
}

//todo fix options
function convertBorderToken(
  border: BorderTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToKotlinOptions
): string {
  //todo
  const reference = sureOptionalReference(border.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }
  const data = {
    width: this.dimensionTokenValueToCSS(border.width, allTokens, options),
    style: this.borderStyleToCSS(border.style),
    color: convertColorToken(border.color, allTokens, options),
    position: this.borderPositionToCSS(border.position) // Not used for now
  }
  return `${data.width} ${data.style} ${data.color}`
}

function convertDimensionToken(
  dimension: AnyDimensionTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToKotlinOptions
): string {
  const reference = sureOptionalReference(dimension.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }

  const rounded = ColorHelper.roundToDecimals(dimension.measure, options.decimals)

  // Percent requires scaling to 0-1 for Kotlin float
  if (dimension.unit === Unit.percent) {
    const fraction = +(rounded) / 100
    return `${fraction}f`
  }

  return `${rounded}${unitToKotlin(dimension.unit)}`
}

/** Maps Supernova units to Kotlin / Compose extension suffixes */
function unitToKotlin(unit: Unit): string {
  switch (unit) {
    case Unit.percent:
      // Float literal (0.5f)
      return "f"
    case Unit.pixels:
      // density‑independent pixels
      return ".dp"
    case Unit.rem:
      // scale‑independent pixels for typography
      return ".sp"
    case Unit.ms:
    case Unit.raw:
      // plain number
      return ""
    default:
      return ".dp"
  }
}

function convertStringToken(
  value: AnyStringTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToCSSOptions
): string {
  const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }
  return `"${value.text}"`
}
