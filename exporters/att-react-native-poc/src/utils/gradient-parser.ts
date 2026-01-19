/**
 * Parses CSS linear-gradient string and converts it to React Native gradient object
 * 
 * Input format: "linear-gradient(angle, color1 stop1%, color2 stop2%, ...)"
 * Example: "linear-gradient(90deg, #0079b1 0%, rgba(${ColorTokens.xxx}, 1) 50%, #00c9ff 100%)"
 * 
 * Output format: React Native gradient object
 * {
 *   colors: ['#0079b1', '#009fdb', '#00c9ff'],
 *   locations: [0, 0.5, 1],
 *   start: { x: 0, y: 0.5 },
 *   end: { x: 1, y: 0.5 }
 * }
 */

import { CSSHelper } from "@supernovaio/export-utils"
import { Token, TokenGroup, TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { tokenObjectKeyName } from "../content/token"

export interface ParsedGradient {
  colors: string[]
  locations: number[]
  start: { x: number; y: number }
  end: { x: number; y: number }
}

interface ColorStop {
  color: string
  location: number
}

/**
 * Converts rgba color to hex
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string (e.g., "#0079b1")
 */
function rgbaToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Converts various color formats to hex
 * @param colorValue - Color value in any format (hex, rgb, rgba)
 * @returns Hex color string (e.g., "#0079b1")
 */
function colorToHex(colorValue: string): string {
  const trimmed = colorValue.trim()
  
  // Already hex format
  if (trimmed.startsWith('#')) {
    // Remove alpha channel if present (8-digit hex)
    if (trimmed.length === 9) {
      return trimmed.substring(0, 7)
    }
    return trimmed
  }
  
  // RGB/RGBA format: rgb(0, 121, 177) or rgba(0, 121, 177, 1)
  const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10)
    const g = parseInt(rgbMatch[2], 10)
    const b = parseInt(rgbMatch[3], 10)
    return rgbaToHex(r, g, b)
  }
  
  // If we can't parse it, return as-is (shouldn't happen in practice)
  return trimmed
}

/**
 * Resolves a token reference (e.g., "ColorTokens.colorFixedBrandBlue") to a hex color
 * @param tokenRef - Token reference string (e.g., "ColorTokens.colorFixedBrandBlue")
 * @param mappedTokens - Map of all tokens by ID
 * @param tokenGroups - Array of token groups for name generation
 * @param currentType - Current token type being processed
 * @returns Hex color string or null if token not found
 */
function resolveTokenReference(
  tokenRef: string,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>,
  currentType: TokenType
): string | null {
  // Parse token reference format: "ColorTokens.colorFixedBrandBlue"
  // Extract token type and name
  const match = tokenRef.match(/^(\w+)Tokens\.(.+)$/)
  if (!match) {
    return null
  }
  
  const tokenTypeName = match[1] // e.g., "Color"
  const tokenName = match[2] // e.g., "colorFixedBrandBlue"
  
  // Find the token by searching through mappedTokens
  // We need to match by token type and name
  let foundToken: Token | null = null
  
  for (const token of mappedTokens.values()) {
    // Check if token type matches
    // TokenType is a string enum, so we can compare directly or convert to string
    const tokenTypeStr = String(token.tokenType)
    if (tokenTypeStr === tokenTypeName) {
      // Check if token name matches
      const tokenKeyName = tokenObjectKeyName(token, tokenGroups, false)
      if (tokenKeyName === tokenName) {
        foundToken = token
        break
      }
    }
  }
  
  if (!foundToken) {
    return null
  }
  
  // Resolve the token value to CSS color (without references)
  const colorValue = CSSHelper.tokenToCSS(foundToken, mappedTokens, {
    allowReferences: false, // Don't allow nested references
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    forceRemUnit: exportConfiguration.forceRemUnit,
    remBase: exportConfiguration.remBase,
    tokenToVariableRef: () => '', // Not used when allowReferences is false
  })
  
  // Convert to hex format
  return colorToHex(colorValue)
}

/**
 * Type for token reference resolver function
 */
type TokenReferenceResolver = (tokenRef: string) => string | null

/**
 * Parses a color stop string and extracts color and location
 * @param stopString - Color stop string (e.g., "#0079b1 0%" or "rgba(0, 121, 177, 1) 50%" or "rgba(${ColorTokens.xxx}, 1) 50%")
 * @param resolveTokenRef - Optional function to resolve token references to hex colors
 * @returns Color stop object or null if parsing fails
 */
function parseColorStop(stopString: string, resolveTokenRef?: TokenReferenceResolver): ColorStop | null {
  const trimmed = stopString.trim()
  
  // Match: color percentage (e.g., "#0079b1 0%" or "rgba(0, 121, 177, 1) 50%")
  // First try to match hex color with percentage
  const hexMatch = trimmed.match(/^(#[0-9a-fA-F]{6})\s+(\d+(?:\.\d+)?)%$/)
  if (hexMatch) {
    return {
      color: hexMatch[1],
      location: parseFloat(hexMatch[2]) / 100
    }
  }
  
  // Try to match rgba with token reference: rgba(${ColorTokens.xxx}, 1) 50%
  if (resolveTokenRef && trimmed.includes('${')) {
    const rgbaTokenMatch = trimmed.match(/^rgba\(\$\{([^}]+)\},\s*[\d.]+\)\s+(\d+(?:\.\d+)?)%$/)
    if (rgbaTokenMatch) {
      const tokenRef = rgbaTokenMatch[1] // e.g., "ColorTokens.colorFixedBrandBlue"
      const location = parseFloat(rgbaTokenMatch[2]) / 100
      
      // Resolve token reference to hex color
      const resolvedColor = resolveTokenRef(tokenRef)
      if (resolvedColor) {
        return {
          color: resolvedColor,
          location: location
        }
      }
      // If resolution fails, return null
      return null
    }
  }
  
  // Try to match rgba color with percentage (without token references)
  const rgbaMatch = trimmed.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)\s+(\d+(?:\.\d+)?)%$/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10)
    const g = parseInt(rgbaMatch[2], 10)
    const b = parseInt(rgbaMatch[3], 10)
    const location = parseFloat(rgbaMatch[4]) / 100
    
    return {
      color: rgbaToHex(r, g, b),
      location: location
    }
  }
  
  return null
}

/**
 * Converts angle in degrees to React Native start/end coordinates
 * @param angleDegrees - Angle in degrees (e.g., 90, 180, 136.2587236333144)
 * @returns Object with start and end coordinates
 */
function angleToCoordinates(angleDegrees: number): { start: { x: number; y: number }; end: { x: number; y: number } } {
  // Normalize angle to 0-360 range
  const normalizedAngle = ((angleDegrees % 360) + 360) % 360
  
  // Standard angles (optimized paths)
  if (normalizedAngle === 0) {
    // Top to bottom
    return {
      start: { x: 0.5, y: 0 },
      end: { x: 0.5, y: 1 }
    }
  }
  if (normalizedAngle === 90) {
    // Left to right
    return {
      start: { x: 0, y: 0.5 },
      end: { x: 1, y: 0.5 }
    }
  }
  if (normalizedAngle === 180) {
    // Bottom to top
    return {
      start: { x: 0.5, y: 1 },
      end: { x: 0.5, y: 0 }
    }
  }
  if (normalizedAngle === 270) {
    // Right to left
    return {
      start: { x: 1, y: 0.5 },
      end: { x: 0, y: 0.5 }
    }
  }
  
  // Custom angle: use trigonometry
  // CSS angles: 0deg = top, 90deg = right, 180deg = bottom, 270deg = left
  // React Native: coordinates are 0-1, with (0,0) at top-left
  const radians = (normalizedAngle * Math.PI) / 180
  
  // Calculate direction vector
  const x = Math.sin(radians)
  const y = -Math.cos(radians) // Negative because y increases downward in React Native
  
  // Normalize to 0-1 range
  // The gradient goes from center + direction to center - direction
  const length = Math.sqrt(x * x + y * y)
  const normalizedX = x / length
  const normalizedY = y / length
  
  // Calculate start and end points
  // Start is center - direction, end is center + direction
  const centerX = 0.5
  const centerY = 0.5
  const offset = 0.5 // Half the diagonal
  
  const startX = Math.max(0, Math.min(1, centerX - normalizedX * offset))
  const startY = Math.max(0, Math.min(1, centerY - normalizedY * offset))
  const endX = Math.max(0, Math.min(1, centerX + normalizedX * offset))
  const endY = Math.max(0, Math.min(1, centerY + normalizedY * offset))
  
  return {
    start: { x: startX, y: startY },
    end: { x: endX, y: endY }
  }
}

/**
 * Parses a CSS linear-gradient string and converts it to React Native format
 * @param gradientString - CSS linear-gradient string
 * @param mappedTokens - Map of all tokens by ID for resolving token references
 * @param tokenGroups - Array of token groups for name generation
 * @param currentType - Current token type being processed
 * @returns Parsed gradient object or null if parsing fails
 */
export function parseGradientString(
  gradientString: string,
  mappedTokens?: Map<string, Token>,
  tokenGroups?: Array<TokenGroup>,
  currentType?: TokenType
): ParsedGradient | null {
  // Remove surrounding quotes or backticks if present
  const cleanString = gradientString.replace(/^['"`]|['"`]$/g, '').trim()
  
  // Match: linear-gradient(angle, color1 stop1%, color2 stop2%, ...)
  // Example: linear-gradient(90deg, #0079b1 0%, rgba(${ColorTokens.xxx}, 1) 50%, #00c9ff 100%)
  const gradientRegex = /^linear-gradient\(([^,]+),\s*(.+)\)$/
  const match = cleanString.match(gradientRegex)
  
  if (!match) {
    return null
  }
  
  const anglePart = match[1].trim()
  const stopsPart = match[2].trim()
  
  // Parse angle
  const angleMatch = anglePart.match(/^(\d+(?:\.\d+)?)deg$/)
  if (!angleMatch) {
    return null
  }
  const angleDegrees = parseFloat(angleMatch[1])
  
  // Convert angle to coordinates
  const coordinates = angleToCoordinates(angleDegrees)
  
  // Create token reference resolver if we have the necessary context
  const resolveTokenRef: TokenReferenceResolver | undefined = 
    mappedTokens && tokenGroups && currentType
      ? (tokenRef: string) => resolveTokenReference(tokenRef, mappedTokens, tokenGroups, currentType)
      : undefined
  
  // Parse color stops
  // Split by comma, but be careful with rgba() which contains commas
  const stops: ColorStop[] = []
  let currentStop = ''
  let parenDepth = 0
  
  for (let i = 0; i < stopsPart.length; i++) {
    const char = stopsPart[i]
    
    if (char === '(') {
      parenDepth++
      currentStop += char
    } else if (char === ')') {
      parenDepth--
      currentStop += char
    } else if (char === ',' && parenDepth === 0) {
      // This comma separates stops
      const parsedStop = parseColorStop(currentStop.trim(), resolveTokenRef)
      if (parsedStop) {
        stops.push(parsedStop)
      }
      currentStop = ''
    } else {
      currentStop += char
    }
  }
  
  // Don't forget the last stop
  if (currentStop.trim()) {
    const parsedStop = parseColorStop(currentStop.trim(), resolveTokenRef)
    if (parsedStop) {
      stops.push(parsedStop)
    }
  }
  
  if (stops.length === 0) {
    return null
  }
  
  // Sort stops by location (in case they're out of order)
  stops.sort((a, b) => a.location - b.location)
  
  // Extract colors and locations
  const colors = stops.map(stop => stop.color)
  const locations = stops.map(stop => stop.location)
  
  return {
    colors,
    locations,
    start: coordinates.start,
    end: coordinates.end
  }
}

/**
 * Converts parsed gradient object to React Native gradient object string
 * @param parsedGradient - Parsed gradient object
 * @returns Formatted string representation of gradient object
 */
export function gradientToReactNativeString(parsedGradient: ParsedGradient): string {
  const colorsStr = `[${parsedGradient.colors.map(c => `'${c}'`).join(', ')}]`
  const locationsStr = `[${parsedGradient.locations.join(', ')}]`
  const startStr = `{ x: ${parsedGradient.start.x}, y: ${parsedGradient.start.y} }`
  const endStr = `{ x: ${parsedGradient.end.x}, y: ${parsedGradient.end.y} }`
  
  return `{
  colors: ${colorsStr},
  locations: ${locationsStr},
  start: ${startStr},
  end: ${endStr},
}`
}
