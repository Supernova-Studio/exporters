import { OutputTextFile, Token, TokenGroup, TokenType, ColorToken } from "@supernovaio/sdk-exporters"
import { FileHelper, NamingHelper, StringCase, TokenNameTracker } from "@supernovaio/export-utils"

/**
 * Jetpack Compose color file builders for Android
 *
 * This module converts Supernova color tokens into Kotlin files with @Immutable color objects:
 *   <outputFolderName>/
 *     <fileName>.kt   // Kotlin file with @Immutable object containing color properties
 *
 * Each collection of tokens generates a separate .kt file with a configurable object name.
 * Color values are formatted as Color(0xAARRGGBB) where AA=alpha, RR=red, GG=green, BB=blue.
 *
 * Naming & uniqueness
 * - Property names are produced using a TokenNameTracker (stable & unique per export)
 * - The final property name formatting uses PascalCase for Kotlin conventions
 * - We additionally run the name through NamingHelper to ensure it is code-safe
 *
 * Pathing
 * - All .kt files are placed in the configured outputFolderName
 * - Each collection gets its own file with configurable naming
 */

/**
 * Convert a 0..255 channel value to a 2-digit uppercase hex string
 * (e.g., 255 -> "FF", 0 -> "00")
 *
 * Notes:
 * - Values are clamped to the [0, 255] range and rounded to the nearest integer
 * - Output always uses uppercase hex to match Android conventions
 */
function toHexComponent(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)))
  return clamped.toString(16).toUpperCase().padStart(2, "0")
}

/**
 * Extracts numeric RGBA components from a color token. The Supernova color token value
 * stores RGB channels in 0..255 and opacity as a 0..1 measure.
 *
 * A best-effort approach is used here: if the token is not a ColorToken or the structure
 * is unexpected, the function returns null so the caller can decide to skip the token.
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
 * Converts RGBA values to Android Color(0xAARRGGBB) format
 * where AA=alpha, RR=red, GG=green, BB=blue (all hex)
 */
function toAndroidColorFormat(r: number, g: number, b: number, a: number): string {
  const alpha = Math.max(0, Math.min(255, Math.round(a * 255)))
  const red = Math.max(0, Math.min(255, Math.round(r)))
  const green = Math.max(0, Math.min(255, Math.round(g)))
  const blue = Math.max(0, Math.min(255, Math.round(b)))
  
  const alphaHex = toHexComponent(alpha)
  const redHex = toHexComponent(red)
  const greenHex = toHexComponent(green)
  const blueHex = toHexComponent(blue)
  
  return `Color(0x${alphaHex}${redHex}${greenHex}${blueHex})`
}

/**
 * Creates a Kotlin file with @Immutable color object for a collection of tokens.
 *
 * Parameters
 * - tokens: Array of color tokens for this collection
 * - collectionName: Name of the collection (for reference)
 * - objectName: Name of the Kotlin object to generate
 * - fileName: Name of the .kt file (without extension)
 * - outputFolderName: Name of the output folder
 * - tokenGroups: All groups from the design system, used for hierarchical naming
 * - tracker: TokenNameTracker to produce stable, unique property names
 *
 * Returns
 * - OutputTextFile describing where to write the .kt file, or null if no valid tokens
 *
 * File content structure:
 * ```kotlin
 * @Immutable 
 * object ObjectName {
 *     val PropertyName1 = Color(0xFFRRGGBB)
 *     val PropertyName2 = Color(0xFFRRGGBB)
 * }
 * ```
 */
export function createComposeColorFile(
  tokens: Array<Token>,
  collectionName: string,
  objectName: string,
  fileName: string,
  outputFolderName: string,
  tokenGroups: Array<TokenGroup>,
  tracker: TokenNameTracker
): OutputTextFile | null {
  // Filter: this exporter handles ONLY color tokens
  const colorTokens = tokens.filter((token) => token.tokenType === TokenType.color)
  
  if (colorTokens.length === 0) {
    return null
  }

  const properties: string[] = []

  // Generate property for each color token
  for (const token of colorTokens) {
    const rgba = extractRgbaFromToken(token)
    if (!rgba) {
      continue // Skip invalid color tokens
    }

    // Generate a unique, stable property name using the tracker
    const baseName = tracker.getTokenName(token, tokenGroups, StringCase.pascalCase, null, false)
    const propertyName = NamingHelper.codeSafeVariableName(baseName, StringCase.pascalCase)
    
    // Convert to Android color format
    const colorValue = toAndroidColorFormat(rgba.r, rgba.g, rgba.b, rgba.a)
    
    properties.push(`    val ${propertyName} = ${colorValue}`)
  }

  if (properties.length === 0) {
    return null
  }

  // Generate Kotlin file content
  const content = [
    `@Immutable`,
    `object ${objectName} {`,
    ...properties,
    `}`
  ].join('\n')

  return FileHelper.createTextFile({
    relativePath: `./${outputFolderName}`,
    fileName: `${fileName}.kt`,
    content
  })
}
