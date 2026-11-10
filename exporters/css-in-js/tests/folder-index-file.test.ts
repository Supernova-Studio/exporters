import { describe, test, expect, beforeEach } from "@jest/globals"
import { StringCase, ColorFormat } from "@supernovaio/export-utils"
import { ThemeExportStyle, TokenSortOrder, ExporterConfiguration } from "../config"
import {
  allTokens,
  tokensWithDarkApplied,
  tokensWithDarkColorOnlyApplied,
  darkTheme,
  darkColorOnlyTheme,
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

const { folderIndexOutputFile } = require("../src/files/folder-index-file") as typeof import("../src/files/folder-index-file")

describe("folderIndexOutputFile — peer themed file gating", () => {
  beforeEach(() => {
    setConfig({})
  })

  test("1. Base folder index (no theme) → all types with tokens are imported", () => {
    setConfig({ exportOnlyThemedTokens: false, exportBaseValues: true })
    // Cast through any to allow optional 3rd arg until the impl adopts it
    const file = (folderIndexOutputFile as any)(allTokens, "base")
    const content = file.content
    expect(content).toContain('import { ColorTokens } from "./color";')
    expect(content).toContain('import { ShadowTokens } from "./shadow";')
    expect(content).toContain('import { TypographyTokens } from "./typography";')
    expect(content).toContain('import { FontFamilyTokens } from "./font-family";')
  })

  test("2. Themed folder index, exportOnlyThemedTokens=true, only colors+shadows overridden → only those types imported", () => {
    setConfig({ exportOnlyThemedTokens: true, exportBaseValues: true })
    // darkColorOnlyTheme overrides colors and shadowToBase. No typography/font overrides.
    const file = (folderIndexOutputFile as any)(tokensWithDarkColorOnlyApplied, "darkColorOnly", darkColorOnlyTheme)
    const content = file.content
    expect(content).toContain('import { ColorTokens } from "./color";')
    expect(content).toContain('import { ShadowTokens } from "./shadow";')
    // No themed file generated for these — should NOT be imported.
    expect(content).not.toContain('TypographyTokens')
    expect(content).not.toContain('FontFamilyTokens')
    expect(content).not.toContain('FontWeightTokens')
    expect(content).not.toContain('TextDecorationTokens')
    expect(content).not.toContain('TextCaseTokens')
  })

  test("3. Themed folder index, exportOnlyThemedTokens=false → all types imported (regression)", () => {
    setConfig({ exportOnlyThemedTokens: false, exportBaseValues: true })
    const file = (folderIndexOutputFile as any)(tokensWithDarkApplied, "dark", darkTheme)
    const content = file.content
    expect(content).toContain('import { ColorTokens } from "./color";')
    expect(content).toContain('import { ShadowTokens } from "./shadow";')
    expect(content).toContain('import { TypographyTokens } from "./typography";')
    expect(content).toContain('import { FontFamilyTokens } from "./font-family";')
  })
})
