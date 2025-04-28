import { TokenType, Token } from "@supernovaio/sdk-exporters"
import { DesignSystemCollection } from '@supernovaio/sdk-exporters/build/sdk-typescript/src/model/base/SDKDesignSystemCollection'
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
export function processTokenName(
  token: Token, 
  path: string[] = [],
  collections: Array<DesignSystemCollection> = []
): string {
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
  token: Token,
  collections: Array<DesignSystemCollection> = []
): any {
  // Get collection name if needed for collection-based token organization
  let collectionSegment: string | null = null
  if (exportConfiguration.tokenNameStructure === 'collectionPathAndName' && token.collectionId) {
    const collection = collections.find(c => c.persistentId === token.collectionId)
    collectionSegment = collection?.name ?? null
  }

  // First level is always the type prefix (e.g., 'color', 'typography')
  const prefix = NamingHelper.codeSafeVariableName(
    getTokenPrefix(token.tokenType),
    exportConfiguration.tokenNameStyle
  )

  // Build the initial segments array with global prefix (if any) and type prefix
  const segments = [
    ...(exportConfiguration.globalNamePrefix ? 
      [NamingHelper.codeSafeVariableName(exportConfiguration.globalNamePrefix, exportConfiguration.tokenNameStyle)] : 
      []),
    ...(prefix ? [prefix] : [])
  ]

  // Add collection to the output path if present
  if (collectionSegment) {
    segments.push(NamingHelper.codeSafeVariableName(collectionSegment, exportConfiguration.tokenNameStyle))
  }

  // Create path segments array for name uniqueness checking
  // We include the collection name here so tokens with the same path in different collections
  // don't get treated as duplicates
  const pathSegments = [
    // Collection name (if any) becomes part of the uniqueness check
    ...(collectionSegment ? [collectionSegment] : []),
    // Regular path segments are included unless nameOnly structure is selected
    ...(exportConfiguration.tokenNameStructure !== 'nameOnly'
      ? (path || [])
          .filter(segment => segment && segment.trim().length > 0)
          .map(segment => NamingHelper.codeSafeVariableName(segment, exportConfiguration.tokenNameStyle))
      : [])
  ]

  // Add path segments to the output structure
  // We don't include collection here since it was already added above
  if (exportConfiguration.tokenNameStructure !== 'nameOnly') {
    segments.push(
      ...(path || [])
        .filter(segment => segment && segment.trim().length > 0)
        .map(segment => NamingHelper.codeSafeVariableName(segment, exportConfiguration.tokenNameStyle))
    )
  }

  // Generate a unique token name that considers the collection context
  // This ensures we only add numbering (_1, _2) when there are actual conflicts
  // within the same collection path
  const tokenName = tokenNameTracker.getSimpleTokenName(
    token,
    exportConfiguration.tokenNameStyle,
    false,
    pathSegments
  )

  // Add the unique token name as the final segment, removing any leading underscore
  segments.push(tokenName.replace(/^_/, ''))

  // Build the nested object structure from the segments
  return segments.reduceRight((nestedValue, segment) => ({
    [segment]: nestedValue
  }), value)
}

/**
 * Deeply merges objects together, ensuring descriptions appear after all other properties
 * 
 * This function handles a special case for token descriptions:
 * 1. Extracts descriptions from both objects being merged
 * 2. Removes them temporarily to prevent them from being merged in the middle
 * 3. Merges all other properties (themes, values, etc.)
 * 4. Adds the description back at the very end
 * 
 * This ensures the output format is consistent:
 * {
 *   base: { value: "..." },
 *   theme-light: { value: "..." },
 *   theme-dark: { value: "..." },
 *   description: "..."  // Always last
 * }
 * 
 * @param target Target object to merge into
 * @param source Source object to merge from
 * @returns Merged object with description at the end
 */
export function deepMerge(target: any, source: any): any {
  if (!target) return source
  if (!source) return target
  
  const output = { ...target }
  
  // Get description from either object (if it exists)
  const description = source.description || target.description
  delete output.description
  delete source.description

  // Merge everything except description
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

  // Add description back at the end if it exists
  if (description) {
    output.description = description
  }
  
  return output
} 