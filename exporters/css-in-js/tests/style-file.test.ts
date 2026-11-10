import { describe, test, expect, beforeEach } from "@jest/globals"
import { TokenType } from "@supernovaio/sdk-exporters"
import { StringCase, ColorFormat } from "@supernovaio/export-utils"
import { ThemeExportStyle, TokenSortOrder, ExporterConfiguration } from "../config"
import {
  tokenGroups,
  allTokens,
  tokensWithDarkApplied,
  tokensWithDarkShadowOnlyApplied,
  darkTheme,
  darkShadowOnlyTheme,
} from "./fixtures/tokens"

const baseConfig: ExporterConfiguration = {
  showGeneratedFileDisclaimer: false,
  disclaimer: "",
  generateIndexFile: true,
  generateFolderIndexFiles: true,
  generateEmptyFiles: false,
  showDescriptions: false,
  useReferences: true,
  tokenNameStyle: StringCase.camelCase,
  colorFormat: ColorFormat.smartHashHex,
  colorPrecision: 3,
  indent: 2,
  tokenPrefixes: {} as any,
  styleFileNames: {} as any,
  indexFileName: "index.ts",
  baseStyleFilePath: "./base",
  baseIndexFilePath: "./",
  exportThemesAs: ThemeExportStyle.SeparateFiles,
  exportOnlyThemedTokens: false,
  exportBaseValues: true,
  forceRemUnit: false,
  remBase: 16,
  customizeStyleFileNames: false,
  customizeTokenPrefixes: false,
  globalNamePrefix: "",
  generateTypeDefinitions: false,
  tokenSortOrder: TokenSortOrder.Default,
  writeNameToProperty: false,
  propertyToWriteNameTo: "",
}

const mockConfig = { ...baseConfig }

jest.mock("../src/index", () => ({
  get exportConfiguration() {
    return mockConfig
  },
}))

const setConfig = (overrides: Partial<ExporterConfiguration>) => {
  Object.assign(mockConfig, baseConfig, overrides)
}

// Import AFTER mock setup
const { styleOutputFile } = require("../src/files/style-file") as typeof import("../src/files/style-file")

const generate = (
  type: TokenType,
  tokens = tokensWithDarkApplied,
  themePath = "dark",
  theme = darkTheme,
) => {
  const file = styleOutputFile(type, tokens, tokenGroups, themePath, theme)
  if (!file) return null
  return file.content
}

describe("styleOutputFile — bucket dispatch for themed files", () => {
  beforeEach(() => {
    setConfig({})
  })

  test("1. Same-type ref to a local (overridden) token → bare identifier (no namespace, no alias)", () => {
    // colorSecondary's themed value references c-primary which is ALSO overridden.
    // Both land in the themed file, so the ref must resolve locally without any import.
    setConfig({ exportOnlyThemedTokens: true, exportBaseValues: true })
    const content = generate(TokenType.color)!
    expect(content).toMatch(/const colorSecondary = colorPrimary;/)
    // The local ref must NOT be namespaced as ColorTokens.colorPrimary or BaseColorTokens.colorPrimary.
    expect(content).not.toMatch(/colorSecondary = (Base)?ColorTokens\./)
  })

  test("2. Same-type ref to a non-overridden token → aliased base import", () => {
    // colorPrimary's themed value references c-base-gray which is NOT overridden.
    // Must import ColorTokens from base and alias it as BaseColorTokens.
    setConfig({ exportOnlyThemedTokens: true, exportBaseValues: true })
    const content = generate(TokenType.color)!
    expect(content).toContain('import { ColorTokens as BaseColorTokens } from "../base/color";')
    expect(content).toMatch(/const colorPrimary = BaseColorTokens\.colorGray;/)
  })

  test("3. Cross-type ref where peer themed file exists AND target overridden → peer-theme import", () => {
    // shadowThemed's themed value's color references c-primary which IS overridden in dark.
    // Peer themed color file will be generated. Use peer import path "./color".
    setConfig({ exportOnlyThemedTokens: true, exportBaseValues: true })
    const content = generate(TokenType.shadow)!
    expect(content).toContain('import { ColorTokens } from "./color";')
    expect(content).toMatch(/ColorTokens\.colorPrimary/)
  })

  test("4. Cross-type ref where peer themed file exists but target NOT overridden → routes to base", () => {
    // shadowToBase's themed value's color references c-base-blue which is NOT overridden.
    // But peer themed color file exists (other colors are overridden).
    // The ref target is not in the peer themed file, so it falls back to base import.
    setConfig({ exportOnlyThemedTokens: true, exportBaseValues: true })
    const content = generate(TokenType.shadow)!
    expect(content).toContain('import { ColorTokens } from "../base/color";')
    expect(content).toMatch(/ColorTokens\.colorBlue/)
  })

  test("5. Cross-type ref where peer themed file does NOT exist → base import (no alias, type differs)", () => {
    // darkShadowOnlyTheme overrides ONLY shadows. The themed shadow file references
    // a color (c-primary) — but no color is overridden, so darkShadowOnly/color.ts is
    // never generated. The reference must route to ../base/color.
    setConfig({ exportOnlyThemedTokens: true, exportBaseValues: true })
    const content = generate(TokenType.shadow, tokensWithDarkShadowOnlyApplied, "darkShadowOnly", darkShadowOnlyTheme)!
    expect(content).toContain('import { ColorTokens } from "../base/color";')
    expect(content).not.toContain('import { ColorTokens } from "./color";')
    expect(content).toMatch(/ColorTokens\.colorPrimary/)
  })

  test("6. exportBaseValues=false → escaping refs are inlined as values", () => {
    // No base file to import from — the same-type ref to colorBaseGray must inline.
    setConfig({ exportOnlyThemedTokens: true, exportBaseValues: false })
    const content = generate(TokenType.color)!
    expect(content).not.toMatch(/^import /m)
    // colorPrimary's ref to colorBaseGray (#1d1d1f) should inline as the resolved hex.
    expect(content).toMatch(/const colorPrimary = '#1d1d1f';/)
  })

  test("7. Typography composite — sub-refs route through bucket dispatch independently", () => {
    setConfig({ exportOnlyThemedTokens: true, exportBaseValues: true })
    const content = generate(TokenType.typography)!
    // None of fontFamily / fontWeight / textDecoration / textCase have peer themed files
    // (no overrides for those types in darkTheme), so all four route to base imports.
    expect(content).toContain('import { FontFamilyTokens } from "../base/font-family";')
    expect(content).toContain('import { FontWeightTokens } from "../base/font-weight";')
    expect(content).toContain('import { TextDecorationTokens } from "../base/text-decoration";')
    expect(content).toContain('import { TextCaseTokens } from "../base/text-case";')
    // Composite output is wrapped in backticks (multiple ${...} interpolations).
    expect(content).toMatch(/const typographyHeading = `[^`]*\$\{FontFamilyTokens\.fontFamilyAlt\}/)
  })

  test("8. Custom baseStyleFilePath → relative path computed correctly", () => {
    setConfig({
      exportOnlyThemedTokens: true,
      exportBaseValues: true,
      baseStyleFilePath: "./tokens/base",
    })
    const content = generate(TokenType.color)!
    expect(content).toContain('import { ColorTokens as BaseColorTokens } from "../tokens/base/color";')
  })

  test("9. Regression: exportOnlyThemedTokens=false, cross-type ref → peer-theme import (NOT base)", () => {
    // Themed file contains all tokens. Cross-type refs should resolve to local peer files.
    // shadowThemed (full themed) references c-primary; peer color file is "./color".
    setConfig({ exportOnlyThemedTokens: false, exportBaseValues: true })
    const content = generate(TokenType.shadow)!
    expect(content).toContain('import { ColorTokens } from "./color";')
    expect(content).not.toContain('import { ColorTokens } from "../base/color";')
  })

  test("10. Regression: base file generation is unchanged", () => {
    // Generate the base color file. Bucket 1 covers same-type refs.
    // Fixture base values include colorTertiary which references colorPrimary (same type).
    setConfig({ exportOnlyThemedTokens: false, exportBaseValues: true })
    const file = styleOutputFile(TokenType.color, allTokens, tokenGroups)
    expect(file).not.toBeNull()
    const content = file!.content
    // Same-type local ref → bare identifier
    expect(content).toMatch(/const colorTertiary = colorPrimary;/)
    // No imports for a base-only color file (no cross-type refs)
    expect(content).not.toMatch(/^import /m)
  })
})
