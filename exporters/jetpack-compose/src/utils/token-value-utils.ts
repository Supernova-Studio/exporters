import {
  AnyDimensionToken,
  AnyDimensionTokenValue,
  AnyOptionToken,
  AnyOptionTokenValue,
  AnyStringToken,
  AnyStringTokenValue,
  BlurToken,
  BlurTokenValue,
  BorderToken,
  BorderTokenValue,
  ColorToken,
  ColorTokenValue, FontWeightToken,
  TextCase,
  TextDecoration,
  Token,
  TokenType,
  Unit,
  UnreachableCaseError,
  VisibilityType
} from "@supernovaio/sdk-exporters"
import {
  ColorFormat,
  ColorFormatOptions,
  ColorHelper,
  sureOptionalReference, TokenToCSSOptions
} from "@supernovaio/export-utils"

export type TokenToKotlinOptions = ColorFormatOptions

//todo extract to kotlinhelper
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
      value = colorTokenValueToKotlin((token as ColorToken).value, allTokens, options)
      break
    case TokenType.border:
      // value = borderTokenValueToKotlin((token as BorderToken).value, allTokens, options)
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
      value = dimensionTokenValueToKotlin((token as AnyDimensionToken).value, allTokens, options)
      break
    case TokenType.shadow:
      // value = this.shadowTokenValueToCSS((token as ShadowToken).value, allTokens, options)
      break
    case TokenType.fontWeight:
      value = fontWeightTokenValueToKotlin((token as FontWeightToken).value, allTokens, options)
      break
    case TokenType.fontFamily:
    case TokenType.productCopy:
    case TokenType.string:
      value = stringTokenValueToKotlin((token as AnyStringToken).value, allTokens, options)
      break
    case TokenType.textCase:
    case TokenType.textDecoration:
    case TokenType.visibility:
      value = optionTokenValueToKotlin((token as AnyOptionToken).value, allTokens, options, token.tokenType)
      break
    case TokenType.blur:
      value = blurTokenValueToKotlin((token as BlurToken).value, allTokens, options)
      break
    case TokenType.typography:
      // value = this.typographyTokenValueToCSS((token as TypographyToken).value, allTokens, options)
      break
    default:
      throw new UnreachableCaseError(token.tokenType, "Unsupported token type for transformation:")
  }

  return value
}

//todo fix options
//todo rem? - config option
function colorTokenValueToKotlin(
  color: ColorTokenValue,
  allTokens: Map<string, Token>,
  options: ColorFormatOptions
): string {
  //todo test partial references
  return ColorHelper.formattedColorOrVariableName(color, allTokens, options)
}

function borderTokenValueToKotlin(
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
    color: colorTokenValueToKotlin(border.color, allTokens, options),
    position: this.borderPositionToCSS(border.position) // Not used for now
  }
  return `${data.width} ${data.style} ${data.color}`
}

function dimensionTokenValueToKotlin(
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

function stringTokenValueToKotlin(
  value: AnyStringTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToKotlinOptions
): string {
  const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }
  return `"${value.text}"`
}

function optionTokenValueToKotlin(
  option: AnyOptionTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToKotlinOptions,
  tokenType: TokenType
): string {
  const reference = sureOptionalReference(option.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }
  if (tokenType === TokenType.textCase) {
    return textCaseToKotlin(option.value as TextCase)
  }
  if (tokenType === TokenType.textDecoration) {
    return textDecorationToKotlin(option.value as TextDecoration)
  }

  return visibilityToKotlin(option.value as VisibilityType)
}


function textCaseToKotlin(textCase: TextCase): string {
  // Compose has no built-in enum yet, so export as a string constant
  switch (textCase) {
    case TextCase.original:
      return `"none"`
    case TextCase.upper:
      return `"uppercase"`
    case TextCase.lower:
      return `"lowercase"`
    case TextCase.camel:
      return `"capitalize"`
    case TextCase.smallCaps:
      return `"smallCaps"`
  }
}

//todo import to the file
function textDecorationToKotlin(textDecoration: TextDecoration): string {
  // Map directly onto androidx.compose.ui.text.TextDecoration
  switch (textDecoration) {
    case TextDecoration.original:
      return "TextDecoration.None"
    case TextDecoration.underline:
      return "TextDecoration.Underline"
    case TextDecoration.strikethrough:
      return "TextDecoration.LineThrough"
  }
}

function visibilityToKotlin(visibility: VisibilityType): string {
  return visibility === VisibilityType.visible ? "true" : "false"
}

function blurTokenValueToKotlin(blur: BlurTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string {
  const reference = sureOptionalReference(blur.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }
  return `Modifier.blur(${dimensionTokenValueToKotlin(blur.radius, allTokens, options)})`
}

function fontWeightTokenValueToKotlin(
  value: AnyStringTokenValue,
  allTokens: Map<string, Token>,
  options: TokenToKotlinOptions
): string {
  const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }

  // Convert text weights to numerical values
  const normalizedWeight = normalizeTextWeight(value.text)
  return fontWeightIntToKotlin(normalizedWeight)
}

//todo reuse with css helper
function normalizeTextWeight(weight: string): number {
  // Convert to lowercase for case-insensitive comparison
  const normalizedText = weight.toLowerCase().trim()

  // First, check if it's already a valid number
  const numericWeight = parseInt(normalizedText)
  if (!isNaN(numericWeight)) {
    return numericWeight
  }

  // Map common weight names to their numeric values
  switch (normalizedText) {
    case "thin":
      return 100
    case "hairline":
      return 100
    case "extra light":
    case "extralight":
    case "ultra light":
    case "ultralight":
      return 200
    case "light":
      return 300
    case "normal":
    case "regular":
    case "book":
      return 400
    case "medium":
      return 500
    case "semi bold":
    case "semibold":
    case "demi bold":
    case "demibold":
      return 600
    case "bold":
      return 700
    case "extra bold":
    case "extrabold":
    case "ultra bold":
    case "ultrabold":
      return 800
    case "black":
    case "heavy":
      return 900
    default:
      // Default to normal weight (400) if the value is not recognized
      return 400
  }
}

function fontWeightIntToKotlin(weight: number): string {
  switch (weight) {
    case 100:
      return "FontWeight.Thin"
    case 200:
      return "FontWeight.ExtraLight"
    case 300:
      return "FontWeight.Light"
    case 400:
      return "FontWeight.Normal"
    case 500:
      return "FontWeight.Medium"
    case 600:
      return "FontWeight.SemiBold"
    case 700:
      return "FontWeight.Bold"
    case 800:
      return "FontWeight.ExtraBold"
    case 900:
      return "FontWeight.Black"
    default:
      // Uncommon custom weight
      return `FontWeight(${weight})`
  }
}