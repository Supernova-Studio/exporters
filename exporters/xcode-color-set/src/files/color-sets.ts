import { OutputTextFile, Token, TokenGroup, TokenType, ColorToken } from "@supernovaio/sdk-exporters"
import { FileHelper, NamingHelper, StringCase, TokenNameTracker } from "@supernovaio/export-utils"

/**
 * Color set file builders for Xcode .xcassets
 *
 * This module converts Supernova color tokens into the Apple asset catalog layout:
 *   <root or rootCatalogPath>/
 *     <folderName>.colorset/
 *       Contents.json   // JSON array with base + optional dark appearance entries
 *
 * It intentionally uses a compact array format for Contents.json (as requested for this PoC),
 * rather than the usual Xcode wrapper object with an "info" key.
 *
 * Naming & uniqueness
 * - Folder names are produced using a TokenNameTracker (stable & unique per export)
 * - The final folder name formatting is controlled by the configured StringCase
 * - We additionally run the name through NamingHelper to ensure it is file-system safe
 *
 * Pathing
 * - If a root catalog path is provided, color set folders are placed under it
 * - If root path is empty, color set folders are written directly into the export root
 */

/**
 * Convert a 0..255 channel value to the Xcode-required string format "0xHH"
 * (uppercase hex with 2 digits, prefixed with 0x).
 *
 * Notes:
 * - Values are clamped to the [0, 255] range and rounded to the nearest integer
 * - Output always uses uppercase hex to match common iOS conventions
 */
function toHexComponent(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)))
  return `0x${clamped.toString(16).toUpperCase().padStart(2, "0")}`
}

/**
 * Convert an alpha value to a 3-decimal string (e.g., "0.180"). The Xcode format in this PoC
 * expects alpha as a fractional string.
 *
 * Notes:
 * - Values are clamped to the [0, 1] range
 * - Always prints exactly 3 decimals to keep a consistent file diff
 */
function toAlphaString(alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha))
  return a.toFixed(3)
}

/**
 * Creates the mandatory root file for an Xcode asset catalog when requested.
 * If rootPath is empty, this function should not be called.
 *
 * The content is the minimal info block Xcode expects inside an asset catalog root.
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
 *
 * A best-effort approach is used here: if the token is not a ColorToken or the structure
 * is unexpected, the function returns null so the caller can decide to skip the file.
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
 * Parameters
 * - token:         The token to export (must be TokenType.color)
 * - tokenGroups:   All groups from the design system, used for hierarchical naming
 * - rootPath:      Asset catalog root (can be empty to write into export root)
 * - themedVariants:Array of tokens representing themed values for the same logical token.
 *                  In this PoC we expect at most one item representing the "dark" appearance,
 *                  but the function gracefully supports multiple entries if provided.
 * - tracker:       TokenNameTracker to produce stable, unique folder names
 * - nameStyle:     Desired case style for folder names (e.g., pascalCase, kebabCase)
 *
 * Returns
 * - OutputTextFile describing where to write the `Contents.json`, or null if input token is not a color
 *
 * File content structure (array):
 * [
 *   {
 *     "idiom": "universal",
 *     "color": {
 *       "color-space": "srgb",
 *       "components": { "red": "0xRR", "green": "0xGG", "blue": "0xBB", "alpha": "0.000" }
 *     }
 *   },
 *   {
 *     "appearances": [{ "appearance": "luminosity", "value": "dark" }],
 *     "idiom": "universal",
 *     "color": { ...themed components... }
 *   }
 * ]
 *
 * Implementation notes
 * - The order of entries is significant: base first, then dark appearance(s)
 * - Color space is fixed to sRGB for this PoC
 * - Channels are encoded as required by Xcode: 0xHH strings for RGB and fractional string for alpha
 */
export function createPerTokenFile(
  token: Token,
  tokenGroups: Array<TokenGroup>,
  rootPath: string,
  themedVariants: Array<Token>,
  tracker: TokenNameTracker,
  nameStyle: StringCase
): OutputTextFile | null {
  // Filter: this exporter handles ONLY color tokens. We intentionally skip
  // all other token types so they aren't exported as Xcode color sets.
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
  // The array supports multiple variants, but the exporter typically supplies at most one
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
  // - tracker: resolves duplicates and keeps names stable across the export session
  // - NamingHelper: ensures the resulting name is file-system safe in the selected style
  const baseName = tracker.getTokenName(token, tokenGroups, nameStyle, null, false)
  const fileSafeName = NamingHelper.codeSafeVariableName(baseName, nameStyle)

  // Write token-specific color set file. When rootPath is empty, we write to the export root.
  const content = JSON.stringify(entries, null, 2)
  return FileHelper.createTextFile({
    relativePath: rootPath ? `./${rootPath}/${fileSafeName}.colorset` : `./${fileSafeName}.colorset`,
    fileName: "Contents.json",
    content
  })
}

