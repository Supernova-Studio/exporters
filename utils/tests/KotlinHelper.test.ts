import {
  BorderPosition,
  BorderStyle,
  ColorToken,
  ColorTokenValue,
  GradientType,
  OpacityToken,
  OpacityTokenValue,
  ShadowTokenValue,
  ShadowType,
  Token,
  TokenType,
  Unit
} from "@supernovaio/sdk-exporters"
import { ImportCollector, KotlinHelper, TokenToKotlinOptions } from "../helpers/KotlinHelper"

const opacity = (measure: number, referencedTokenId: string | null = null): OpacityTokenValue => ({
  measure,
  referencedTokenId,
  unit: Unit.raw
})
const colorToken = (id: string, value: ColorTokenValue) =>
  ({ id, name: id, tokenType: TokenType.color, value }) as unknown as ColorToken

const gray900 = colorToken("gray900", {
  color: { r: 17, g: 24, b: 39, referencedTokenId: null },
  opacity: opacity(1),
  referencedTokenId: null
})
const opacity40 = {
  id: "opacity40",
  name: "opacity40",
  tokenType: TokenType.opacity,
  value: opacity(0.4)
} as unknown as OpacityToken
const tokens = new Map<string, Token>([
  [gray900.id, gray900],
  [opacity40.id, opacity40]
])
const options: TokenToKotlinOptions = {
  allowReferences: true,
  decimals: 0,
  indent: 4,
  tokenToVariableRef: (t) => t.name
}
const noReferences: TokenToKotlinOptions = { ...options, allowReferences: false }
const collector = () => new ImportCollector("")

/** A color that takes its RGB from gray900 and adds its own opacity, as SDK 2.6.x hands it to exporters */
const ownOpacity = (measure: number, opacityRef: string | null = null): ColorTokenValue => ({
  color: { ...gray900.value.color, referencedTokenId: gray900.id },
  opacity: opacity(measure, opacityRef),
  referencedTokenId: null
})
const gray900Alias: ColorTokenValue = { ...gray900.value, referencedTokenId: gray900.id }

const shadowLayer = (color: ColorTokenValue, layerOpacity?: number): ShadowTokenValue => ({
  color,
  ...(layerOpacity !== undefined && { opacity: opacity(layerOpacity) }),
  x: 0,
  y: 2,
  radius: 8,
  spread: 0,
  type: ShadowType.drop,
  referencedTokenId: null
})
const shadow = (layer: ShadowTokenValue, kotlinOptions = options) =>
  KotlinHelper.shadowTokenValueToKotlin([layer], tokens, kotlinOptions, collector())

describe("KotlinHelper colors with their own opacity", () => {
  test("color with its own opacity on a referenced color is the source with that alpha", () => {
    expect(KotlinHelper.colorTokenValueToKotlin(ownOpacity(0.4), tokens, options, collector())).toBe(
      "gray900.copy(alpha = 0.4f)"
    )
  })

  test("own opacity that references an opacity token writes its number", () => {
    expect(KotlinHelper.colorTokenValueToKotlin(ownOpacity(0.4, opacity40.id), tokens, options, collector())).toBe(
      "gray900.copy(alpha = 0.4f)"
    )
  })

  test("alpha keeps three decimals", () => {
    expect(KotlinHelper.colorTokenValueToKotlin(ownOpacity(0.2564), tokens, options, collector())).toBe(
      "gray900.copy(alpha = 0.256f)"
    )
  })

  test("alias and raw color are unchanged", () => {
    expect(KotlinHelper.colorTokenValueToKotlin(gray900Alias, tokens, options, collector())).toBe("gray900")
    expect(KotlinHelper.colorTokenValueToKotlin(gray900.value, tokens, options, collector())).toBe("Color(0xff111827)")
  })

  test("color with its own opacity is the resolved color when references are off", () => {
    expect(KotlinHelper.colorTokenValueToKotlin(ownOpacity(0.4), tokens, noReferences, collector())).toBe(
      "Color(0x66111827)"
    )
  })

  test("border and gradient stop use the source with that alpha", () => {
    const border = KotlinHelper.borderTokenValueToKotlin(
      {
        color: ownOpacity(0.4),
        width: { measure: 1, unit: Unit.pixels, referencedTokenId: null },
        position: BorderPosition.inside,
        style: BorderStyle.solid,
        referencedTokenId: null
      },
      tokens,
      options,
      collector()
    )
    expect(border).toBe("BorderStroke(1.dp, gray900.copy(alpha = 0.4f))")

    const gradient = KotlinHelper.gradientLayerToKotlin(
      {
        type: GradientType.linear,
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
        aspectRatio: 1,
        stops: [{ position: 0, color: ownOpacity(0.4) }],
        referencedTokenId: null
      },
      tokens,
      options,
      collector()
    )
    expect(gradient).toContain("0f to gray900.copy(alpha = 0.4f)")
  })
})

describe("KotlinHelper shadow layer opacity", () => {
  test("layer opacity on a referenced color is the color with that alpha", () => {
    expect(shadow(shadowLayer(gray900Alias, 0.2))).toBe(
      "Shadow(color = gray900.copy(alpha = 0.2f), offset = Offset(0f, 2f), blurRadius = 8f)"
    )
  })

  test("layer opacity of 100% on a referenced color replaces its alpha", () => {
    expect(shadow(shadowLayer(gray900Alias, 1))).toBe(
      "Shadow(color = gray900.copy(alpha = 1f), offset = Offset(0f, 2f), blurRadius = 8f)"
    )
  })

  test("layer opacity replaces the own opacity of its color", () => {
    expect(shadow(shadowLayer(ownOpacity(0.4), 0.2))).toBe(
      "Shadow(color = gray900.copy(alpha = 0.2f), offset = Offset(0f, 2f), blurRadius = 8f)"
    )
  })

  test("no layer opacity keeps the reference", () => {
    expect(shadow(shadowLayer(gray900Alias))).toBe("Shadow(color = gray900, offset = Offset(0f, 2f), blurRadius = 8f)")
  })

  test("layer opacity on a raw color and with references off is the resolved color", () => {
    expect(shadow(shadowLayer(gray900.value, 0.2))).toBe(
      "Shadow(color = Color(0x33111827), offset = Offset(0f, 2f), blurRadius = 8f)"
    )
    expect(shadow(shadowLayer(gray900Alias, 0.2), noReferences)).toBe(
      "Shadow(color = Color(0x33111827), offset = Offset(0f, 2f), blurRadius = 8f)"
    )
  })
})
