import {
  BorderToken,
  ColorToken,
  ColorTokenValue,
  Token,
  TokenType,
  UnreachableCaseError
} from "@supernovaio/sdk-exporters"
import { ColorFormatOptions, ColorHelper } from "@supernovaio/export-utils"

export function tokenValue(
  token: Token,
  allTokens: Map<string, Token>,
  options: ColorFormatOptions
): string {
  //todo remove default value
  /** Use subroutines to convert specific token types to different representations. Many tokens are of the same type */
  let value: string = ""
  switch (token.tokenType) {
    case TokenType.color:
      value = convertColorToken((token as ColorToken).value, allTokens, options)
      break
    case TokenType.border:
      value = this.borderTokenValueToCSS((token as BorderToken).value, allTokens, options)
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
      // value = this.dimensionTokenValueToCSS((token as AnyDimensionToken).value, allTokens, options)
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
      // value = this.stringTokenValueToCSS((token as AnyStringToken).value, allTokens, options)
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
