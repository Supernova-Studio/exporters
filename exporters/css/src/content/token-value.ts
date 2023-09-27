import {
  BorderStyle,
  BorderToken,
  BorderTokenValue,
  ColorToken,
  ColorTokenValue,
  DimensionTokenValue,
  Token,
  TokenGroup,
  TokenType,
  Unit,
} from "@supernova-studio/pulsar-next"
import { colorValueToHex6, colorValueToHex8 } from "../helpers/conversion"

export function tokenValue(token: Token, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): string {
  switch (token.tokenType) {
    case TokenType.color:
      return colorTokenValue((token as ColorToken).value)
    case TokenType.border:
      return borderTokenValue((token as BorderToken).value)
    default:
      return "not-supported"
  }
}

export function colorTokenValue(value: ColorTokenValue): string {
  if (value.opacity.measure === 1) {
    return colorValueToHex6(value)
  } else {
    return colorValueToHex8(value)
  }
}

function borderTokenValue(value: BorderTokenValue): string {
  let cssStyleString: string
  switch (value.style) {
    case BorderStyle.solid:
      cssStyleString = "solid"
      break
    case BorderStyle.dashed:
      cssStyleString = "dashed"
      break
    case BorderStyle.dotted:
      cssStyleString = "solid"
      break
    case BorderStyle.groove:
      cssStyleString = "solid"
      break
    default:
      throw new Error(`Unsupported border style: ${value.style}`)
  }
  return `${dimensionTokenValue(value.width)} ${cssStyleString} ${colorTokenValue(value.color)}`
}

function dimensionTokenValue(value: DimensionTokenValue): string {
  let unitString: string
  switch (value.unit) {
    case Unit.pixels:
      unitString = "px"
      break
    case Unit.percent:
      unitString = "%"
      break
    case Unit.rem:
      unitString = "rem"
      break
    case Unit.raw:
      unitString = "raw"
      break
    case Unit.ms:
      unitString = "ms"
      break
  }
  return `${value.measure}${unitString}`
}
