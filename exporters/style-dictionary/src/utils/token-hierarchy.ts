import { TokenType, Token } from "@supernovaio/sdk-exporters"
import { NamingHelper, TokenNameTracker } from "@supernovaio/export-utils"
import { exportConfiguration } from ".."
import { getTokenPrefix } from "../content/token"

// Create a single instance of the tracker for consistent name generation
const tokenNameTracker = new TokenNameTracker()

/**
 * Reset the name tracking between file generations
 */
export function resetNameTracking(): void {
  tokenNameTracker.reset()
}

/**
 * Processes a token name according to our rules using TokenNameTracker
 */
export function processTokenName(name: string, token: Token, path: string[] = []): string {
  // Get name from TokenNameTracker
  let tokenName = tokenNameTracker.getSimpleTokenName(
    token,
    exportConfiguration.tokenNameStyle,
    false,
    path
  )

  // Remove leading underscore from any token name
  if (tokenName.startsWith('_')) {
    tokenName = tokenName.slice(1)
  }

  return tokenName
}

/**
 * Converts a token's full path and name into a hierarchical object structure
 * First level is always the type prefix (e.g. 'color')
 * Middle levels come from path segments
 * Last level is the token name
 */
export function createHierarchicalStructure(
  path: string[] | undefined, 
  name: string, 
  value: any,
  token: Token
): any {
  // First level is always the type prefix from configuration or defaults
  const prefix = getTokenPrefix(token.tokenType)
  
  // Middle levels come from path segments
  const pathLevels = (path || [])
    .filter(segment => segment && segment.trim().length > 0)
    .map(segment => NamingHelper.codeSafeVariableName(segment, exportConfiguration.tokenNameStyle))

  // Process the token name using TokenNameTracker with path
  const tokenName = processTokenName(name, token, pathLevels)

  // Combine all levels
  const allLevels = [
    ...(exportConfiguration.globalNamePrefix ? [exportConfiguration.globalNamePrefix] : []),
    prefix,
    ...pathLevels,
    tokenName
  ]

  // Build the nested structure
  return allLevels.reduceRight((nestedValue, segment) => ({
    [segment]: nestedValue
  }), value)
}

/**
 * Deeply merges objects together
 * @param target Target object to merge into
 * @param source Source object to merge from
 * @returns Merged object
 */
export function deepMerge(target: any, source: any): any {
  if (!target) return source
  if (!source) return target
  
  const output = { ...target }
  
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!(key in target)) {
        output[key] = source[key]
      } else {
        output[key] = deepMerge(target[key], source[key])
      }
    } else {
      output[key] = source[key]
    }
  })
  
  return output
} 