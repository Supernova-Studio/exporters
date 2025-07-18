import {
    AnyDimensionToken,
    AnyStringToken,
    BlurToken,
    BorderPosition,
    BorderStyle,
    BorderToken,
    ColorToken,
    FontWeightToken,
    GradientToken,
    GradientType,
    ShadowToken,
    ShadowType,
    TextCase,
    TextDecoration,
    Token,
    TokenType,
    TypographyToken,
    Unit,
    UnreachableCaseError
  } from '@supernovaio/sdk-exporters'
  import {
    AnyDimensionTokenValue,
    AnyOptionToken,
    AnyOptionTokenValue,
    AnyStringTokenValue,
    BlurTokenValue,
    BorderTokenValue,
    ColorTokenValue,
    GradientTokenValue,
    ShadowTokenValue,
    TypographyTokenValue
  } from '@supernovaio/sdk-exporters'
  import { ColorFormat } from '../enums/ColorFormat'
  import { normalizeTextWeight, sureOptionalReference } from "./TokenHelper"
  import { ColorHelper } from './ColorHelper'

  export type TokenToCSSOptions = {
  /** Whether to allow references to other tokens */
  allowReferences: boolean
  /** Number of decimals to round any number to */
  decimals: number
  /** Color format */
  colorFormat: ColorFormat
  /** Function to convert token to variable reference. Only used when allowReferences is true and reference is detected */
  tokenToVariableRef: (token: Token, context?: { needsRgb?: boolean }) => string
  /** Force conversion of pixel values to rem */
  forceRemUnit?: boolean
  /** Base value for rem conversion (default: 16) */
  remBase?: number
  /** Optional transformer for CSS values based on token type and value */
  valueTransformer?: (value: string, token: Token) => string | undefined
}

  /** A utility class to help with transformation of tokens and Supernova token-like values to various formats */
export class CSSHelper {
  /**
   * Helper function to handle color with custom opacity, using channel-based utilities when available
   */
  private static handleColorWithCustomOpacity(
    color: ColorTokenValue,
    customOpacity: any,
    allTokens: Map<string, Token>,
    options: TokenToCSSOptions
  ): string {
    if (customOpacity && color.referencedTokenId) {
      // If we have custom opacity and reference a color token, try to use channel-based utility
      const referencedColorToken = allTokens.get(color.referencedTokenId)
      if (referencedColorToken && referencedColorToken.tokenType === TokenType.color) {
        const channelVariableName = options.tokenToVariableRef(referencedColorToken, { needsRgb: true })
        const alphaValue = ColorHelper.roundToDecimals(customOpacity.measure, options.decimals)
        
        // Use the appropriate function based on color format
        if (options.colorFormat === ColorFormat.oklch || 
            options.colorFormat === ColorFormat.oklcha || 
            options.colorFormat === ColorFormat.smartOklch) {
          return `oklch(${channelVariableName} / ${alphaValue})`
        } else {
          // Default to rgba for other formats (rgb, rgba, smartRgba, etc.)
          return `rgba(${channelVariableName}, ${alphaValue})`
        }
      }
    }
    
    // Fallback to normal color processing
    return this.colorTokenValueToCSS(
      {
        ...color,
        ...(customOpacity && { opacity: customOpacity })
      },
      allTokens,
      options
    )
  }
    static tokenToCSS(
      token: Token,
      allTokens: Map<string, Token>,
      options: TokenToCSSOptions
    ): string {
      /** Use subroutines to convert specific token types to different css representations. Many tokens are of the same type */
      let cssValue: string
      switch (token.tokenType) {
        case TokenType.color:
          cssValue = this.colorTokenValueToCSS((token as ColorToken).value, allTokens, options)
          break
        case TokenType.border:
          cssValue = this.borderTokenValueToCSS((token as BorderToken).value, allTokens, options)
          break
        case TokenType.gradient:
          cssValue = this.gradientTokenValueToCSS((token as GradientToken).value, allTokens, options)
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
          cssValue = this.dimensionTokenValueToCSS((token as AnyDimensionToken).value, allTokens, options)
          break
        case TokenType.shadow:
          cssValue = this.shadowTokenValueToCSS((token as ShadowToken).value, allTokens, options)
          break
        case TokenType.fontWeight:
          cssValue = this.fontWeightTokenValueToCSS((token as FontWeightToken).value, allTokens, options)
          break
        case TokenType.fontFamily:
        case TokenType.productCopy:
        case TokenType.string:
          cssValue = this.stringTokenValueToCSS((token as AnyStringToken).value, allTokens, options)
          break
        case TokenType.textCase:
        case TokenType.textDecoration:
        case TokenType.visibility:
          cssValue = this.optionTokenValueToCSS((token as AnyOptionToken).value, allTokens, options, token.tokenType)
          break
        case TokenType.blur:
          cssValue = this.blurTokenValueToCSS((token as BlurToken).value, allTokens, options)
          break
        case TokenType.typography:
          cssValue = this.typographyTokenValueToCSS((token as TypographyToken).value, allTokens, options)
          break
        default:
          throw new UnreachableCaseError(token.tokenType, 'Unsupported token type for transformation to CSS:')
      }

      // Allow value transformation if transformer exists
      if (options.valueTransformer) {
        const transformedValue = options.valueTransformer(cssValue, token)
        if (transformedValue !== undefined) {
          return transformedValue
        }
      }

      return cssValue
    }

    static colorTokenValueToCSS(
      color: ColorTokenValue,
      allTokens: Map<string, Token>,
      options: TokenToCSSOptions
    ): string {
      return ColorHelper.formattedColorOrVariableName(color, allTokens, options)
    }

    static borderTokenValueToCSS(
      border: BorderTokenValue,
      allTokens: Map<string, Token>,
      options: TokenToCSSOptions
    ): string {
      const reference = sureOptionalReference(border.referencedTokenId, allTokens, options.allowReferences)
      if (reference) {
        return options.tokenToVariableRef(reference)
      }
      
      // Handle color with custom opacity using helper function
      const colorValue = this.handleColorWithCustomOpacity(border.color, border.color.opacity, allTokens, options)
      
      const data = {
        width: this.dimensionTokenValueToCSS(border.width, allTokens, options),
        style: this.borderStyleToCSS(border.style),
        color: colorValue,
        position: this.borderPositionToCSS(border.position) // Not used for now
      }
      return `${data.width} ${data.style} ${data.color}`
    }

    static gradientTokenValueToCSS(
      gradients: Array<GradientTokenValue>,
      allTokens: Map<string, Token>,
      options: TokenToCSSOptions
    ): string {
      // Export each layer of the gradient separately, then join the CSS background
      return gradients.map((gradient) => this.gradientLayerToCSS(gradient, allTokens, options)).join(', ')
    }

    /** Converts gradient token value to css definition */
    static gradientLayerToCSS(
      value: GradientTokenValue,
      allTokens: Map<string, Token>,
      options: TokenToCSSOptions
    ): string {
      const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
      if (reference) {
        return options.tokenToVariableRef(reference)
      }

      const deltaX =
        ColorHelper.roundToDecimals(value.to.x, options.decimals) -
        ColorHelper.roundToDecimals(value.from.x, options.decimals)
      const deltaY =
        ColorHelper.roundToDecimals(value.to.y, options.decimals) -
        ColorHelper.roundToDecimals(value.from.y, options.decimals)

      const rad = Math.atan2(deltaY, deltaX)
      const deg = rad * (180 / Math.PI)

      const getAngle = () => {
        if (deltaX >= 0 && deltaY > 0) {
          // top to bottom is 90deg but should be 180deg
          return 90 + deg
        }
        if (deltaX > 0 && deltaY <= 0) {
          // left to right is 0deg but should be 90deg
          return 90 + deg
        }
        if (deltaX <= 0 && deltaY < 0) {
          // bottom to top is -90deg but should be 0deg
          return 90 + deg
        }
        // right to left is 180deg but should be -90deg
        return deg - 270
      }

      let gradientType = ''
      switch (value.type) {
        case GradientType.linear:
          gradientType = `linear-gradient(${getAngle()}deg, `
          break
        case GradientType.radial:
          gradientType = 'radial-gradient(circle, '
          break
        case GradientType.angular:
          gradientType = 'conic-gradient('
          break
        default:
          gradientType = `linear-gradient(${getAngle()}deg, `
          break
      }

      // Example: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%);
      const stops = value.stops
        .map((stop) => {
                  // Handle color with custom opacity using helper function
        const colorValue = this.handleColorWithCustomOpacity(stop.color, stop.color.opacity, allTokens, options)
          
          return `${colorValue} ${ColorHelper.roundToDecimals(
            stop.position * 100,
            options.decimals
          )}%`
        })
        .join(', ')

      return `${gradientType}${stops})`
    }

    static dimensionTokenValueToCSS(
      dimension: AnyDimensionTokenValue,
      allTokens: Map<string, Token>,
      options: TokenToCSSOptions
    ): string {
      const reference = sureOptionalReference(dimension.referencedTokenId, allTokens, options.allowReferences)
      if (reference) {
        return options.tokenToVariableRef(reference)
      }

      // Handle unit conversion if needed
      if (options.forceRemUnit && dimension.unit === Unit.pixels) {
        const remBase = options.remBase || 16
        const remValue = dimension.measure / remBase
        return `${ColorHelper.roundToDecimals(remValue, options.decimals)}rem`
      }

      return `${ColorHelper.roundToDecimals(dimension.measure, options.decimals)}${this.unitToCSS(dimension.unit)}`
    }

    static shadowTokenValueToCSS(
      shadows: Array<ShadowTokenValue>,
      allTokens: Map<string, Token>,
      options: TokenToCSSOptions
    ): string {
      return shadows.map((layer) => this.shadowLayerToCSS(layer, allTokens, options)).join(', ')
    }

    static shadowLayerToCSS(value: ShadowTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string {
      const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
      if (reference) {
        return options.tokenToVariableRef(reference)
      }

      // Convert pixel values to rem if needed
      const convertToRem = (px: number): string => {
        if (options.forceRemUnit) {
          const remBase = options.remBase || 16
          const remValue = px / remBase
          return `${ColorHelper.roundToDecimals(remValue, options.decimals)}rem`
        }
        return `${px}px`
      }

      // Handle color with custom opacity using helper function
      const colorValue = this.handleColorWithCustomOpacity(value.color, value.opacity, allTokens, options)

      return `${value.type === ShadowType.inner ? 'inset ' : ''}${convertToRem(value.x)} ${convertToRem(value.y)} ${convertToRem(value.radius)} ${
        convertToRem(value.spread)
      } ${colorValue}`
    }

    static fontWeightTokenValueToCSS(
      value: AnyStringTokenValue,
      allTokens: Map<string, Token>,
      options: TokenToCSSOptions
    ): string {
      const reference = sureOptionalReference(value.referencedTokenId, allTokens, options.allowReferences)
      if (reference) {
        return options.tokenToVariableRef(reference)
      }

      // Convert text weights to numerical values
      const normalizedWeight = normalizeTextWeight(value.text)
      return `${normalizedWeight}`
    }

    static stringTokenValueToCSS(
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

    static optionTokenValueToCSS(
      option: AnyOptionTokenValue,
      allTokens: Map<string, Token>,
      options: TokenToCSSOptions,
      tokenType: TokenType
    ): string {
      const reference = sureOptionalReference(option.referencedTokenId, allTokens, options.allowReferences)
      if (reference) {
        return options.tokenToVariableRef(reference)
      }
      if (tokenType === TokenType.textCase) {
        return this.textCaseToCSS(option.value as TextCase)
      }
      if (tokenType === TokenType.textDecoration) {
        return this.textDecorationToCSS(option.value as TextDecoration)
      }

      // Visibility values are supported in CSS as is our data model
      return option.value.toLowerCase()
    }

    static blurTokenValueToCSS(blur: BlurTokenValue, allTokens: Map<string, Token>, options: TokenToCSSOptions): string {
      const reference = sureOptionalReference(blur.referencedTokenId, allTokens, options.allowReferences)
      if (reference) {
        return options.tokenToVariableRef(reference)
      }
      return `blur(${this.dimensionTokenValueToCSS(blur.radius, allTokens, options)})`
    }

    static typographyTokenValueToCSS(
      typography: TypographyTokenValue,
      allTokens: Map<string, Token>,
      options: TokenToCSSOptions
    ): string {
      // Reference full typography token if set
      const reference = sureOptionalReference(typography.referencedTokenId, allTokens, options.allowReferences)
      if (reference) {
        return options.tokenToVariableRef(reference)
      }

      // Resolve partial references
      const fontFamilyReference = sureOptionalReference(
        typography.fontFamily.referencedTokenId,
        allTokens,
        options.allowReferences
      )
      const fontWeightReference = sureOptionalReference(
        typography.fontWeight.referencedTokenId,
        allTokens,
        options.allowReferences
      )
      const decorationReference = sureOptionalReference(
        typography.textDecoration.referencedTokenId,
        allTokens,
        options.allowReferences
      )
      const caseReference = sureOptionalReference(
        typography.textCase.referencedTokenId,
        allTokens,
        options.allowReferences
      )

      const data = {
        fontFamily: fontFamilyReference ? options.tokenToVariableRef(fontFamilyReference) : typography.fontFamily.text,
        fontWeight: fontWeightReference
          ? options.tokenToVariableRef(fontWeightReference)
          : normalizeTextWeight(typography.fontWeight.text),
        textDecoration: decorationReference
          ? options.tokenToVariableRef(decorationReference)
          : typography.textDecoration.value === TextDecoration.original
          ? this.textDecorationToCSS(typography.textDecoration.value as TextDecoration)
          : undefined,
        textCase: caseReference
          ? options.tokenToVariableRef(caseReference)
          : typography.textCase.value === TextCase.original
          ? this.textCaseToCSS(typography.textCase.value as TextCase)
          : undefined,
        caps: typography.textCase.value === TextCase.smallCaps,
        fontSize: this.dimensionTokenValueToCSS(typography.fontSize, allTokens, options),
        lineHeight: typography.lineHeight
          ? this.dimensionTokenValueToCSS(typography.lineHeight, allTokens, options)
          : undefined
      }

      // Formal CSS definition: font-style, font-variant, font-weight, font-stretch, font-size, line-height, and font-family.
      // Example: small-caps bold 24px/1rem "Wingdings"
      const fragmentCaps = data.caps ? 'small-caps ' : ''
      const fragmentWeight = data.fontWeight
      const fragmentSize = data.fontSize
      const fragmentLineHeight = data.lineHeight
      const fragmentSizeAndLineHeight = data.lineHeight ? `${fragmentSize}/${fragmentLineHeight}` : fragmentSize
      const fragmentFamily = fontFamilyReference ? data.fontFamily : `\"${data.fontFamily}\"`

      return `${fragmentCaps}${fragmentWeight} ${fragmentSizeAndLineHeight} ${fragmentFamily}`
    }

    static borderStyleToCSS(borderStyle: BorderStyle): string {
      switch (borderStyle) {
        case BorderStyle.dashed:
          return 'dashed'
        case BorderStyle.dotted:
          return 'dotted'
        case BorderStyle.solid:
          return 'solid'
        case BorderStyle.groove:
          return 'groove'
        default:
          return 'solid'
      }
    }

    static borderPositionToCSS(borderPosition: BorderPosition): string {
      switch (borderPosition) {
        case BorderPosition.center:
          return 'center'
        case BorderPosition.inside:
          return 'inside'
        case BorderPosition.outside:
          return 'outside'
        default:
          return 'outside'
      }
    }

    static unitToCSS(unit: Unit): string {
      switch (unit) {
        case Unit.percent:
          return '%'
        case Unit.pixels:
          return 'px'
        case Unit.rem:
          return 'rem'
        case Unit.raw:
          return ''
        case Unit.ms:
          return 'ms'
        default:
          return 'px'
      }
    }

    static textCaseToCSS(textCase: TextCase): string {
      switch (textCase) {
        case TextCase.original:
          return 'none'
        case TextCase.upper:
          return 'uppercase'
        case TextCase.lower:
          return 'lowercase'
        case TextCase.camel:
          return 'capitalize'
        case TextCase.smallCaps:
          return 'small-caps'
      }
    }

    static textDecorationToCSS(textDecoration: TextDecoration): string {
      switch (textDecoration) {
        case TextDecoration.original:
          return 'none'
        case TextDecoration.underline:
          return 'underline'
        case TextDecoration.strikethrough:
          return 'line-through'
      }
    }
  }
  