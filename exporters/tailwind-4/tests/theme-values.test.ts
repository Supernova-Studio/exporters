import { describe, test, expect, afterEach } from "@jest/globals"
import { readFileSync } from "fs"
import {
  AnyToken,
  ColorTokenValue,
  ShadowType,
  TextCase,
  Token,
  TokenGroup,
  TokenTheme,
  TokenType,
  Unit
} from "@supernovaio/sdk-exporters"
import { compile } from "tailwindcss"
import config from "../config.json"

const mockDefaults = Object.fromEntries(
  (config as Array<{ key: string; default: unknown }>).map((p) => [p.key, p.default])
)
const mockConfig: Record<string, unknown> = { ...mockDefaults }

jest.mock("../src/index", () => ({ exportConfiguration: mockConfig }))

afterEach(() => {
  Object.keys(mockConfig).forEach((key) => delete mockConfig[key])
  Object.assign(mockConfig, mockDefaults)
})

const { styleOutputFile, generateStyleFiles, indexOutputFile } =
  require("../src/files/tailwind-file") as typeof import("../src/files/tailwind-file")

const tokenTypes = [
  TokenType.color,
  TokenType.shadow,
  TokenType.typography,
  TokenType.fontFamily,
  TokenType.fontSize,
  TokenType.textCase
]
const tokenGroups = tokenTypes.map(
  (type) =>
    ({
      id: `group-${type}`,
      name: type,
      isRoot: true,
      path: [],
      parentGroupId: null,
      tokenType: type,
      childrenIds: [],
      tokenIds: []
    }) as unknown as TokenGroup
)

const token = (id: string, tokenType: TokenType, value: unknown): Token =>
  ({
    id,
    idInVersion: id,
    name: id,
    description: "",
    tokenType,
    parentGroupId: `group-${tokenType}`,
    value,
    origin: null,
    properties: [],
    propertyValues: {}
  }) as unknown as Token
const colorValue = (
  r: number,
  g: number,
  b: number,
  referencedTokenId: string | null = null,
  opacity = 1
): ColorTokenValue => ({
  color: { r, g, b, referencedTokenId: null },
  opacity: { measure: opacity, unit: Unit.raw, referencedTokenId: null },
  referencedTokenId
})
const color = (id: string, r: number, g: number, b: number, referencedTokenId: string | null = null) =>
  token(id, TokenType.color, colorValue(r, g, b, referencedTokenId))
const shadow = (id: string, y: number, layerColor: ColorTokenValue, referencedTokenId: string | null = null) =>
  token(id, TokenType.shadow, [
    { color: layerColor, x: 0, y, radius: 8, spread: 0, opacity: null, type: ShadowType.drop, referencedTokenId }
  ])
const fontFamily = (id: string, text: string) => token(id, TokenType.fontFamily, { text, referencedTokenId: null })
const typography = (id: string, fontSizeId: string, fontFamilyId: string) =>
  token(id, TokenType.typography, {
    fontFamily: { text: "Inter", referencedTokenId: fontFamilyId },
    fontWeight: { text: "400", referencedTokenId: null },
    fontSize: { measure: 16, unit: Unit.pixels, referencedTokenId: fontSizeId },
    textCase: { value: TextCase.upper, referencedTokenId: "case-upper" },
    letterSpacing: { measure: 0, unit: Unit.pixels, referencedTokenId: null },
    lineHeight: { measure: 1.5, unit: Unit.raw, referencedTokenId: null },
    referencedTokenId: null
  })

const captionValue = (typography("caption", "body-size", "body-font") as AnyToken).value
const brand = color("brand", 0, 0, 255)
const brandDark = color("brand", 255, 255, 0)
const tokensWithDarkValues = {
  base: [
    brand,
    color("primary", 17, 17, 17),
    color("scrim", 0, 0, 0, "brand"),
    color("accent", 0, 0, 255, "brand"),
    color("accent-deep", 0, 0, 255, "accent"),
    token("faded", TokenType.color, {
      ...colorValue(0, 0, 255),
      color: { r: 0, g: 0, b: 255, referencedTokenId: "brand" },
      opacity: { measure: 0.5, unit: Unit.raw, referencedTokenId: null }
    }),
    color("ink", 0, 0, 0),
    shadow("card", 2, colorValue(255, 0, 0)),
    shadow("card-alias", 2, colorValue(255, 0, 0), "card"),
    shadow("tint", 2, colorValue(0, 0, 255, "brand")),
    shadow("plain", 2, colorValue(0, 0, 0)),
    fontFamily("body-font", "Inter"),
    token("body-size", TokenType.fontSize, { measure: 16, unit: Unit.pixels, referencedTokenId: null }),
    token("case-upper", TokenType.textCase, { value: TextCase.upper, referencedTokenId: null }),
    typography("body", "body-size", "body-font"),
    token("caption", TokenType.typography, { ...captionValue, lineHeight: null })
  ],
  dark: {
    brand: brandDark,
    primary: color("primary", 238, 238, 238),
    scrim: color("scrim", 0, 0, 0, "ink"),
    card: shadow("card", 12, colorValue(0, 255, 0)),
    "body-font": fontFamily("body-font", "Georgia"),
    caption: token("caption", TokenType.typography, {
      ...captionValue,
      lineHeight: { measure: 2, unit: Unit.raw, referencedTokenId: null }
    })
  } as Record<string, Token>
}
const baseTokens = tokensWithDarkValues.base
const darkTokens = baseTokens.map((t) => tokensWithDarkValues.dark[t.id] ?? t)
const darkTheme = {
  id: "dark",
  name: "Dark",
  codeName: "dark",
  overriddenTokens: Object.values(tokensWithDarkValues.dark)
} as unknown as TokenTheme
const themedShadowIds = new Set(["card"])

async function compiledCss(files: Array<string>, candidates: Array<string>): Promise<string> {
  const compiler = await compile(files.join("\n"), {
    loadStylesheet: async (id: string, dir: string) => ({
      path: id,
      base: dir,
      content: readFileSync(require.resolve("tailwindcss/index.css"), "utf8")
    })
  })
  return compiler.build(candidates)
}

async function singleFileCss(candidates: Array<string>): Promise<string> {
  const base = styleOutputFile(baseTokens, tokenGroups, themedShadowIds)!.content
  const dark = styleOutputFile(darkTokens, tokenGroups, themedShadowIds, "dark", [darkTheme])!.content
  return compiledCss([base, dark], candidates)
}

/** Custom properties of every innermost block whose selector matches */
function declarations(css: string, selector: (selectorText: string) => boolean): Map<string, string> {
  const result = new Map<string, string>()
  for (const [, selectorText, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selector(selectorText.trim())) continue
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) result.set(name, value.trim())
  }
  return result
}

type Scope = { declarations: Map<string, string>; parent?: Scope }

/** The computed value of a custom property: a var() resolves in the scope that declares it, as in CSS */
function computed(name: string, scope: Scope): string | undefined {
  const value = scope.declarations.get(name)
  if (value !== undefined) return resolve(value, scope)
  return scope.parent ? computed(name, scope.parent) : undefined
}

function resolve(value: string, scope: Scope): string {
  const start = value.indexOf("var(")
  if (start === -1) return value
  let depth = 0
  let end = start + 4
  for (; end < value.length; end++) {
    if (value[end] === "(") depth++
    if (value[end] === ")" && depth-- === 0) break
  }
  const inner = value.slice(start + 4, end)
  const comma = inner.indexOf(",")
  const name = (comma === -1 ? inner : inner.slice(0, comma)).trim()
  const replacement = computed(name, scope) ?? (comma === -1 ? "" : inner.slice(comma + 1).trim())
  return resolve(value.slice(0, start) + replacement + value.slice(end + 1), scope)
}

/** What a property of a class computes to on an element inside the theme selector, or outside it */
function computedValue(css: string, selector: string, property: string, isInDark = true): string {
  const root: Scope = { declarations: declarations(css, (s) => s.startsWith(":root")) }
  const element = isInDark ? { declarations: declarations(css, (s) => s === ".theme-dark"), parent: root } : root
  const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, selectorText]) => selectorText.trim() === selector)
  expect(rule).toBeDefined()
  const ruleScope: Scope = { declarations: declarations(rule![0], () => true), parent: element }
  const declaration = rule![2].match(new RegExp(`(?:^|;|\\s)${property}\\s*:\\s*([^;]+);`))
  expect(declaration).not.toBeNull()
  return resolve(declaration![1].trim(), ruleScope)
}

describe("Tailwind classes follow a token's theme value", () => {
  test("a shadow that Dark overrides shows its Dark offsets and color", async () => {
    const css = await singleFileCss(["shadow-card"])
    expect(computedValue(css, ".shadow-card", "--tw-shadow")).toMatch(/^0px 12px 8px 0px /)
    expect(computedValue(css, ".shadow-card", "--tw-shadow", false)).toMatch(/^0px 2px 8px 0px /)
  })

  test("a shadow that references a shadow Dark overrides shows the Dark value", async () => {
    const css = await singleFileCss(["shadow-card-alias"])
    expect(computedValue(css, ".shadow-card-alias", "--tw-shadow")).toMatch(/^0px 12px 8px 0px /)
  })

  test("var(--shadow-card) read inside .theme-dark shows the Dark value", async () => {
    const css = await singleFileCss(["shadow-card"])
    const page = `${css}\n.page { box-shadow: var(--shadow-card); }`
    expect(computedValue(page, ".page", "box-shadow")).toMatch(/^0px 12px 8px 0px /)
  })

  test("a shadow whose layer reads a Dark color follows it", async () => {
    const css = await singleFileCss(["shadow-tint", "bg-brand"])
    expect(computedValue(css, ".shadow-tint", "--tw-shadow")).toContain(
      computedValue(css, ".bg-brand", "background-color")
    )
    expect(computedValue(css, ".shadow-tint", "--tw-shadow")).not.toBe(
      computedValue(css, ".shadow-tint", "--tw-shadow", false)
    )
  })

  test("a shadow that no theme overrides keeps Tailwind's color and opacity modifiers", async () => {
    const css = await singleFileCss(["shadow-plain"])
    expect(computedValue(css, ".shadow-plain", "--tw-shadow")).not.toContain("var(")
    expect(css).toMatch(/\.shadow-plain\s*\{[^}]*var\(--tw-shadow-color,/)
  })

  test("a color that Dark overrides shows its Dark value", async () => {
    const css = await singleFileCss(["bg-primary"])
    expect(computedValue(css, ".bg-primary", "background-color")).not.toBe(
      computedValue(css, ".bg-primary", "background-color", false)
    )
  })

  test("a color whose base value is a reference and that Dark points elsewhere shows the Dark target", async () => {
    const css = await singleFileCss(["bg-scrim", "bg-ink"])
    expect(computedValue(css, ".bg-scrim", "background-color")).toBe(computedValue(css, ".bg-ink", "background-color"))
  })

  test("an alias of a color that Dark overrides shows the Dark value", async () => {
    const css = await singleFileCss(["bg-accent", "bg-brand"])
    expect(computedValue(css, ".bg-accent", "background-color")).toBe(
      computedValue(css, ".bg-brand", "background-color")
    )
    expect(computedValue(css, ".bg-accent", "background-color")).not.toBe(
      computedValue(css, ".bg-accent", "background-color", false)
    )
  })

  test("an alias two steps from a Dark color shows the Dark value", async () => {
    const css = await singleFileCss(["bg-accent-deep", "bg-brand"])
    expect(computedValue(css, ".bg-accent-deep", "background-color")).toBe(
      computedValue(css, ".bg-brand", "background-color")
    )
  })

  test("a color with its own opacity over a Dark color shows the Dark color", async () => {
    const css = await singleFileCss(["bg-faded"])
    expect(computedValue(css, ".bg-faded", "background-color")).not.toBe(
      computedValue(css, ".bg-faded", "background-color", false)
    )
  })

  test("a typography class shows the Dark font family", async () => {
    const css = await singleFileCss(["body"])
    expect(computedValue(css, ".body", "font-family")).toContain("Georgia")
    expect(computedValue(css, ".body", "font-family", false)).toContain("Inter")
  })

  test("a typography class whose text case references a text-case token shows uppercase", async () => {
    const css = await singleFileCss(["body"])
    expect(computedValue(css, ".body", "text-transform", false)).toBe("uppercase")
    expect(computedValue(css, ".body", "text-transform")).toBe("uppercase")
  })

  test("a typography class shows the Dark line height when only Dark sets one", async () => {
    const css = await singleFileCss(["caption"])
    expect(computedValue(css, ".caption", "line-height")).toBe("2")
  })

  test("a Dark file writes no typography classes", () => {
    expect(styleOutputFile(darkTokens, tokenGroups, themedShadowIds, "dark", [darkTheme])!.content).not.toContain(
      "@layer components"
    )
  })

  test("with a global prefix, a color class, an alias, a themed shadow and a typography class show their Dark values", async () => {
    mockConfig.globalPrefix = "tw"
    const css = await singleFileCss(["tw:bg-primary", "tw:bg-accent", "tw:bg-brand", "tw:shadow-card", "body"])
    expect(computedValue(css, ".tw\\:bg-primary", "background-color")).not.toBe(
      computedValue(css, ".tw\\:bg-primary", "background-color", false)
    )
    expect(computedValue(css, ".tw\\:bg-accent", "background-color")).toBe(
      computedValue(css, ".tw\\:bg-brand", "background-color")
    )
    expect(computedValue(css, ".tw\\:shadow-card", "--tw-shadow")).toMatch(/^0px 12px 8px 0px /)
    expect(computedValue(css, ".body", "font-family")).toContain("Georgia")
  })

  test("a typed @theme inline selector is kept", () => {
    mockConfig.cssSelector = "@theme inline"
    expect(styleOutputFile(baseTokens, tokenGroups, themedShadowIds)!.content).toContain("@theme inline {")
  })

  test("separate files: the index imports a Dark typography file that holds only tokens reading a themed font size", () => {
    mockConfig.fileStructure = "separateByType"
    mockConfig.generateIndexFile = true
    const sizeTheme = {
      id: "dark",
      name: "Dark",
      codeName: "dark",
      overriddenTokens: [
        token("body-size", TokenType.fontSize, { measure: 18, unit: Unit.pixels, referencedTokenId: null })
      ]
    } as unknown as TokenTheme
    const sizeDarkTokens = baseTokens.map((t) => (t.id === "body-size" ? sizeTheme.overriddenTokens[0] : t))
    const files = generateStyleFiles(sizeDarkTokens, tokenGroups, new Set(), "dark", [sizeTheme])
    expect(files.map((file) => file.name)).toContain("tailwind.typography.css")
    expect(indexOutputFile(baseTokens, [sizeTheme])!.content).toContain("./dark/tailwind.typography.css")
  })

  test("mergedTheme writes dependents of the second theme", () => {
    const secondTheme = {
      id: "contrast",
      name: "Contrast",
      codeName: "contrast",
      overriddenTokens: [brandDark]
    } as unknown as TokenTheme
    const firstTheme = {
      id: "dark",
      name: "Dark",
      codeName: "dark",
      overriddenTokens: [tokensWithDarkValues.dark.primary]
    } as unknown as TokenTheme
    const merged = baseTokens.map((t) =>
      t.id === "brand" ? brandDark : t.id === "primary" ? tokensWithDarkValues.dark.primary : t
    )
    expect(styleOutputFile(merged, tokenGroups, new Set(), "themed", [firstTheme, secondTheme])!.content).toContain(
      "--color-accent:"
    )
  })
})
