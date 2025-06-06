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
import { ColorFormatOptions, ColorHelper } from "./ColorHelper"
import { normalizeTextWeight, sureOptionalReference } from "./TokenHelper"
import { GeneralHelper } from "./GeneralHelper"
import { NamingHelper } from "./NamingHelper"
import { StringCase } from "../enums/StringCase"
import { ColorFormat } from "../enums/ColorFormat"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports & flag enum

export enum ImportFlag {
  Color,
  Dp,
  Sp,
  Em,
  Offset,
  Brush,
  TileMode,
  Shadow,
  BorderStroke,
  Modifier,
  Blur,
  Font,
  FontFamily,
  FontWeight,
  TextDecoration,
  TextStyle,
  R
}

/** Collect flags while generating literals, turn into imports at the end */
export class ImportCollector {
  private importFlags = new Set<ImportFlag>()

  constructor(private readonly rPackageName: string) {}

  /**
   * Marks a specific feature to be imported.
   * @param flags
   */
  use(...flags: ImportFlag[]) {
    flags.forEach((x) => this.importFlags.add(x))
  }

  /**
   * Output a list of all sorted import literals needed for the specified tokens.
   */
  allImports(): string[] {
    const importList: string[] = []

    if (this.rPackageName && this.importFlags.has(ImportFlag.R)) {
      importList.push(`import ${this.rPackageName}.R`)
    }

    if (this.importFlags.has(ImportFlag.Color)) importList.push("import androidx.compose.ui.graphics.Color")

    if (this.importFlags.has(ImportFlag.Dp)) importList.push("import androidx.compose.ui.unit.dp")
    if (this.importFlags.has(ImportFlag.Sp)) importList.push("import androidx.compose.ui.unit.sp")
    if (this.importFlags.has(ImportFlag.Em)) importList.push("import androidx.compose.ui.unit.em")

    if (this.importFlags.has(ImportFlag.Offset)) importList.push("import androidx.compose.ui.geometry.Offset")

    if (this.importFlags.has(ImportFlag.Brush)) importList.push("import androidx.compose.ui.graphics.Brush")
    if (this.importFlags.has(ImportFlag.TileMode)) importList.push("import androidx.compose.ui.graphics.TileMode")

    if (this.importFlags.has(ImportFlag.Shadow)) importList.push("import androidx.compose.ui.graphics.Shadow")

    if (this.importFlags.has(ImportFlag.BorderStroke))
      importList.push("import androidx.compose.foundation.BorderStroke")

    if (this.importFlags.has(ImportFlag.Modifier)) {
      importList.push("import androidx.compose.ui.Modifier")
      if (this.importFlags.has(ImportFlag.Blur)) importList.push("import androidx.compose.ui.draw.blur")
    }

    if (this.importFlags.has(ImportFlag.FontFamily)) importList.push("import androidx.compose.ui.text.font.FontFamily")
    if (this.importFlags.has(ImportFlag.Font)) importList.push("import androidx.compose.ui.text.font.Font")
    if (this.importFlags.has(ImportFlag.FontWeight)) importList.push("import androidx.compose.ui.text.font.FontWeight")
    if (this.importFlags.has(ImportFlag.TextDecoration))
      importList.push("import androidx.compose.ui.text.style.TextDecoration")
    if (this.importFlags.has(ImportFlag.TextStyle)) importList.push("import androidx.compose.ui.text.TextStyle")

    return importList.sort()
  }
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Main helper

export type TokenToKotlinOptions = Pick<ColorFormatOptions, "allowReferences" | "decimals" | "tokenToVariableRef"> & {
  indent: number
}

/**
 * A utility class for working with Kotlin code generation for various token types.
 * This class provides methods to transform design tokens (e.g., colors, borders, gradients, shadows) into Kotlin representations.
 */
export class KotlinHelper {
  /**
   * Converts a given token to its Kotlin string representation based on its type.
   *
   * @param token - The token to be converted.
   * @param allTokens - A map of all tokens, used for reference during conversion.
   * @param options - The options used to customize the token conversion process.
   * @param importCollector - An object responsible for managing and collecting imports needed for the Kotlin representation.
   * @return The Kotlin string representation of the given token.
   */
  static tokenValue(
    token: Token,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    /** Use subroutines to convert specific token types to different representations. Many tokens are of the same type */
    let value: string
    switch (token.tokenType) {
      case TokenType.color:
        value = this.colorTokenValueToKotlin((token as ColorToken).value, allTokens, options, importCollector)
        break
      case TokenType.border:
        value = this.borderTokenValueToKotlin((token as BorderToken).value, allTokens, options, importCollector)
        break
      case TokenType.gradient:
        value = this.gradientTokenValueToKotlin((token as GradientToken).value, allTokens, options, importCollector)
        break
      case TokenType.fontSize:
      case TokenType.lineHeight:
        value = this.textUnitTokenValueToKotlin((token as AnyDimensionToken).value, allTokens, options, importCollector)
        break
      case TokenType.letterSpacing:
        value = this.letterSpacingTokenValueToKotlin(
          (token as AnyDimensionToken).value,
          allTokens,
          options,
          importCollector
        )
        break
      case TokenType.dimension:
      case TokenType.size:
      case TokenType.space:
      case TokenType.opacity:
      case TokenType.paragraphSpacing:
      case TokenType.borderWidth:
      case TokenType.radius:
      case TokenType.duration:
      case TokenType.zIndex:
        value = this.dimensionTokenValueToKotlin(
          (token as AnyDimensionToken).value,
          allTokens,
          options,
          importCollector
        )
        break
      case TokenType.shadow:
        value = this.shadowTokenValueToKotlin((token as ShadowToken).value, allTokens, options, importCollector)
        break
      case TokenType.fontWeight:
        value = this.fontWeightTokenValueToKotlin((token as FontWeightToken).value, allTokens, options, importCollector)
        break
      case TokenType.fontFamily:
        value = this.fontFamilyTokenValueToKotlin((token as AnyStringToken).value, allTokens, options, importCollector)
        break
      case TokenType.productCopy:
      case TokenType.string:
        value = this.stringTokenValueToKotlin((token as AnyStringToken).value, allTokens, options)
        break
      case TokenType.textCase:
      case TokenType.textDecoration:
      case TokenType.visibility:
        value = this.optionTokenValueToKotlin(
          (token as AnyOptionToken).value,
          allTokens,
          options,
          token.tokenType,
          importCollector
        )
        break
      case TokenType.blur:
        value = this.blurTokenValueToKotlin((token as BlurToken).value, allTokens, options, importCollector)
        break
      case TokenType.typography:
        value = this.typographyTokenValueToKotlin((token as TypographyToken).value, allTokens, options, importCollector)
        break
      default:
        throw new UnreachableCaseError(token.tokenType, "Unsupported token type for transformation:")
    }

    return value
  }

  static colorTokenValueToKotlin(
    color: ColorTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    importCollector.use(ImportFlag.Color)
    const colorOptions = {
      ...options,
      colorFormat: ColorFormat.argbInt
    } satisfies ColorFormatOptions

    return ColorHelper.formattedColorOrVariableName(color, allTokens, colorOptions)
  }

  static borderTokenValueToKotlin(
    border: BorderTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    const reference = sureOptionalReference(border.referencedTokenId, allTokens, options.allowReferences)
    if (reference) {
      return options.tokenToVariableRef(reference)
    }

    importCollector.use(ImportFlag.BorderStroke)
    const widthLit = this.dimensionTokenValueToKotlin(border.width, allTokens, options, importCollector)
    const colorLit = this.colorTokenValueToKotlin(border.color, allTokens, options, importCollector)

    return `BorderStroke(${widthLit}, ${colorLit})`
  }

  static gradientTokenValueToKotlin(
    gradients: Array<GradientTokenValue>,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    // Compose can draw only one Brush per shape; export all layers anyway,
    // so callers may overlay them manually
    const layers = gradients.map((g) => this.gradientLayerToKotlin(g, allTokens, options, importCollector))
    return layers.length === 1 ? layers[0] : `listOf(${layers.join(", ")})`
  }

  /** Converts one gradient layer to a Brush literal */
  static gradientLayerToKotlin(
    value: GradientTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
    if (reference) {
      return options.tokenToVariableRef(reference)
    }

    importCollector.use(ImportFlag.Brush, ImportFlag.Offset)

    // Builds "<pos>f to <colorLit>" pairs for var-arg overload
    const stopPairs = value.stops
      .map((s) => {
        const pos = ColorHelper.roundToDecimals(s.position, options.decimals) + "f"
        const col = this.colorTokenValueToKotlin(s.color, allTokens, options, importCollector)
        return `${pos} to ${col}`
      })
      .join(", ")

    const indent = GeneralHelper.indent(options.indent)

    switch (value.type) {
      case GradientType.radial: {
        importCollector.use(ImportFlag.TileMode)

        const centerX = ((value.from.x + value.to.x) / 2).toFixed(2)
        const centerY = ((value.from.y + value.to.y) / 2).toFixed(2)

        return (
          `Brush.radialGradient(\n` +
          `${indent}${indent}${stopPairs},\n` +
          `${indent}${indent}center = Offset(${centerX}f, ${centerY}f),\n` +
          `${indent}${indent}radius = 0.5f,\n` +
          `${indent}${indent}tileMode = TileMode.Clamp\n` +
          `${indent})`
        )
      }

      case GradientType.angular: // sweep
        return (
          `Brush.sweepGradient(\n` +
          `${indent}${indent}${stopPairs},\n` +
          `${indent}${indent}center = Offset(0.5f, 0.5f)\n` +
          `${indent})`
        )

      case GradientType.linear:
      default:
        return (
          `Brush.linearGradient(\n` +
          `${indent}${indent}${stopPairs},\n` +
          `${indent}${indent}start = Offset(${value.from.x}f, ${value.from.y}f),\n` +
          `${indent}${indent}end = Offset(${value.to.x}f, ${value.to.y}f)\n` +
          `${indent})`
        )
    }
  }

  static shadowTokenValueToKotlin(
    shadows: Array<ShadowTokenValue>,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    const layers = shadows.map((s) => this.shadowLayerToKotlin(s, allTokens, options, importCollector))

    const indentString = GeneralHelper.indent(options.indent)

    // Compose can draw only one shadow per shape; export all layers anyway,
    // so callers may overlay them manually
    return layers.length === 1
      ? layers[0]
      : `listOf(\n` + `${layers.map((l) => `${indentString}${indentString}${l}`).join(",\n")}` + `\n${indentString})`
  }

  static shadowLayerToKotlin(
    value: ShadowTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
    if (reference) {
      return options.tokenToVariableRef(reference)
    }

    importCollector.use(ImportFlag.Shadow, ImportFlag.Offset)

    const colorLit = this.colorTokenValueToKotlin(
      { ...value.color, ...(value.opacity && { opacity: value.opacity }) },
      allTokens,
      options,
      importCollector
    )

    // Unsupported in Compose and therefore ignored: spread, inner-shadow
    const offsetX = ColorHelper.roundToDecimals(value.x, options.decimals)
    const offsetY = ColorHelper.roundToDecimals(value.y, options.decimals)
    const blur = ColorHelper.roundToDecimals(value.radius, options.decimals)

    return `Shadow(color = ${colorLit}, offset = Offset(${offsetX}f, ${offsetY}f), blurRadius = ${blur}f)`
  }

  static dimensionTokenValueToKotlin(
    dimension: AnyDimensionTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    const reference = sureOptionalReference(dimension.referencedTokenId, allTokens, options.allowReferences)
    if (reference) {
      return options.tokenToVariableRef(reference)
    }

    const rounded = ColorHelper.roundToDecimals(dimension.measure, options.decimals)

    // Percent requires scaling to 0-1 for Kotlin float
    if (dimension.unit === Unit.percent) {
      const fraction = +rounded / 100
      return `${fraction}f`
    }

    return `${rounded}${this.unitToKotlin(dimension.unit, importCollector)}`
  }

  /** Always output a Compose TextUnit value (sp or em) for typography tokens */
  static textUnitTokenValueToKotlin(
    dimension: AnyDimensionTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector,
    useEmForPercent = false
  ): string {
    const reference = sureOptionalReference(dimension.referencedTokenId, allTokens, options.allowReferences)
    if (reference) {
      return options.tokenToVariableRef(reference)
    }

    const rounded = ColorHelper.roundToDecimals(dimension.measure, options.decimals)

    if (dimension.unit === Unit.percent) {
      const fraction = +rounded / 100
      importCollector.use(useEmForPercent ? ImportFlag.Em : ImportFlag.Sp)
      return `${fraction}${useEmForPercent ? ".em" : ".sp"}`
    }

    importCollector.use(ImportFlag.Sp)
    return `${rounded}.sp`
  }

  /**
   * Converts letter-spacing tokens to Compose TextUnit.
   * Percentage values correspond to em units, hence the final `true` flag.
   */
  static letterSpacingTokenValueToKotlin(
    dimension: AnyDimensionTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    return this.textUnitTokenValueToKotlin(dimension, allTokens, options, importCollector, true)
  }

  /** Maps Supernova units to Kotlin / Compose extension suffixes */
  static unitToKotlin(unit: Unit, importCollector: ImportCollector): string {
    switch (unit) {
      case Unit.percent:
        // Float literal (0.5f)
        return "f"
      case Unit.pixels:
        // density‑independent pixels
        importCollector.use(ImportFlag.Dp)
        return ".dp"
      case Unit.rem:
        // scale‑independent pixels for typography
        importCollector.use(ImportFlag.Sp)
        return ".sp"
      case Unit.ms:
      case Unit.raw:
        // plain number
        return ""
      default:
        importCollector.use(ImportFlag.Dp)
        return ".dp"
    }
  }

  static stringTokenValueToKotlin(
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

  static optionTokenValueToKotlin(
    option: AnyOptionTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    tokenType: TokenType,
    importCollector: ImportCollector
  ): string {
    const reference = sureOptionalReference(option.referencedTokenId, allTokens, options.allowReferences)
    if (reference) {
      return options.tokenToVariableRef(reference)
    }
    if (tokenType === TokenType.textCase) {
      return this.textCaseToKotlin(option.value as TextCase)
    }
    if (tokenType === TokenType.textDecoration) {
      return this.textDecorationToKotlin(option.value as TextDecoration, importCollector)
    }

    return this.visibilityToKotlin(option.value as VisibilityType)
  }

  static textCaseToKotlin(textCase: TextCase): string {
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

  static textDecorationToKotlin(textDecoration: TextDecoration, importCollector: ImportCollector): string {
    importCollector.use(ImportFlag.TextDecoration)

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

  static visibilityToKotlin(visibility: VisibilityType): string {
    return visibility === VisibilityType.visible ? "true" : "false"
  }

  static blurTokenValueToKotlin(
    blur: BlurTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    const reference = sureOptionalReference(blur.referencedTokenId, allTokens, options.allowReferences)
    if (reference) {
      return options.tokenToVariableRef(reference)
    }

    importCollector.use(ImportFlag.Modifier, ImportFlag.Blur)
    return `Modifier.blur(${this.dimensionTokenValueToKotlin(blur.radius, allTokens, options, importCollector)})`
  }

  static fontWeightTokenValueToKotlin(
    value: AnyStringTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
    if (reference) {
      return options.tokenToVariableRef(reference)
    }

    // Convert text weights to numerical values
    const normalizedWeight = normalizeTextWeight(value.text)
    return this.fontWeightIntToKotlin(normalizedWeight, importCollector)
  }

  static fontWeightIntToKotlin(weight: number, importCollector: ImportCollector): string {
    importCollector.use(ImportFlag.FontWeight)

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

  static fontFamilyTokenValueToKotlin(
    value: AnyStringTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
    if (reference) {
      return options.tokenToVariableRef(reference)
    }
    // Map font names to Android font resources using snake_case
    importCollector.use(ImportFlag.FontFamily, ImportFlag.Font, ImportFlag.R)
    const resName = NamingHelper.codeSafeVariableName(value.text, StringCase.snakeCase)
    return `FontFamily(Font(R.font.${resName}))`
  }

  static typographyTokenValueToKotlin(
    typography: TypographyTokenValue,
    allTokens: Map<string, Token>,
    options: TokenToKotlinOptions,
    importCollector: ImportCollector
  ): string {
    // Reference full typography token if set
    const reference = sureOptionalReference(typography.referencedTokenId, allTokens, options.allowReferences)
    if (reference) {
      return options.tokenToVariableRef(reference)
    }

    importCollector.use(ImportFlag.TextStyle, ImportFlag.TextDecoration)

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
      : this.fontFamilyTokenValueToKotlin(typography.fontFamily, allTokens, options, importCollector)

    const fontWeightLit = fontWeightRef
      ? options.tokenToVariableRef(fontWeightRef)
      : this.fontWeightIntToKotlin(normalizeTextWeight(typography.fontWeight.text), importCollector)

    const textDecorationLit = decorationRef
      ? options.tokenToVariableRef(decorationRef)
      : typography.textDecoration.value === TextDecoration.original
      ? "TextDecoration.None"
      : this.textDecorationToKotlin(typography.textDecoration.value as TextDecoration, importCollector)

    const fontSizeLit = this.textUnitTokenValueToKotlin(typography.fontSize, allTokens, options, importCollector)
    const lineHeightLit = typography.lineHeight
      ? this.textUnitTokenValueToKotlin(typography.lineHeight, allTokens, options, importCollector)
      : undefined

    const letterSpacingLit = typography.letterSpacing
      ? this.letterSpacingTokenValueToKotlin(typography.letterSpacing, allTokens, options, importCollector)
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

    const indentString = GeneralHelper.indent(options.indent)

    // Join with commas and indents
    const body = parts.map((p) => `${indentString}${indentString}${p}`).join(",\n")

    return `TextStyle(\n${body}\n${indentString})`
  }
}
