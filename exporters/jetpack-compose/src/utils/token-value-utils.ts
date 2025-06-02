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
  ColorTokenValue,
  FontWeightToken,
  GradientToken,
  GradientTokenValue,
  GradientType,
  ShadowToken,
  ShadowTokenValue,
  TextCase,
  TextDecoration,
  Token,
  TokenType,
  TypographyToken,
  TypographyTokenValue,
  Unit,
  UnreachableCaseError,
  VisibilityType
} from "@supernovaio/sdk-exporters"
import { ColorFormatOptions, ColorHelper, GeneralHelper, sureOptionalReference } from "@supernovaio/export-utils"
import { exportConfiguration } from "../index"

type InternalOptions = ColorFormatOptions & { indent: number }

// No need to expose rawColorTokenFormatter, the format is standardized
export type TokenToKotlinOptions = Omit<InternalOptions, "rawColorTokenFormatter">

//todo extract to kotlinhelper
export function tokenValue(
  token: Token,
  allTokens: Map<string, Token>,
  options: TokenToKotlinOptions
): string {
  const actualOptions = {
    rawColorTokenFormatter: (rawValue: string) => {
      return `Color(0x${rawValue})`
    },
    ...options
  } satisfies InternalOptions

  /** Use subroutines to convert specific token types to different representations. Many tokens are of the same type */
  let value: string
  switch (token.tokenType) {
    case TokenType.color:
      value = colorTokenValueToKotlin((token as ColorToken).value, allTokens, actualOptions)
      break
    case TokenType.border:
      value = borderTokenValueToKotlin((token as BorderToken).value, allTokens, actualOptions)
      break
    case TokenType.gradient:
      value = gradientTokenValueToKotlin((token as GradientToken).value, allTokens, actualOptions)
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
      value = dimensionTokenValueToKotlin((token as AnyDimensionToken).value, allTokens, actualOptions)
      break
    case TokenType.shadow:
      value = shadowTokenValueToKotlin((token as ShadowToken).value, allTokens, options)
      break
    case TokenType.fontWeight:
      value = fontWeightTokenValueToKotlin((token as FontWeightToken).value, allTokens, actualOptions)
      break
    case TokenType.fontFamily:
    case TokenType.productCopy:
    case TokenType.string:
      value = stringTokenValueToKotlin((token as AnyStringToken).value, allTokens, actualOptions)
      break
    case TokenType.textCase:
    case TokenType.textDecoration:
    case TokenType.visibility:
      value = optionTokenValueToKotlin((token as AnyOptionToken).value, allTokens, actualOptions, token.tokenType)
      break
    case TokenType.blur:
      value = blurTokenValueToKotlin((token as BlurToken).value, allTokens, actualOptions)
      break
    case TokenType.typography:
      value = typographyTokenValueToKotlin((token as TypographyToken).value, allTokens, options)
      break
    default:
      throw new UnreachableCaseError(token.tokenType, "Unsupported token type for transformation:")
  }

  return value
}

function colorTokenValueToKotlin(
  color: ColorTokenValue,
  allTokens: Map<string, Token>,
  options: InternalOptions
): string {
  return ColorHelper.formattedColorOrVariableName(color, allTokens, options)
}

function borderTokenValueToKotlin(
  border: BorderTokenValue,
  allTokens: Map<string, Token>,
  options: InternalOptions
): string {
  const reference = sureOptionalReference(border.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }

  const widthLit = dimensionTokenValueToKotlin(border.width, allTokens, options)
  const colorLit = colorTokenValueToKotlin(border.color, allTokens, options)

  return `BorderStroke(${widthLit}, ${colorLit})`
}

function gradientTokenValueToKotlin(
  gradients: Array<GradientTokenValue>,
  allTokens: Map<string, Token>,
  options: InternalOptions
): string {

  // Compose can draw only one Brush per shape; export all layers anyway
  // so callers may overlay them manually
  const layers = gradients.map(g => gradientLayerToKotlin(g, allTokens, options))
  return layers.length === 1
    ? layers[0]
    : `listOf(${layers.join(", ")})`
}

/** Converts one gradient layer to a Brush literal */
function gradientLayerToKotlin(
  value: GradientTokenValue,
  allTokens: Map<string, Token>,
  options: InternalOptions
): string {
  const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }

  // Convert color stops
  const colorsLit = value.stops
    .map(stop => colorTokenValueToKotlin(stop.color, allTokens, options))
    .join(", ")

  const stopsLit = value.stops
    .map(stop => ColorHelper.roundToDecimals(stop.position, options.decimals) + "f")
    .join(", ")

  // Choose Brush builder
  switch (value.type) {
    case GradientType.radial:
      // centre = midpoint of from/to, radius = distance between them (rough)
      const centerX = ((value.from.x + value.to.x) / 2).toFixed(2)
      const centerY = ((value.from.y + value.to.y) / 2).toFixed(2)
      return `Brush.radialGradient(\n` +
        `    colors = listOf(${colorsLit}),\n` +
        `    center = Offset(${centerX}f, ${centerY}f),\n` +
        `    radius = 0.5f, /* relative to size */\n` +
        `    tileMode = TileMode.Clamp,\n` +
        `    stops = floatArrayOf(${stopsLit})\n` +
        `)`

    case GradientType.angular:
      // sweep in Compose
      return `Brush.sweepGradient(\n` +
        `    colors = listOf(${colorsLit}),\n` +
        `    center = Offset(0.5f, 0.5f), /* relative */\n` +
        `    stops = floatArrayOf(${stopsLit})\n` +
        `)`

    case GradientType.linear:
    default:
      return `Brush.linearGradient(\n` +
        `    colors = listOf(${colorsLit}),\n` +
        `    stops = floatArrayOf(${stopsLit}),\n` +
        `    start = Offset(${value.from.x}f, ${value.from.y}f),\n` +
        `    end   = Offset(${value.to.x}f,   ${value.to.y}f)\n` +
        `)`
  }
}

function shadowTokenValueToKotlin(
  shadows: Array<ShadowTokenValue>,
  allTokens: Map<string, Token>,
  options: InternalOptions
): string {
  const layers = shadows.map(s => shadowLayerToKotlin(s, allTokens, options))

  // Compose can draw only one shadow per shape; export all layers anyway
  // so callers may overlay them manually
  return layers.length === 1
    ? layers[0]
    : `listOf(${layers.join(", ")})`
}

function shadowLayerToKotlin(value: ShadowTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string {
  const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }

  const colorLit = colorTokenValueToKotlin(
    { ...value.color, ...(value.opacity && { opacity: value.opacity }) },
    allTokens,
    options
  )

  // Unsupported in Compose and therefore silently ignored: spread, inner-shadow
  const offsetX = ColorHelper.roundToDecimals(value.x, options.decimals)
  const offsetY = ColorHelper.roundToDecimals(value.y, options.decimals)
  const blur = ColorHelper.roundToDecimals(value.radius, options.decimals)

  return `Shadow(color = ${colorLit}, offset = Offset(${offsetX}f, ${offsetY}f), blurRadius = ${blur}f)`
}

function dimensionTokenValueToKotlin(
  dimension: AnyDimensionTokenValue,
  allTokens: Map<string, Token>,
  options: InternalOptions
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
  options: InternalOptions
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
  options: InternalOptions,
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

function blurTokenValueToKotlin(blur: BlurTokenValue, allTokens: Map<string, Token>, options: InternalOptions): string {
  const reference = sureOptionalReference(blur.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }
  return `Modifier.blur(${dimensionTokenValueToKotlin(blur.radius, allTokens, options)})`
}

function fontWeightTokenValueToKotlin(
  value: AnyStringTokenValue,
  allTokens: Map<string, Token>,
  options: InternalOptions
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

function typographyTokenValueToKotlin(
  typography: TypographyTokenValue,
  allTokens: Map<string, Token>,
  options: InternalOptions
): string {
  // Reference full typography token if set
  const reference = sureOptionalReference(typography.referencedTokenId, allTokens, options.allowReferences)
  if (reference) {
    return options.tokenToVariableRef(reference)
  }

  // Resolve partial references
  const fontFamilyRef = sureOptionalReference(
    typography.fontFamily.referencedTokenId,
    allTokens,
    options.allowReferences
  )
  const fontWeightRef = sureOptionalReference(
    typography.fontWeight.referencedTokenId,
    allTokens,
    options.allowReferences
  )
  const decorationRef = sureOptionalReference(
    typography.textDecoration.referencedTokenId,
    allTokens,
    options.allowReferences
  )

  // Calculate literals
  const fontFamilyLit = fontFamilyRef
    ? options.tokenToVariableRef(fontFamilyRef)
    : `"${typography.fontFamily.text}"`

  const fontWeightLit = fontWeightRef
    ? options.tokenToVariableRef(fontWeightRef)
    : fontWeightIntToKotlin(normalizeTextWeight(typography.fontWeight.text))

  const textDecorationLit = decorationRef
    ? options.tokenToVariableRef(decorationRef)
    : typography.textDecoration.value === TextDecoration.original
      ? "TextDecoration.None"
      : textDecorationToKotlin(typography.textDecoration.value as TextDecoration)

  const fontSizeLit = dimensionTokenValueToKotlin(typography.fontSize, allTokens, options)
  const lineHeightLit = typography.lineHeight
    ? dimensionTokenValueToKotlin(typography.lineHeight, allTokens, options)
    : undefined

  const letterSpacingLit = typography.letterSpacing
    ? dimensionTokenValueToKotlin(typography.letterSpacing, allTokens, options)
    : undefined

  // Assemble TextStyle literal
  const parts: string[] = [
    `fontFamily = ${fontFamilyLit}`,
    `fontWeight = ${fontWeightLit}`,
    `fontSize = ${fontSizeLit}`
  ]
  if (lineHeightLit) parts.push(`lineHeight = ${lineHeightLit}`)
  if (letterSpacingLit) parts.push(`letterSpacing = ${letterSpacingLit}`)
  if (textDecorationLit) parts.push(`textDecoration = ${textDecorationLit}`)

  const indentString = GeneralHelper.indent(exportConfiguration.indent)

  // Join with commas and indents
  const body = parts.map(p => `${indentString}${indentString}${p}`).join(",\n")

  return `TextStyle(\n${body}\n${indentString})`
}
