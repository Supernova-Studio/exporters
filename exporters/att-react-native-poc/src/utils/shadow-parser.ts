/**
 * Parses CSS box-shadow string and converts it to React Native ViewStyle object
 * 
 * Input format: "offsetX offsetY blurRadius spread colorHex"
 * Example: "0px 16px 24px 0px #00000014"
 * 
 * Output format: React Native ViewStyle shadow properties
 * {
 *   shadowColor: '#000000',
 *   shadowOffset: { width: 0, height: 16 },
 *   shadowOpacity: 0.078,
 *   shadowRadius: 12,
 *   elevation: 12
 * }
 */

export interface ParsedShadow {
  shadowColor: string
  shadowOffset: { width: number; height: number }
  shadowOpacity: number
  shadowRadius: number
  elevation: number
}

/**
 * Converts hex alpha value to opacity (0-1)
 * @param hexAlpha - Hex alpha value (e.g., "14" from #00000014)
 * @returns Opacity value between 0 and 1
 */
function hexAlphaToOpacity(hexAlpha: string): number {
  const alpha = parseInt(hexAlpha, 16)
  return Math.round((alpha / 255) * 1000) / 1000 // Round to 3 decimal places
}

/**
 * Extracts color and alpha from hex color string
 * @param colorHex - Hex color with alpha (e.g., "#00000014")
 * @returns Object with base color and opacity
 */
function parseColorWithAlpha(colorHex: string): { color: string; opacity: number } {
  // Handle 8-digit hex (#RRGGBBAA) or 6-digit hex (#RRGGBB)
  if (colorHex.length === 9) {
    // 8-digit: #RRGGBBAA
    const baseColor = colorHex.substring(0, 7) // #RRGGBB
    const alpha = colorHex.substring(7, 9) // AA
    return {
      color: baseColor,
      opacity: hexAlphaToOpacity(alpha)
    }
  } else if (colorHex.length === 7) {
    // 6-digit: #RRGGBB (no alpha, default to 1.0)
    return {
      color: colorHex,
      opacity: 1.0
    }
  }
  
  // Fallback: assume black with full opacity
  return {
    color: '#000000',
    opacity: 1.0
  }
}

/**
 * Parses a CSS box-shadow string and converts it to React Native format
 * @param shadowString - CSS box-shadow string (e.g., "0px 16px 24px 0px #00000014")
 * @returns Parsed shadow object or null if parsing fails
 */
export function parseShadowString(shadowString: string): ParsedShadow | null {
  // Remove surrounding quotes if present
  const cleanString = shadowString.replace(/^['"]|['"]$/g, '').trim()
  
  // Regex to match: offsetX offsetY blurRadius spread colorHex
  // Example: "0px 16px 24px 0px #00000014"
  const shadowRegex = /^(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(#[0-9a-fA-F]{6,8})$/
  const match = cleanString.match(shadowRegex)
  
  if (!match) {
    return null
  }
  
  const offsetX = parseFloat(match[1])
  const offsetY = parseFloat(match[2])
  const blurRadius = parseFloat(match[3])
  const spread = parseFloat(match[4])
  const colorHex = match[5]
  
  // Parse color and alpha
  const { color, opacity } = parseColorWithAlpha(colorHex)
  
  // Calculate shadowRadius (typically blur / 2)
  const shadowRadius = Math.round((blurRadius / 2) * 10) / 10
  
  // Calculate elevation (approximation for Android, typically same as shadowRadius)
  const elevation = Math.round(shadowRadius)
  
  return {
    shadowColor: color,
    shadowOffset: {
      width: offsetX,
      height: offsetY
    },
    shadowOpacity: opacity,
    shadowRadius: shadowRadius,
    elevation: elevation
  }
}

/**
 * Converts parsed shadow object to React Native ViewStyle object string
 * @param parsedShadow - Parsed shadow object
 * @returns Formatted string representation of ViewStyle object
 */
export function shadowToReactNativeString(parsedShadow: ParsedShadow): string {
  return `{
  shadowColor: '${parsedShadow.shadowColor}',
  shadowOffset: { width: ${parsedShadow.shadowOffset.width}, height: ${parsedShadow.shadowOffset.height} },
  shadowOpacity: ${parsedShadow.shadowOpacity},
  shadowRadius: ${parsedShadow.shadowRadius},
  elevation: ${parsedShadow.elevation},
}`
}
