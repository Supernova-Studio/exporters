import { ColorHelper, ColorFormat } from '@supernovaio/export-helpers'
import {
  ColorTokenValue,
  Token,
  AnyDimensionTokenValue,
  AnyStringTokenValue,
  AnyOptionTokenValue,
  BorderTokenValue,
  GradientTokenValue,
  GradientType,
  ShadowTokenValue,
  BlurTokenValue,
  TypographyTokenValue,
  LetterSpacingTokenValue,
  Unit,
  LineHeightTokenValue,
  TokenType,
  ColorToken,
  BorderToken,
  GradientToken,
  AnyDimensionToken,
  ShadowToken,
  AnyStringToken,
  AnyOptionToken,
  BlurToken,
  TypographyToken,
  UnreachableCaseError
} from '@supernovaio/sdk-exporters'

export type Options = {
  decimals: number
}

export function toColorTokenValue(value: ColorTokenValue, allTokens: Map<string, Token>, options: Options) {
  // TODO: New enum hasHex8Reverced
  const hex8 = ColorHelper.formattedColor(value, ColorFormat.hex8, options.decimals)
  return `Color(0x${hex8.slice(6)}${hex8.slice(0, 6)})`
}

export function toDimensionTokenValue(value: AnyDimensionTokenValue, allTokens: Map<string, Token>, options: Options) {
  return `${ColorHelper.roundToDecimals(value.measure, options.decimals)}`
}

export function toStringTokenValue(value: AnyStringTokenValue, allTokens: Map<string, Token>, options: Options) {
  return `"${value.text}"`
}

export function toOptionTokenValue(value: AnyOptionTokenValue, allTokens: Map<string, Token>, options: Options) {
  return `"${value.value}"`
}

export function toBorderTokenValue(value: BorderTokenValue, allTokens: Map<string, Token>, options: Options) {
  return `Border.fromBorderSide(${toBorderSideTokenValue(value, allTokens, options)})`
}

export function toGradientTokenValue(gradient: GradientTokenValue | GradientTokenValue[], allTokens: Map<string, Token>, options: Options) {
  // TODO: Handle layers, type
  const value = Array.isArray(gradient) ? gradient[0] : gradient
  const toPoint = (p: { x: number; y: number }) => `Alignment(${(p.x - 0.5) * 2}, ${(p.y - 0.5) * 2})`

  const data = {
    type: `${value.type === GradientType.radial ? 'Radial' : 'Linear'}Gradient`,
    begin: toPoint(value.from),
    end: toPoint(value.to),
    stops: value.stops.map((s) => s.position),
    colors: value.stops.map((s) => toColorTokenValue(s.color, allTokens, options))
  }

  return `${data.type}(
      begin: ${data.begin},
      end: ${data.end},
      stops: [${data.stops.join(', ')}],
      colors: [${data.colors.join(', ')}],
    )`

  // return `${value.type === GradientType.radial ? 'Radial' : 'Linear'}Gradient(
  //   begin: ${toPoint(value.from)},
  //   end: ${toPoint(value.to)},
  //   stops: [${value.stops.map(s => s.position).join(',\n')}],
  //   colors: [${value.stops.map(s => toColorTokenValue(s.color, allTokens, options)).join(',\n')}],
  // );`
}

export function toShadowTokenValue(shadow: ShadowTokenValue | ShadowTokenValue[], allTokens: Map<string, Token>, options: Options) {
  // TODO: Handle layers, type
  const value = Array.isArray(shadow) ? shadow[0] : shadow
  return `BoxShadow(
      color: ${toColorTokenValue(value.color, allTokens, options)},
      offset: Offset(${value.x}, ${value.y}),
      blurRadius: ${value.radius},
      spreadRadius: ${value.spread},
    )`
}

export function toBorderSideTokenValue(value: BorderTokenValue, allTokens: Map<string, Token>, options: Options) {
  const data = {
    color: toColorTokenValue(value.color, allTokens, options),
    width: toDimensionTokenValue(value.width, allTokens, options)
  }

  return `BorderSide(
      color: ${data.color},
      width: ${data.width},
    )`
}

export function toBlurTokenValue(value: BlurTokenValue, allTokens: Map<string, Token>, options: Options) {
  return `ImageFilter.blur(
      sigmaX: ${value.radius},
      sigmaY: ${value.radius},
    )`
}

export function toTypographyTokenValue(value: TypographyTokenValue, allTokens: Map<string, Token>, options: Options) {
  // TODO: Do we still needs these conversion?
  const toWeight = (weight: string) => {
    weight = weight.toLowerCase()
    if (weight.startsWith('thin')) return 100
    if (weight.startsWith('extralight')) return 200
    if (weight.startsWith('light')) return 300
    if (weight.startsWith('medium')) return 500
    if (weight.startsWith('semibold')) return 600
    if (weight.startsWith('bold')) return 700
    if (weight.startsWith('extrabold')) return 800
    if (weight.startsWith('black')) return 900

    let weightAsNumber = Number(weight)
    if (weight && !Number.isNaN(weightAsNumber)) return weightAsNumber

    return 400
  }

  const toStyle = (family: string) => (family?.toLowerCase()?.includes('italic') ? 'italic' : 'normal')

  const toDecoration = (decoration: string) =>
    decoration.toLowerCase() === 'strikethrough' ? 'lineThrough' : decoration?.toLowerCase() ?? 'none'

  const toLetterSpacing = (letterSpacing: LetterSpacingTokenValue, fontSize: number) =>
    letterSpacing.unit === Unit.percent ? (fontSize / 100) * letterSpacing.measure : letterSpacing.measure

  const toLineHeight = (lineHeight: LineHeightTokenValue | null, fontSize: number) =>
    !lineHeight || ![Unit.pixels, Unit.percent].includes(lineHeight.unit)
      ? 'null'
      : lineHeight.measure / (lineHeight.unit === Unit.pixels ? fontSize : 100)

  return `TextStyle(
      fontFamily: "${value.fontFamily.text}",
      fontWeight: FontWeight.w${toWeight(value.fontWeight.text)},
      fontStyle: FontStyle.${toStyle(value.fontWeight.text)},
      fontSize: ${value.fontSize.measure},
      decoration: TextDecoration.${toDecoration(value.textDecoration.value)},
      letterSpacing: ${toLetterSpacing(value.letterSpacing, value.fontSize.measure)},
      height: ${toLineHeight(value.lineHeight, value.fontSize.measure)},
      leadingDistribution: TextLeadingDistribution.even,
    )`
}

export function tokenToFlutterValue(
  token: Pick<Token, 'tokenType'>,
  allTokens: Map<string, Token>,
  options: {
    decimals: number
  }
): string {
  switch (token.tokenType) {
    case TokenType.color:
      return toColorTokenValue((token as ColorToken).value, allTokens, options)
    case TokenType.border:
      return toBorderTokenValue((token as BorderToken).value, allTokens, options)
    case TokenType.gradient:
      return toGradientTokenValue((token as GradientToken).value, allTokens, options)
    case TokenType.dimension:
    case TokenType.size:
    case TokenType.space:
    case TokenType.opacity:
    case TokenType.fontSize:
    case TokenType.lineHeight:
    case TokenType.letterSpacing:
    case TokenType.paragraphSpacing:
    case TokenType.borderWidth:
    case TokenType.radius: // TODO: Should we do BorderRadius.all(Radius.circular(1))?
    case TokenType.duration:
    case TokenType.zIndex:
      return toDimensionTokenValue((token as AnyDimensionToken).value, allTokens, options)
    case TokenType.shadow:
      return toShadowTokenValue((token as ShadowToken).value, allTokens, options)
    case TokenType.fontWeight:
    case TokenType.fontFamily:
    case TokenType.productCopy:
    case TokenType.string:
      return toStringTokenValue((token as AnyStringToken).value, allTokens, options)
    case TokenType.textCase:
    case TokenType.textDecoration:
    case TokenType.visibility:
      return toOptionTokenValue((token as AnyOptionToken).value, allTokens, options)
    case TokenType.blur:
      return toBlurTokenValue((token as BlurToken).value, allTokens, options)
    case TokenType.typography:
      return toTypographyTokenValue((token as TypographyToken).value, allTokens, options)
    default:
      throw new UnreachableCaseError(token.tokenType, 'Unsupported token type for transformation:')
  }
}
