import { ColorToken, ColorTokenValue, OpacityToken, Token, Unit } from '@supernovaio/sdk-exporters'
import { ColorFormat } from '../enums/ColorFormat'
import { ColorHelper } from '../helpers/ColorHelper'
import { test, expect } from '@jest/globals'

const testDecimals = 3
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
const testOptions = {
  allowReferences: true,
  colorFormat: ColorFormat.smartRgba,
  decimals: testDecimals,
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

test('formattedColor_hex6', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.hex6, testDecimals)).toBe('8764c8')
})

test('formattedColor_hex8', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.hex8, testDecimals)).toBe('8764c880')
})

test('formattedColor_hashHex6', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.hashHex6, testDecimals)).toBe('#8764c8')
})

test('formattedColor_hashHex8', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.hashHex8, testDecimals)).toBe('#8764c880')
})

test('formattedColor_smartHex', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.smartHex, testDecimals)).toBe('8764c880')
})

test('formattedColor_smartHashHex', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.smartHashHex, testDecimals)).toBe('#8764c880')
})

test('formattedColor_rgb', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.rgb, testDecimals)).toBe('rgb(135, 100, 200)')
})

test('formattedColor_rgba', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.rgba, testDecimals)).toBe('rgba(135, 100, 200, 0.5)')
})

test('formattedColor_smartRgba', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.smartRgba, testDecimals)).toBe('rgba(135, 100, 200, 0.5)')
})

test('formattedColor_smartRgba', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.smartRgba, testDecimals)).toBe('rgba(135, 100, 200, 0.5)')
})

test('formattedColor_hsl', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.hsl, testDecimals)).toBe('hsl(261%, 48%, 59%)')
})

test('formattedColor_hsla', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.hsla, testDecimals)).toBe('hsla(261%, 48%, 59%, 0.5)')
})

test('formattedColor_smartHsla', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.smartHsla, testDecimals)).toBe('hsla(261%, 48%, 59%, 0.5)')
})

test('formattedColor_smartUIColor', () => {
  expect(ColorHelper.formattedColor(testColor, ColorFormat.smartUIColor, testDecimals)).toBe(
    'UIColor(rgb: 0x8764c8).withAlphaComponent(0.5)'
  )
})

test('formattedColorOrVariableName_raw', () => {
  const color: ColorTokenValue = {
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

  expect(ColorHelper.formattedColorOrVariableName(color, tokens, testOptions)).toBe('rgba(135, 100, 200, 0.5)')
})

test('formattedColorOrVariableName_fullReference', () => {
  const color: ColorTokenValue = {
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
    referencedTokenId: 'colorRef'
  }

  expect(ColorHelper.formattedColorOrVariableName(color, tokens, testOptions)).toBe('var(--colorRef)')
})

test('formattedColorOrVariableName_partialColorReference', () => {
  const color: ColorTokenValue = {
    ...testColor,
    color: {
      ...testColor.color,
      referencedTokenId: 'colorRef'
    }
  }

  expect(ColorHelper.formattedColorOrVariableName(color, tokens, testOptions)).toBe('rgba(var(--colorRef), 0.5)')
})

test('formattedColorOrVariableName_partialOpacityReference', () => {
  const color: ColorTokenValue = {
    ...testColor,
    opacity: {
      ...testColor.opacity,
      referencedTokenId: 'opacityRef'
    }
  }

  expect(ColorHelper.formattedColorOrVariableName(color, tokens, testOptions)).toBe(
    'rgba(135, 100, 200, var(--opacityRef))'
  )
})

test('formattedColorOrVariableName_partialBothReferences', () => {
  const color: ColorTokenValue = {
    ...testColor,
    color: {
      ...testColor.color,
      referencedTokenId: 'colorRef'
    },
    opacity: {
      ...testColor.opacity,
      referencedTokenId: 'opacityRef'
    }
  }

  expect(ColorHelper.formattedColorOrVariableName(color, tokens, testOptions)).toBe(
    'rgba(var(--colorRef), var(--opacityRef))'
  )
})

test('roundToDecimals handles various decimal places', () => {
  expect(ColorHelper.roundToDecimals(1.23456, 2)).toBe(1.23)
  expect(ColorHelper.roundToDecimals(1.23456, 3)).toBe(1.235) // Tests rounding
  expect(ColorHelper.roundToDecimals(1.20000, 2)).toBe(1.2) // Tests removing trailing zeros
  expect(ColorHelper.roundToDecimals(1, 2)).toBe(1) // Tests whole numbers
})

test('formattedColor_hsl handles grayscale colors', () => {
  const grayColor: ColorTokenValue = {
    color: {
      r: 128,
      g: 128,
      b: 128,
      referencedTokenId: null
    },
    opacity: {
      measure: 1,
      referencedTokenId: null,
      unit: Unit.raw
    },
    referencedTokenId: null
  }

  expect(ColorHelper.formattedColor(grayColor, ColorFormat.hsl, testDecimals)).toBe('hsl(0%, 0%, 50%)')
})

test('formattedColor_hsl handles various color cases', () => {
  // Test when red is max
  const redMaxColor: ColorTokenValue = {
    color: { r: 255, g: 0, b: 100, referencedTokenId: null },
    opacity: { measure: 1, referencedTokenId: null, unit: Unit.raw },
    referencedTokenId: null
  }
  
  // Test when green is max
  const greenMaxColor: ColorTokenValue = {
    color: { r: 100, g: 255, b: 0, referencedTokenId: null },
    opacity: { measure: 1, referencedTokenId: null, unit: Unit.raw },
    referencedTokenId: null
  }
  
  // Test when blue is max
  const blueMaxColor: ColorTokenValue = {
    color: { r: 0, g: 100, b: 255, referencedTokenId: null },
    opacity: { measure: 1, referencedTokenId: null, unit: Unit.raw },
    referencedTokenId: null
  }

  expect(ColorHelper.formattedColor(redMaxColor, ColorFormat.hsl, testDecimals)).toMatch(/^hsl\(\d+%, \d+%, \d+%\)$/)
  expect(ColorHelper.formattedColor(greenMaxColor, ColorFormat.hsl, testDecimals)).toMatch(/^hsl\(\d+%, \d+%, \d+%\)$/)
  expect(ColorHelper.formattedColor(blueMaxColor, ColorFormat.hsl, testDecimals)).toMatch(/^hsl\(\d+%, \d+%, \d+%\)$/)
})

test('formattedColor_hsl converts #6A6661 to hsl(33%, 4%, 40%)', () => {
  // #6A6661 = RGB(106, 102, 97)
  const testColor: ColorTokenValue = {
    color: {
      r: 106,
      g: 102,
      b: 97,
      referencedTokenId: null
    },
    opacity: {
      measure: 1,
      referencedTokenId: null,
      unit: Unit.raw
    },
    referencedTokenId: null
  }

  expect(ColorHelper.formattedColor(testColor, ColorFormat.hsl, testDecimals)).toBe('hsl(33%, 4%, 40%)')
})

test('formattedColor handles fractional RGB values', () => {
  const fractionalColor: ColorTokenValue = {
    color: {
      r: 128.6,
      g: 64.3,
      b: 32.8,
      referencedTokenId: null
    },
    opacity: {
      measure: 0.5,
      referencedTokenId: null,
      unit: Unit.raw
    },
    referencedTokenId: null
  }

  // Test that fractional values are properly rounded
  expect(ColorHelper.formattedColor(fractionalColor, ColorFormat.rgb, testDecimals))
    .toBe('rgb(129, 64, 33)')
})
const anotherColor: ColorTokenValue = {
    color: {
      r: 135,
      g: 100,
      b: 200,
      referencedTokenId: null
    },
    opacity: {
      measure: 1,
      referencedTokenId: null,
      unit: Unit.raw
    },
    referencedTokenId: null
  }

  // Test with alpha = 1 (should omit alpha)
  const anotherOpaqueColor: ColorTokenValue = {
    ...anotherColor,
    opacity: {
      measure: 0.5,
      referencedTokenId: null,
      unit: Unit.raw
    }
  }
test('formattedColor_oklch', () => {
  
  
  expect(ColorHelper.formattedColor(anotherColor, ColorFormat.oklch, testDecimals))
    .toBe('oklch(58.38% 0.151 297.71)')
})

test('formattedColor_oklcha', () => {
  expect(ColorHelper.formattedColor(anotherOpaqueColor, ColorFormat.oklcha, testDecimals))
    .toBe('oklch(58.38% 0.151 297.71 / 50%)')
})

test('formattedColor_smartOklch', () => {
  
  expect(ColorHelper.formattedColor(anotherColor, ColorFormat.smartOklch, testDecimals))
    .toBe('oklch(58.38% 0.151 297.71)')

  // Test with alpha < 1 (should include alpha)
  expect(ColorHelper.formattedColor(anotherOpaqueColor, ColorFormat.smartOklch, testDecimals))
    .toBe('oklch(58.38% 0.151 297.71 / 50%)')
})
