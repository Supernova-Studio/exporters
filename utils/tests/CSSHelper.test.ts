import {
    BlurToken,
    BlurType,
    BorderPosition,
    BorderStyle,
    BorderToken,
    BorderTokenValue,
    ColorToken,
    ColorTokenValue,
    DimensionToken,
    DimensionTokenValue,
    FontFamilyToken,
    FontWeightToken,
    GradientToken,
    GradientTokenValue,
    GradientType,
    OpacityToken,
    ShadowToken,
    ShadowType,
    StringToken,
    StringTokenValue,
    TextCase,
    TextDecoration,
    Token,
    TokenType,
    TypographyToken,
    Unit
  } from '@supernovaio/sdk-exporters'
  import {
    AnyOptionToken,
    AnyOptionTokenValue,
    BlurTokenValue,
    FontSizeTokenValue,
    LineHeightTokenValue,
    ShadowTokenValue,
    TextCaseTokenValue,
    TypographyTokenValue
  } from '@supernovaio/sdk-exporters'
  import {
    FontFamilyTokenValue,
    FontWeightTokenValue
  } from '@supernovaio/sdk-exporters/build/sdk-typescript/src/model/tokens/SDKTokenValue'
  import { ColorFormat } from '../enums/ColorFormat'
  import { CSSHelper } from '../helpers/CSSHelper'
  import { describe, test, expect } from '@jest/globals'
  
  /** Base formattable color - no refs */
  const testColor: ColorTokenValue = {
    color: {
      r: 135,
      g: 100,
      b: 200,
      referencedTokenId: null
    },
    opacity: {
      measure: 0.5,
      referencedTokenId: null,
      unit: Unit.raw
    },
    referencedTokenId: null
  }
  
  /** Base formattable border */
  const testBorder: BorderTokenValue = {
    color: {
      color: {
        r: 135,
        g: 100,
        b: 200,
        referencedTokenId: null
      },
      opacity: {
        measure: 0.5,
        referencedTokenId: null,
        unit: Unit.raw
      },
      referencedTokenId: null
    },
    width: {
      measure: 1,
      unit: Unit.pixels,
      referencedTokenId: null
    },
    style: BorderStyle.solid,
    position: BorderPosition.outside,
    referencedTokenId: null
  }
  
  const testDimension: DimensionTokenValue = {
    measure: 1,
    unit: Unit.pixels,
    referencedTokenId: null
  }
  
  const testString: StringTokenValue = {
    text: 'test',
    referencedTokenId: null
  }
  
  const testBlur: BlurTokenValue = {
    radius: testDimension,
    referencedTokenId: null,
    type: BlurType.background
  }
  
  const testOption: AnyOptionTokenValue = {
    value: TextCase.lower,
    referencedTokenId: null,
    options: [TextCase.lower, TextCase.upper]
  }
  
  const testOptionTextDecoration: AnyOptionTokenValue = {
    value: TextDecoration.underline,
    referencedTokenId: null,
    options: [TextDecoration.original, TextDecoration.underline, TextDecoration.strikethrough]
  }
  
  const testGradient: GradientTokenValue = {
    type: GradientType.linear,
    aspectRatio: 0,
    from: {
      x: 0,
      y: 0
    },
    to: {
      x: 1,
      y: 1
    },
    stops: [
      {
        position: 0,
        color: testColor
      },
      {
        position: 1,
        color: testColor
      }
    ],
    referencedTokenId: null
  }
  
  const testTypography: TypographyTokenValue = {
    fontFamily: {
      text: 'Arial',
      referencedTokenId: null
    },
    fontWeight: {
      text: '400',
      referencedTokenId: null
    },
    fontSize: {
      measure: 16,
      unit: Unit.pixels,
      referencedTokenId: null
    },
    textDecoration: {
      value: TextDecoration.original,
      referencedTokenId: null
    },
    textCase: {
      value: TextCase.lower,
      referencedTokenId: null
    },
    letterSpacing: {
      measure: 1,
      unit: Unit.pixels,
      referencedTokenId: null
    },
    lineHeight: {
      measure: 1,
      unit: Unit.rem,
      referencedTokenId: null
    } as LineHeightTokenValue,
    paragraphIndent: {
      measure: 1,
      unit: Unit.pixels,
      referencedTokenId: null
    },
    paragraphSpacing: {
      measure: 1,
      unit: Unit.pixels,
      referencedTokenId: null
    },
    referencedTokenId: null
  }
  
  const testShadow: ShadowTokenValue = {
    color: {
      ...testColor,
      opacity: {
        measure: 1,
        referencedTokenId: null,
        unit: Unit.raw
      }
    },
    x: 3,
    y: 4,
    radius: 5,
    spread: 6,
    opacity: testColor.opacity,
    type: ShadowType.drop,
    referencedTokenId: null
  }
  
  const testShadowNoOpacity: ShadowTokenValue = {
    color: testColor,
    x: 3,
    y: 4,
    radius: 5,
    spread: 6,
    type: ShadowType.drop,
    referencedTokenId: null
  }
  
  /** Base formatting options */
  const testOptions = {
    allowReferences: true,
    colorFormat: ColorFormat.smartHashHex,
    decimals: 3,
    tokenToVariableRef: (colorToken) => {
      return `var(--${colorToken.name})`
    }
  }
  
  const tokens = new Map<string, Token>()
  tokens.set('colorRef', {
    value: testColor,
    name: 'colorRef'
  } as ColorToken)
  tokens.set('opacityRef', {
    value: testColor.opacity,
    name: 'opacityRef'
  } as OpacityToken)
  tokens.set('borderRef', {
    value: testBorder,
    name: 'borderRef'
  } as BorderToken)
  tokens.set('dimensionRef', {
    value: testDimension,
    name: 'dimensionRef'
  } as DimensionToken)
  tokens.set('gradientRef', {
    value: [testGradient],
    name: 'gradientRef'
  } as GradientToken)
  tokens.set('stringRef', {
    value: testString,
    name: 'stringRef'
  } as StringToken)
  tokens.set('optionRef', {
    value: testOption,
    name: 'optionRef'
  } as AnyOptionToken)
  tokens.set('blurRef', {
    value: testBlur,
    name: 'blurRef'
  } as BlurToken)
  tokens.set('shadowRef', {
    value: [testShadow],
    name: 'shadowRef'
  } as ShadowToken)
  tokens.set('shadowNoOpacityRef', {
    value: [testShadowNoOpacity],
    name: 'shadowNoOpacityRef'
  } as ShadowToken)
  tokens.set('typographyRef', {
    value: testTypography,
    name: 'typographyRef'
  } as TypographyToken)
  tokens.set('fontFamilyRef', {
    value: testTypography.fontFamily,
    name: 'fontFamilyRef'
  } as FontFamilyToken)
  tokens.set('fontWeightRef', {
    value: testTypography.fontWeight,
    name: 'fontWeightRef'
  } as FontWeightToken)
  
  test('toCSS_colorToken_1', () => {
    let color = {
      ...testColor
    }
    expect(CSSHelper.colorTokenValueToCSS(color, tokens, testOptions)).toBe('#8764c880')
  })
  
  test('toCSS_colorToken_2', () => {
    let color = {
      ...testColor,
      referencedTokenId: 'colorRef'
    }
    expect(CSSHelper.colorTokenValueToCSS(color, tokens, testOptions)).toBe('var(--colorRef)')
  })
  
  test('toCSS_colorToken_3', () => {
    let color = {
      ...testColor,
      color: {
        ...testColor.color,
        referencedTokenId: 'colorRef'
      }
    }
    expect(
      CSSHelper.colorTokenValueToCSS(color, tokens, {
        ...testOptions,
        colorFormat: ColorFormat.smartRgba
      })
    ).toBe('rgba(135, 100, 200, 0.5)')
  })
  
  test('toCSS_colorToken_4', () => {
    let color = {
      ...testColor,
      opacity: {
        ...testColor.opacity,
        referencedTokenId: 'opacityRef'
      }
    }
    expect(
      CSSHelper.colorTokenValueToCSS(color, tokens, {
        ...testOptions,
        colorFormat: ColorFormat.smartRgba
      })
    ).toBe('rgba(135, 100, 200, var(--opacityRef))')
  })
  
  test('toCSS_colorToken_disabledReference', () => {
    let color = {
      ...testColor,
      referencedTokenId: 'colorRef'
    }
    expect(
      CSSHelper.colorTokenValueToCSS(color, tokens, {
        ...testOptions,
        allowReferences: false
      })
    ).toBe('#8764c880')
  })
  
  test('toCSS_colorToken_border_1', () => {
    let border = {
      ...testBorder
    }
    expect(CSSHelper.borderTokenValueToCSS(border, tokens, testOptions)).toBe('1px solid #8764c880')
  })
  
  test('toCSS_colorToken_border_2', () => {
    let border = {
      ...testBorder,
      referencedTokenId: 'borderRef'
    }
    expect(CSSHelper.borderTokenValueToCSS(border, tokens, testOptions)).toBe('var(--borderRef)')
  })
  
  test('toCSS_colorToken_border_3', () => {
    let border = {
      ...testBorder,
      color: { ...testBorder.color, referencedTokenId: 'colorRef' },
      width: { ...testBorder.width, referencedTokenId: 'dimensionRef' }
    }
    expect(CSSHelper.borderTokenValueToCSS(border, tokens, testOptions)).toBe('var(--dimensionRef) solid var(--colorRef)')
  })
  
  test('toCSS_gradientToken_1', () => {
    let gradient = {
      ...testGradient
    }
    expect(CSSHelper.gradientTokenValueToCSS([gradient], tokens, testOptions)).toBe(
      'linear-gradient(135deg, #8764c880 0%, #8764c880 100%)'
    )
  })
  
  test('toCSS_gradientToken_2', () => {
    let gradient = {
      ...testGradient,
      referencedTokenId: 'gradientRef'
    }
    expect(CSSHelper.gradientTokenValueToCSS([gradient], tokens, testOptions)).toBe('var(--gradientRef)')
  })
  
  test('toCSS_gradientToken_3', () => {
    let gradient = {
      ...testGradient,
      referencedTokenId: 'gradientRef'
    }
    expect(CSSHelper.gradientTokenValueToCSS([gradient, { ...testGradient }], tokens, testOptions)).toBe(
      'var(--gradientRef), linear-gradient(135deg, #8764c880 0%, #8764c880 100%)'
    )
  })
  
  test('toCSS_gradientToken_4', () => {
    let gradient = {
      ...testGradient,
      stops: [
        {
          position: 0,
          color: {
            ...testColor,
            referencedTokenId: 'colorRef'
          }
        },
        {
          position: 1,
          color: testColor
        }
      ]
    }
  
    expect(CSSHelper.gradientTokenValueToCSS([gradient], tokens, testOptions)).toBe(
      'linear-gradient(135deg, var(--colorRef) 0%, #8764c880 100%)'
    )
  })
  
  test('toCSS_dimensionToken_1', () => {
    let dimension = {
      ...testDimension
    }
    expect(CSSHelper.dimensionTokenValueToCSS(dimension, tokens, testOptions)).toBe('1px')
  })
  
  test('toCSS_dimensionToken_2', () => {
    let dimension = {
      ...testDimension,
      referencedTokenId: 'dimensionRef'
    }
    expect(CSSHelper.dimensionTokenValueToCSS(dimension, tokens, testOptions)).toBe('var(--dimensionRef)')
  })
  
  test('toCSS_stringToken_1', () => {
    let string = {
      ...testString
    }
    expect(CSSHelper.stringTokenValueToCSS(string, tokens, testOptions)).toBe('"test"')
  })
  
  test('toCSS_stringToken_2', () => {
    let string = {
      ...testString,
      referencedTokenId: 'stringRef'
    }
    expect(CSSHelper.stringTokenValueToCSS(string, tokens, testOptions)).toBe('var(--stringRef)')
  })
  
  test('toCSS_optionToken_1', () => {
    let option = {
      ...testOption
    }
    expect(CSSHelper.optionTokenValueToCSS(option, tokens, testOptions, TokenType.textCase)).toBe('lowercase')
  })
  
  test('toCSS_optionToken_2', () => {
    let option = {
      ...testOption,
      referencedTokenId: 'optionRef'
    }
    expect(CSSHelper.optionTokenValueToCSS(option, tokens, testOptions, TokenType.textCase)).toBe('var(--optionRef)')
  })
  
  test('toCSS_optionTextDecorationToken_1', () => {
    let option = {
      ...testOptionTextDecoration
    }
    expect(CSSHelper.optionTokenValueToCSS(option, tokens, testOptions, TokenType.textDecoration)).toBe('underline')
  })
  
  test('toCSS_optionTextDecorationToken_2', () => {
    let option = {
      ...testOptionTextDecoration,
      value: TextDecoration.strikethrough
    }
    expect(CSSHelper.optionTokenValueToCSS(option, tokens, testOptions, TokenType.textDecoration)).toBe('line-through')
  })
  
  test('toCSS_blurToken_1', () => {
    let blur = {
      ...testBlur
    }
    expect(CSSHelper.blurTokenValueToCSS(blur, tokens, testOptions)).toBe('blur(1px)')
  })
  
  test('toCSS_blurToken_2', () => {
    let blur = {
      ...testBlur,
      referencedTokenId: 'blurRef'
    }
    expect(CSSHelper.blurTokenValueToCSS(blur, tokens, testOptions)).toBe('var(--blurRef)')
  })
  
  test('toCSS_shadowToken_1', () => {
    let shadow = {
      ...testShadow
    }
    expect(CSSHelper.shadowTokenValueToCSS([shadow], tokens, testOptions)).toBe('3px 4px 5px 6px #8764c880')
  })
  
  test('toCSS_shadowToken_2', () => {
    let shadow = {
      ...testShadow,
      referencedTokenId: 'shadowRef'
    }
    expect(CSSHelper.shadowTokenValueToCSS([shadow], tokens, testOptions)).toBe('var(--shadowRef)')
  })
  
  test('toCSS_shadowToken_3', () => {
    let shadow = {
      ...testShadow,
      color: { ...testShadow.color, referencedTokenId: 'colorRef' }
    }
    expect(CSSHelper.shadowTokenValueToCSS([shadow], tokens, testOptions)).toBe('3px 4px 5px 6px var(--colorRef)')
  })
  
  test('toCSS_shadowToken_4', () => {
    let shadow = {
      ...testShadow,
      color: { ...testShadow.color, referencedTokenId: 'colorRef' }
    }
    expect(CSSHelper.shadowTokenValueToCSS([testShadow, shadow], tokens, testOptions)).toBe(
      '3px 4px 5px 6px #8764c880, 3px 4px 5px 6px var(--colorRef)'
    )
  })
  
  test('toCSS_shadowTokenNoOpacity_1', () => {
    let shadow = {
      ...testShadowNoOpacity
    }
    expect(CSSHelper.shadowTokenValueToCSS([shadow], tokens, testOptions)).toBe('3px 4px 5px 6px #8764c880')
  })
  
  test('toCSS_shadowTokenNoOpacity_2', () => {
    let shadow = {
      ...testShadowNoOpacity,
      referencedTokenId: 'shadowNoOpacityRef'
    }
    expect(CSSHelper.shadowTokenValueToCSS([shadow], tokens, testOptions)).toBe('var(--shadowNoOpacityRef)')
  })
  
  test('toCSS_shadowTokenNoOpacity_3', () => {
    let shadow = {
      ...testShadowNoOpacity,
      color: { ...testShadowNoOpacity.color, referencedTokenId: 'colorRef' }
    }
    expect(CSSHelper.shadowTokenValueToCSS([shadow], tokens, testOptions)).toBe('3px 4px 5px 6px var(--colorRef)')
  })
  
  test('toCSS_shadowTokenNoOpacity_4', () => {
    let shadow = {
      ...testShadowNoOpacity,
      color: { ...testShadowNoOpacity.color, referencedTokenId: 'colorRef' }
    }
    expect(CSSHelper.shadowTokenValueToCSS([testShadowNoOpacity, shadow], tokens, testOptions)).toBe(
      '3px 4px 5px 6px #8764c880, 3px 4px 5px 6px var(--colorRef)'
    )
  })
  
  test('toCSS_typographyToken_1', () => {
    let typography = {
      ...testTypography
    }
    expect(CSSHelper.typographyTokenValueToCSS(typography, tokens, testOptions)).toBe('400 16px/1rem "Arial"')
  })
  
  test('toCSS_typographyToken_2', () => {
    let typography = {
      ...testTypography,
      referencedTokenId: 'typographyRef'
    }
    expect(CSSHelper.typographyTokenValueToCSS(typography, tokens, testOptions)).toBe('var(--typographyRef)')
  })
  
  test('toCSS_typographyToken_3', () => {
    let typography = {
      ...testTypography,
      lineHeight: { ...testTypography.lineHeight, referencedTokenId: 'dimensionRef' } as LineHeightTokenValue
    }
    expect(CSSHelper.typographyTokenValueToCSS(typography, tokens, testOptions)).toBe(
      '400 16px/var(--dimensionRef) "Arial"'
    )
  })
  
  test('toCSS_typographyToken_4', () => {
    let typography = {
      ...testTypography,
      fontSize: { ...testTypography.fontSize, referencedTokenId: 'dimensionRef' } as FontSizeTokenValue,
      lineHeight: { ...testTypography.lineHeight, referencedTokenId: 'dimensionRef' } as LineHeightTokenValue
    }
    expect(CSSHelper.typographyTokenValueToCSS(typography, tokens, testOptions)).toBe(
      '400 var(--dimensionRef)/var(--dimensionRef) "Arial"'
    )
  })
  
  test('toCSS_typographyToken_5', () => {
    let typography = {
      ...testTypography,
      fontSize: { ...testTypography.fontSize, referencedTokenId: 'dimensionRef' } as FontSizeTokenValue,
      lineHeight: { ...testTypography.lineHeight, referencedTokenId: 'dimensionRef' } as LineHeightTokenValue,
      textCase: { ...testTypography.textCase, value: TextCase.smallCaps } as TextCaseTokenValue
    }
    expect(CSSHelper.typographyTokenValueToCSS(typography, tokens, testOptions)).toBe(
      'small-caps 400 var(--dimensionRef)/var(--dimensionRef) "Arial"'
    )
  })
  
  test('toCSS_typographyToken_6', () => {
    let typography = {
      ...testTypography,
      fontFamily: { ...testTypography.fontFamily, referencedTokenId: 'fontFamilyRef' } as FontFamilyTokenValue,
      fontWeight: { ...testTypography.fontWeight, referencedTokenId: 'fontWeightRef' } as FontWeightTokenValue,
      fontSize: { ...testTypography.fontSize, referencedTokenId: 'dimensionRef' } as FontSizeTokenValue,
      lineHeight: { ...testTypography.lineHeight, referencedTokenId: 'dimensionRef' } as LineHeightTokenValue,
      textCase: { ...testTypography.textCase, value: TextCase.smallCaps } as TextCaseTokenValue
    }
    expect(CSSHelper.typographyTokenValueToCSS(typography, tokens, testOptions)).toBe(
      'small-caps var(--fontWeightRef) var(--dimensionRef)/var(--dimensionRef) var(--fontFamilyRef)'
    )
  })
  
  test('toCSS_typographyToken_7', () => {
    let typography = {
      ...testTypography,
      lineHeight: null
    }
    expect(CSSHelper.typographyTokenValueToCSS(typography, tokens, testOptions)).toBe('400 16px "Arial"')
  })
  
  test('toCSS_gradientToken_radial', () => {
    let gradient = {
      ...testGradient,
      type: GradientType.radial
    }
    expect(CSSHelper.gradientTokenValueToCSS([gradient], tokens, testOptions)).toBe(
      'radial-gradient(circle, #8764c880 0%, #8764c880 100%)'
    )
  })
  
  test('toCSS_gradientToken_angular', () => {
    let gradient = {
      ...testGradient,
      type: GradientType.angular
    }
    expect(CSSHelper.gradientTokenValueToCSS([gradient], tokens, testOptions)).toBe(
      'conic-gradient(#8764c880 0%, #8764c880 100%)'
    )
  })
  
  test('toCSS_gradientToken_angles', () => {
    const testAngles = [
      { from: { x: 0, y: 0 }, to: { x: 1, y: 1 }, expected: 'linear-gradient(135deg, #8764c880 0%, #8764c880 100%)' },
      { from: { x: 0, y: 0 }, to: { x: 1, y: -1 }, expected: 'linear-gradient(45deg, #8764c880 0%, #8764c880 100%)' },
      { from: { x: 0, y: 0 }, to: { x: -1, y: -1 }, expected: 'linear-gradient(-45deg, #8764c880 0%, #8764c880 100%)' },
      { from: { x: 0, y: 0 }, to: { x: -1, y: 1 }, expected: 'linear-gradient(-135deg, #8764c880 0%, #8764c880 100%)' }
    ]

    testAngles.forEach(({ from, to, expected }) => {
      let gradient = {
        ...testGradient,
        from,
        to
      }
      expect(CSSHelper.gradientTokenValueToCSS([gradient], tokens, testOptions)).toBe(expected)
    })
  })
  
  test('toCSS_shadowToken_inner', () => {
    let shadow = {
      ...testShadow,
      type: ShadowType.inner
    }
    expect(CSSHelper.shadowTokenValueToCSS([shadow], tokens, testOptions)).toBe('inset 3px 4px 5px 6px #8764c880')
  })
  
  test('toCSS_borderStyles', () => {
    const styles = [
      { style: BorderStyle.dashed, expected: 'dashed' },
      { style: BorderStyle.dotted, expected: 'dotted' },
      { style: BorderStyle.groove, expected: 'groove' },
      { style: 'invalid' as BorderStyle, expected: 'solid' }
    ]

    styles.forEach(({ style, expected }) => {
      expect(CSSHelper.borderStyleToCSS(style)).toBe(expected)
    })
  })
  
  test('toCSS_borderPositions', () => {
    const positions = [
      { position: BorderPosition.center, expected: 'center' },
      { position: BorderPosition.inside, expected: 'inside' },
      { position: 'invalid' as BorderPosition, expected: 'outside' }
    ]

    positions.forEach(({ position, expected }) => {
      expect(CSSHelper.borderPositionToCSS(position)).toBe(expected)
    })
  })
  
  test('toCSS_units', () => {
    const units = [
      { unit: Unit.percent, expected: '%' },
      { unit: Unit.ms, expected: 'ms' },
      { unit: 'invalid' as Unit, expected: 'px' }
    ]

    units.forEach(({ unit, expected }) => {
      expect(CSSHelper.unitToCSS(unit)).toBe(expected)
    })
  })
  
  test('toCSS_textCases', () => {
    const cases = [
      { textCase: TextCase.camel, expected: 'capitalize' },
      { textCase: TextCase.smallCaps, expected: 'small-caps' }
    ]

    cases.forEach(({ textCase, expected }) => {
      expect(CSSHelper.textCaseToCSS(textCase)).toBe(expected)
    })
  })
  
  test('toCSS_optionToken_visibility', () => {
    const visibilityOption = {
      value: 'visible',
      referencedTokenId: null,
      options: ['visible', 'hidden']
    }
    expect(CSSHelper.optionTokenValueToCSS(visibilityOption, tokens, testOptions, TokenType.visibility)).toBe('visible')
  })
  
  describe('referenced colors in border, gradient and shadow tokens', () => {
    const colorValue = (r: number, g: number, b: number): ColorTokenValue => ({
      color: { r, g, b, referencedTokenId: null },
      opacity: { measure: 1, referencedTokenId: null, unit: Unit.raw },
      referencedTokenId: null
    })
    const colorToken = (id: string, value: ColorTokenValue) =>
      ({ id, name: id, tokenType: TokenType.color, value } as ColorToken)
    const referenceTo = (token: ColorToken): ColorTokenValue => ({ ...token.value, referencedTokenId: token.id })

    const brand = colorToken('brand', colorValue(49, 92, 253))
    const stopA = colorToken('a', colorValue(255, 0, 0))
    const stopB = colorToken('b', colorValue(0, 0, 255))
    const shadowColor = colorToken('shadowColor', colorValue(0, 0, 0))

    const border: BorderTokenValue = { ...testBorder, color: referenceTo(brand) }
    const gradient: GradientTokenValue = {
      ...testGradient,
      stops: [
        { position: 0, color: referenceTo(stopA) },
        { position: 1, color: referenceTo(stopB) }
      ]
    }
    const shadow: ShadowTokenValue = {
      ...testShadow,
      color: referenceTo(shadowColor),
      opacity: { measure: 0.08, referencedTokenId: null, unit: Unit.raw }
    }

    const allTokens = new Map<string, Token>([brand, stopA, stopB, shadowColor].map((token) => [token.id, token]))
    const options = {
      ...testOptions,
      tokenToVariableRef: (token: Token, context?: { needsRgb?: boolean }) =>
        context?.needsRgb ? `var(--rgb-${token.name})` : `var(--${token.name})`
    }
    /** Options of an exporter that writes channel variables, with names by format as the CSS and Tailwind exporters write them */
    const channelOptionsFor = (colorFormat: ColorFormat) => ({
      ...testOptions,
      colorFormat,
      writesColorChannels: true,
      tokenToVariableRef: (token: Token, context?: { needsRgb?: boolean }) =>
        context?.needsRgb
          ? `var(--${CSSHelper.channelPrefix(colorFormat)}-${token.name})`
          : `var(--${token.name})`
    })
    const channelOptions = channelOptionsFor(testOptions.colorFormat)

    test('border uses the referenced color variable', () => {
      expect(CSSHelper.borderTokenValueToCSS(border, allTokens, options)).toBe('1px solid var(--brand)')
    })

    test('border uses the referenced color variable in an OKLCH format', () => {
      expect(
        CSSHelper.borderTokenValueToCSS(border, allTokens, { ...options, colorFormat: ColorFormat.smartOklch })
      ).toBe('1px solid var(--brand)')
    })

    test('border uses the raw color when references are off', () => {
      expect(CSSHelper.borderTokenValueToCSS(border, allTokens, { ...options, allowReferences: false })).toBe(
        '1px solid #315cfd'
      )
    })

    test('gradient stops use the referenced color variables', () => {
      expect(CSSHelper.gradientTokenValueToCSS([gradient], allTokens, options)).toBe(
        'linear-gradient(135deg, var(--a) 0%, var(--b) 100%)'
      )
    })

    test('shadow with its own opacity uses the color channels', () => {
      expect(CSSHelper.shadowTokenValueToCSS([shadow], allTokens, channelOptions)).toBe(
        '3px 4px 5px 6px rgba(var(--rgb-shadowColor), 0.08)'
      )
    })

    test('shadow with its own opacity is the resolved color when the exporter writes no channels', () => {
      expect(CSSHelper.shadowTokenValueToCSS([shadow], allTokens, options)).toBe('3px 4px 5px 6px #00000014')
    })

    test('shadow with its own opacity uses the oklch channels in an OKLCH format', () => {
      expect(
        CSSHelper.shadowTokenValueToCSS([shadow], allTokens, channelOptionsFor(ColorFormat.smartOklch))
      ).toBe('3px 4px 5px 6px oklch(var(--oklch-shadowColor) / 0.08)')
    })

    test('shadow with its own opacity uses the resolved color when references are off', () => {
      expect(CSSHelper.shadowTokenValueToCSS([shadow], allTokens, { ...channelOptions, allowReferences: false })).toBe(
        '3px 4px 5px 6px #00000014'
      )
    })

    /** A color that takes its RGB from another color and adds its own opacity, as SDK 2.6.1 hands it to exporters */
    const ownOpacity = (source: ColorToken, measure: number, opacityRef: string | null = null): ColorTokenValue => ({
      color: { ...source.value.color, referencedTokenId: source.id },
      opacity: { measure, referencedTokenId: opacityRef, unit: Unit.raw },
      referencedTokenId: null
    })
    const brand40 = colorToken('brand40', ownOpacity(brand, 0.4))
    const opacity40 = { id: 'opacity40', name: 'opacity40', tokenType: TokenType.opacity, value: { measure: 0.4, unit: Unit.raw, referencedTokenId: null } } as OpacityToken
    const channelTokens = new Map<string, Token>([...allTokens, ['brand40', brand40], ['opacity40', opacity40]])

    test.each(Object.values(ColorFormat))('color with its own opacity references the source channels in %s', (format) => {
      const expected = CSSHelper.channelPrefix(format) === 'oklch' ? 'oklch(var(--oklch-brand) / 0.4)' : 'rgba(var(--rgb-brand), 0.4)'
      expect(CSSHelper.tokenToCSS(brand40, channelTokens, channelOptionsFor(format))).toBe(expected)
    })

    test('color with its own opacity is the resolved color when the exporter writes no channels', () => {
      expect(CSSHelper.tokenToCSS(brand40, channelTokens, { ...options, colorFormat: ColorFormat.smartRgba })).toBe(
        'rgba(49, 92, 253, 0.4)'
      )
      expect(CSSHelper.tokenToCSS(brand40, channelTokens, options)).toBe('#315cfd66')
    })

    test('color with its own opacity is the resolved color when references are off', () => {
      expect(CSSHelper.tokenToCSS(brand40, channelTokens, { ...channelOptions, allowReferences: false })).toBe('#315cfd66')
    })

    test('color with its own opacity references an opacity token', () => {
      const value = ownOpacity(brand, 0.4, 'opacity40')
      expect(CSSHelper.colorTokenValueToCSS(value, channelTokens, channelOptions)).toBe(
        'rgba(var(--rgb-brand), var(--opacity40))'
      )
    })

    test('color with its own opacity always writes the alpha', () => {
      expect(CSSHelper.colorTokenValueToCSS(ownOpacity(brand, 1), channelTokens, channelOptions)).toBe(
        'rgba(var(--rgb-brand), 1)'
      )
    })

    test('a color that aliases a color with its own opacity is a var() of it', () => {
      expect(CSSHelper.colorTokenValueToCSS(referenceTo(brand40), channelTokens, channelOptions)).toBe('var(--brand40)')
    })

    test('a chain of colors with their own opacity references the direct source', () => {
      expect(CSSHelper.colorTokenValueToCSS(ownOpacity(brand40, 0.2), channelTokens, channelOptions)).toBe(
        'rgba(var(--rgb-brand40), 0.2)'
      )
    })

    test('channel values have no alpha, in RGB and OKLCH', () => {
      expect(CSSHelper.colorChannels(brand.value, ColorFormat.smartHashHex)).toBe('49, 92, 253')
      expect(CSSHelper.colorChannels(stopA.value, ColorFormat.smartOklch)).toBe('62.8% 0.258 29.23')
    })

    test('colors used with their own opacity need channels', () => {
      const tokenList: Array<Token> = [
        ...allTokens.values(),
        brand40,
        { id: 'border', name: 'border', tokenType: TokenType.border, value: { ...border, color: ownOpacity(stopB, 0.5) } } as BorderToken,
        { id: 'gradient', name: 'gradient', tokenType: TokenType.gradient, value: [{ ...gradient, stops: [{ position: 0, color: ownOpacity(stopA, 0.3) }] }] } as GradientToken,
        { id: 'shadow', name: 'shadow', tokenType: TokenType.shadow, value: [shadow] } as ShadowToken
      ]
      expect(CSSHelper.colorTokenIdsNeedingChannels(tokenList, true)).toEqual(new Set(['shadowColor', 'brand', 'b', 'a']))
      expect(CSSHelper.colorTokenIdsNeedingChannels(tokenList, false)).toEqual(new Set())
    })

    test('a referenced border or gradient color without its own opacity needs no channels', () => {
      const tokenList: Array<Token> = [
        ...allTokens.values(),
        { id: 'border', name: 'border', tokenType: TokenType.border, value: border } as BorderToken,
        { id: 'gradient', name: 'gradient', tokenType: TokenType.gradient, value: [gradient] } as GradientToken
      ]
      expect(CSSHelper.colorTokenIdsNeedingChannels(tokenList, true)).toEqual(new Set())
    })
  })
