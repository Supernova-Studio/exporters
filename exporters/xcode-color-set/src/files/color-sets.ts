import { OutputTextFile, Token, TokenGroup, TokenType, ColorToken } from "@supernovaio/sdk-exporters"
import { FileHelper, NamingHelper, StringCase, TokenNameTracker } from "@supernovaio/export-utils"

/**
 * Convert a 0..255 channel value to the Xcode-required string format "0xHH"
 * (uppercase hex with 2 digits, prefixed with 0x)
 */
function toHexComponent(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)))
  return `0x${clamped.toString(16).toUpperCase().padStart(2, "0")}`
}

/**
 * Convert an alpha value to a 3-decimal string (e.g., "0.180"). The Xcode format in this PoC
 * expects alpha as a fractional string.
 */
function toAlphaString(alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha))
  return a.toFixed(3)
}

/**
 * Creates the mandatory root file for an Xcode asset catalog when requested.
 * If rootPath is empty, this function should not be called.
 */
export function createCatalogRootFile(rootPath: string): OutputTextFile {
  const content = JSON.stringify({ info: { version: 1, author: "xcode" } }, null, 2)
  return FileHelper.createTextFile({
    relativePath: rootPath ? `./${rootPath}` : `./`,
    fileName: "Contents.json",
    content
  })
}

/**
 * Extracts numeric RGBA components from a color token. The Supernova color token value
 * stores RGB channels in 0..255 and opacity as a 0..1 measure.
 */
function extractRgbaFromToken(token: Token): { r: number; g: number; b: number; a: number } | null {
  try {
    const c = (token as ColorToken).value
    const r = typeof c.color.r === "number" ? c.color.r : 0
    const g = typeof c.color.g === "number" ? c.color.g : 0
    const b = typeof c.color.b === "number" ? c.color.b : 0
    const a = typeof c.opacity.measure === "number" ? c.opacity.measure : 1
    return { r, g, b, a }
  } catch {
    return null
  }
}

/**
 * Creates one Xcode color set file (Contents.json) for a given color token.
 *
 * - The second entry is included only if a themed variant is provided.
 * - We generate a stable, unique file name per token to avoid path collisions.
 */
export function createPerTokenFile(
  token: Token,
  tokenGroups: Array<TokenGroup>,
  rootPath: string,
  themedVariants: Array<Token>,
  tracker: TokenNameTracker,
  nameStyle: StringCase
): OutputTextFile | null {
  if (token.tokenType !== TokenType.color) {
    return null
  }

  const base = extractRgbaFromToken(token)
  if (!base) {
    return null
  }

  const entries: any[] = []

  // Base (universal) entry
  entries.push({
    color: {
      "color-space": "srgb",
      components: {
        alpha: toAlphaString(base.a),
        blue: toHexComponent(base.b),
        green: toHexComponent(base.g),
        red: toHexComponent(base.r)
      }
    },
    idiom: "universal"
  })

  // Single themed entry (dark) if provided
  for (const themedToken of themedVariants) {
    const tv = extractRgbaFromToken(themedToken)
    if (!tv) continue
    entries.push({
      appearances: [{ appearance: "luminosity", value: "dark" }],
      color: {
        "color-space": "srgb",
        components: {
          alpha: toAlphaString(tv.a),
          blue: toHexComponent(tv.b),
          green: toHexComponent(tv.g),
          red: toHexComponent(tv.r)
        }
      },
      idiom: "universal"
    })
  }

  // Generate a unique, stable file name based on token name + hierarchy using the configured style
  const baseName = tracker.getTokenName(token, tokenGroups, nameStyle, null, false)
  const fileSafeName = NamingHelper.codeSafeVariableName(baseName, nameStyle)

  // Write token-specific color set file
  const content = JSON.stringify(entries, null, 2)
  return FileHelper.createTextFile({
    relativePath: rootPath ? `./${rootPath}/${fileSafeName}.colorset` : `./${fileSafeName}.colorset`,
    fileName: "Contents.json",
    content
  })
}

