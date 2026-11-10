import {
  ColorToken,
  ColorTokenValue,
  ShadowToken,
  ShadowTokenValue,
  ShadowType,
  TextCase,
  TextDecoration,
  Token,
  TokenGroup,
  TokenTheme,
  TokenType,
  TypographyToken,
  TypographyTokenValue,
  Unit,
  FontFamilyToken,
  FontWeightToken,
  TextDecorationToken,
  TextCaseToken,
} from "@supernovaio/sdk-exporters"

const groupForType = (type: TokenType): TokenGroup =>
  ({
    id: `group-${type}`,
    name: type,
    isRoot: true,
    path: [],
    parentGroupId: null,
    tokenType: type,
    childrenIds: [],
    tokenIds: [],
  } as unknown as TokenGroup)

export const tokenGroups: Array<TokenGroup> = [
  groupForType(TokenType.color),
  groupForType(TokenType.shadow),
  groupForType(TokenType.typography),
  groupForType(TokenType.fontFamily),
  groupForType(TokenType.fontWeight),
  groupForType(TokenType.textDecoration),
  groupForType(TokenType.textCase),
]

const colorValue = (r: number, g: number, b: number, refId: string | null = null): ColorTokenValue => ({
  color: { r, g, b, referencedTokenId: null },
  opacity: { measure: 1, unit: Unit.raw, referencedTokenId: null },
  referencedTokenId: refId,
})

const makeColor = (id: string, name: string, value: ColorTokenValue): ColorToken =>
  ({
    id,
    idInVersion: id,
    name,
    description: "",
    tokenType: TokenType.color,
    parentGroupId: "group-Color",
    value,
    origin: null,
    properties: [],
    propertyValues: {},
  } as unknown as ColorToken)

const makeShadow = (id: string, name: string, color: ColorTokenValue): ShadowToken => {
  const layer: ShadowTokenValue = {
    color,
    x: 0,
    y: 2,
    radius: 4,
    spread: 0,
    type: ShadowType.drop,
    referencedTokenId: null,
  }
  return {
    id,
    idInVersion: id,
    name,
    description: "",
    tokenType: TokenType.shadow,
    parentGroupId: "group-Shadow",
    value: [layer],
    origin: null,
    properties: [],
    propertyValues: {},
  } as unknown as ShadowToken
}

const makeFontFamily = (id: string, name: string, text: string): FontFamilyToken =>
  ({
    id,
    idInVersion: id,
    name,
    description: "",
    tokenType: TokenType.fontFamily,
    parentGroupId: "group-FontFamily",
    value: { text, referencedTokenId: null },
    origin: null,
    properties: [],
    propertyValues: {},
  } as unknown as FontFamilyToken)

const makeFontWeight = (id: string, name: string, text: string): FontWeightToken =>
  ({
    id,
    idInVersion: id,
    name,
    description: "",
    tokenType: TokenType.fontWeight,
    parentGroupId: "group-FontWeight",
    value: { text, referencedTokenId: null },
    origin: null,
    properties: [],
    propertyValues: {},
  } as unknown as FontWeightToken)

const makeTextDecoration = (id: string, name: string, decoration: TextDecoration): TextDecorationToken =>
  ({
    id,
    idInVersion: id,
    name,
    description: "",
    tokenType: TokenType.textDecoration,
    parentGroupId: "group-TextDecoration",
    value: { value: decoration, referencedTokenId: null, options: [TextDecoration.original, TextDecoration.underline] },
    origin: null,
    properties: [],
    propertyValues: {},
  } as unknown as TextDecorationToken)

const makeTextCase = (id: string, name: string, textCase: TextCase): TextCaseToken =>
  ({
    id,
    idInVersion: id,
    name,
    description: "",
    tokenType: TokenType.textCase,
    parentGroupId: "group-TextCase",
    value: { value: textCase, referencedTokenId: null, options: [TextCase.lower, TextCase.upper] },
    origin: null,
    properties: [],
    propertyValues: {},
  } as unknown as TextCaseToken)

const makeTypography = (id: string, name: string, value: TypographyTokenValue): TypographyToken =>
  ({
    id,
    idInVersion: id,
    name,
    description: "",
    tokenType: TokenType.typography,
    parentGroupId: "group-Typography",
    value,
    origin: null,
    properties: [],
    propertyValues: {},
  } as unknown as TypographyToken)

const baseTypographyValue: TypographyTokenValue = {
  fontFamily: { text: "Arial", referencedTokenId: null },
  fontWeight: { text: "400", referencedTokenId: null },
  fontSize: { measure: 16, unit: Unit.pixels, referencedTokenId: null },
  textDecoration: { value: TextDecoration.original, referencedTokenId: null } as any,
  textCase: { value: TextCase.lower, referencedTokenId: null } as any,
  letterSpacing: { measure: 0, unit: Unit.pixels, referencedTokenId: null },
  lineHeight: { measure: 1.2, unit: Unit.raw, referencedTokenId: null } as any,
  paragraphIndent: { measure: 0, unit: Unit.pixels, referencedTokenId: null },
  paragraphSpacing: { measure: 0, unit: Unit.pixels, referencedTokenId: null },
  referencedTokenId: null,
}

/**
 * Two base color tokens that are NEVER overridden in any theme.
 */
export const colorBaseGray = makeColor("c-base-gray", "Gray", colorValue(29, 29, 31))
export const colorBaseBlue = makeColor("c-base-blue", "Blue", colorValue(0, 100, 255))

/**
 * Color token overridden by darkTheme. Its themed value references colorBaseGray.
 */
export const colorPrimary = makeColor("c-primary", "Primary", colorValue(255, 255, 255))
export const colorPrimaryDark = makeColor("c-primary", "Primary", colorValue(255, 255, 255, "c-base-gray"))

/**
 * Second themed color token (gives darkTheme more than one color override).
 */
export const colorSecondary = makeColor("c-secondary", "Secondary", colorValue(200, 200, 200))
export const colorSecondaryDark = makeColor("c-secondary", "Secondary", colorValue(200, 200, 200, "c-primary"))

/**
 * Shadow tokens.
 */
export const shadowBase = makeShadow("s-base", "Base", colorValue(0, 0, 0))
export const shadowThemed = makeShadow("s-themed", "Themed", colorValue(0, 0, 0))
// In the themed override, shadow color references the *themed* primary color.
export const shadowThemedDark = makeShadow("s-themed", "Themed", colorValue(0, 0, 0, "c-primary"))
// Another shadow whose themed value references a NON-overridden base color.
export const shadowToBase = makeShadow("s-to-base", "ToBase", colorValue(0, 0, 0))
export const shadowToBaseDark = makeShadow("s-to-base", "ToBase", colorValue(0, 0, 0, "c-base-blue"))

/**
 * Font family / weight / decoration / case tokens for typography composite tests.
 */
export const fontFamilyBase = makeFontFamily("ff-base", "Base", "Helvetica")
export const fontFamilyAlt = makeFontFamily("ff-alt", "Alt", "Inter")
export const fontWeightBase = makeFontWeight("fw-base", "Base", "400")
export const fontWeightBold = makeFontWeight("fw-bold", "Bold", "700")
export const textDecorationBase = makeTextDecoration("td-base", "Base", TextDecoration.original)
export const textDecorationUnderline = makeTextDecoration("td-underline", "Underline", TextDecoration.underline)
export const textCaseBase = makeTextCase("tc-base", "Base", TextCase.lower)
export const textCaseUpper = makeTextCase("tc-upper", "Upper", TextCase.upper)

/**
 * Typography token whose themed override references all four sub-tokens.
 * Used to exercise composite ref dispatch through tokenToVariableRef.
 */
export const typographyHeading = makeTypography("ty-heading", "Heading", baseTypographyValue)
export const typographyHeadingDark = makeTypography("ty-heading", "Heading", {
  ...baseTypographyValue,
  fontFamily: { text: "Inter", referencedTokenId: "ff-alt" },
  fontWeight: { text: "700", referencedTokenId: "fw-bold" },
  textDecoration: { value: TextDecoration.underline, referencedTokenId: "td-underline" } as any,
  textCase: { value: TextCase.upper, referencedTokenId: "tc-upper" } as any,
})

/**
 * Full unthemed token set (base values).
 */
export const allTokens: Array<Token> = [
  colorBaseGray,
  colorBaseBlue,
  colorPrimary,
  colorSecondary,
  shadowBase,
  shadowThemed,
  shadowToBase,
  fontFamilyBase,
  fontFamilyAlt,
  fontWeightBase,
  fontWeightBold,
  textDecorationBase,
  textDecorationUnderline,
  textCaseBase,
  textCaseUpper,
  typographyHeading,
]

/**
 * Tokens with darkTheme already applied (i.e. the result of
 * sdk.tokens.computeTokensByApplyingThemes for darkTheme).
 *
 * Replaces overridden tokens with their themed values; keeps the rest as-is.
 */
export const tokensWithDarkApplied: Array<Token> = [
  colorBaseGray,
  colorBaseBlue,
  colorPrimaryDark,
  colorSecondaryDark,
  shadowBase,
  shadowThemedDark,
  shadowToBaseDark,
  fontFamilyBase,
  fontFamilyAlt,
  fontWeightBase,
  fontWeightBold,
  textDecorationBase,
  textDecorationUnderline,
  textCaseBase,
  textCaseUpper,
  typographyHeadingDark,
]

/**
 * darkTheme: overrides primary, secondary, shadowThemed, shadowToBase, typographyHeading.
 * Does NOT override colorBaseGray, colorBaseBlue, shadowBase, font sub-tokens.
 */
export const darkTheme: TokenTheme = {
  id: "theme-dark",
  idInVersion: "theme-dark",
  brandId: "brand",
  designSystemVersionId: "v1",
  name: "Dark",
  description: "",
  codeName: "dark",
  createdAt: null,
  updatedAt: null,
  parentPersistentId: null,
  collectionPersistentIds: [],
  collectionName: undefined,
  overriddenTokens: [
    colorPrimaryDark,
    colorSecondaryDark,
    shadowThemedDark,
    shadowToBaseDark,
    typographyHeadingDark,
  ],
} as unknown as TokenTheme

/**
 * Tokens with darkColorOnly applied (only colors are overridden).
 * Used for testing peer-themed file gating when peer types have no overrides.
 */
export const tokensWithDarkColorOnlyApplied: Array<Token> = [
  colorBaseGray,
  colorBaseBlue,
  colorPrimaryDark,
  colorSecondaryDark,
  shadowBase,
  shadowThemed,
  shadowToBaseDark, // still has color ref to base-blue
  fontFamilyBase,
  fontFamilyAlt,
  fontWeightBase,
  fontWeightBold,
  textDecorationBase,
  textDecorationUnderline,
  textCaseBase,
  textCaseUpper,
  typographyHeading,
]

export const darkColorOnlyTheme: TokenTheme = {
  id: "theme-dark-color-only",
  idInVersion: "theme-dark-color-only",
  brandId: "brand",
  designSystemVersionId: "v1",
  name: "DarkColorOnly",
  description: "",
  codeName: "darkColorOnly",
  createdAt: null,
  updatedAt: null,
  parentPersistentId: null,
  collectionPersistentIds: [],
  collectionName: undefined,
  overriddenTokens: [colorPrimaryDark, colorSecondaryDark, shadowToBaseDark],
} as unknown as TokenTheme

/**
 * Tokens with darkShadowOnly applied. Only shadows are overridden (no colors).
 * Used to test bucket 4 case B (peer themed color file does NOT exist).
 */
export const tokensWithDarkShadowOnlyApplied: Array<Token> = [
  colorBaseGray,
  colorBaseBlue,
  colorPrimary,
  colorSecondary,
  shadowBase,
  shadowThemedDark, // overridden, but its ref c-primary is now NOT overridden in this theme
  shadowToBaseDark,
  fontFamilyBase,
  fontFamilyAlt,
  fontWeightBase,
  fontWeightBold,
  textDecorationBase,
  textDecorationUnderline,
  textCaseBase,
  textCaseUpper,
  typographyHeading,
]

export const darkShadowOnlyTheme: TokenTheme = {
  id: "theme-dark-shadow-only",
  idInVersion: "theme-dark-shadow-only",
  brandId: "brand",
  designSystemVersionId: "v1",
  name: "DarkShadowOnly",
  description: "",
  codeName: "darkShadowOnly",
  createdAt: null,
  updatedAt: null,
  parentPersistentId: null,
  collectionPersistentIds: [],
  collectionName: undefined,
  overriddenTokens: [shadowThemedDark, shadowToBaseDark],
} as unknown as TokenTheme

/**
 * Base color token whose value references another base color (same type).
 * Used to test that bucket 1 (same-type local) still works in base file generation.
 */
export const colorTertiary = makeColor("c-tertiary", "Tertiary", colorValue(0, 0, 0, "c-primary"))
allTokens.push(colorTertiary)
