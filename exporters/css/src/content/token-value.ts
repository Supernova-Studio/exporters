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
import { ColorHelper } from "@supernova-studio/export-helpers"
import { config } from "../config"

export function tokenValue(token: Token, tokens: Array<Token>, tokenGroups: Array<TokenGroup>): string {
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]))

  switch (token.tokenType) {
    case TokenType.color:
      return colorTokenValue((token as ColorToken).value, mappedTokens)
    case TokenType.border:
      return borderTokenValue((token as BorderToken).value, mappedTokens)
    default:
      return "not-supported"
  }
}

export function colorTokenValue(value: ColorTokenValue, mappedTokens: Map<string, Token>): string {
  console.log("Formatting color")
  // Use color helper to convert color to desired format.
  // Will also replace any color or opacity tokens with their variable names if color references other tokens
  return ColorHelper.formattedColorOrVariableName(
    value,
    mappedTokens,
    config.colorFormat,
    config.colorPrecision,
    (colorToken) => {
      return `var(--${colorToken.name})`
    },
    (opacityToken) => {
      return `var(--${opacityToken.name})`
    }
  )
}

function borderTokenValue(value: BorderTokenValue, mappedTokens: Map<string, Token>): string {
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
  return `${dimensionTokenValue(value.width)} ${cssStyleString} ${colorTokenValue(value.color, mappedTokens)}`
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
