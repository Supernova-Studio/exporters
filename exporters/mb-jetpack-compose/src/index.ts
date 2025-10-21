import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, Token, TokenType } from "@supernovaio/sdk-exporters"
import { StringCase, TokenNameTracker, WriteTokenPropStore, NamingHelper } from "@supernovaio/export-utils"
import { createComposeColorFile } from "./files/compose-colors"
import { ExporterConfiguration } from "../config"

/**
 * Android Jetpack Compose Color Exporter
 *
 * What this exporter does:
 * - Reads color tokens from the current design system version
 * - Groups tokens by collection (e.g., primitive, semantic)
 * - Generates Kotlin files with @Immutable color objects for each collection
 * - Each .kt file contains color properties in Color(0xAARRGGBB) format
 * - Supports configurable folder, file, and object naming
 *
 * Output structure:
 * - <outputFolderName>/
 *   - <fileName>.kt (one file per collection)
 *
 * Each .kt file contains:
 * ```kotlin
 * @Immutable 
 * object ObjectName {
 *     val PropertyName = Color(0xFFRRGGBB)
 * }
 * ```
 */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Identify which design system + version we are exporting from
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  // Fetch tokens and token groups from the selected design system version
  const tokens = await sdk.tokens.getTokens(remoteVersionIdentifier)
  const tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier)

  // Only color tokens are relevant for Jetpack Compose colors
  const colorTokens = tokens.filter((t) => t.tokenType === TokenType.color)

  // Prepare output files
  const files: Array<AnyOutputFile> = []
  const tracker = new TokenNameTracker()

  // Group tokens by collection based on their group hierarchy
  const tokensByCollection = new Map<string, Array<Token>>()
  
  for (const token of colorTokens) {
    // Find the root group (collection) for this token
    const rootGroup = findRootGroup(token, tokenGroups)
    
    if (rootGroup) {
      const collectionName = rootGroup.name.toLowerCase()
      
      // Only include tokens from configured collections
      if (exportConfiguration.collectionNames.includes(collectionName)) {
        if (!tokensByCollection.has(collectionName)) {
          tokensByCollection.set(collectionName, [])
        }
        tokensByCollection.get(collectionName)!.push(token)
      }
    } else {
      // If no root group found, try to use the token's direct group
      const directGroup = tokenGroups.find(g => g.id === (token as any).groupId)
      if (directGroup) {
        const collectionName = directGroup.name.toLowerCase()
        if (exportConfiguration.collectionNames.includes(collectionName)) {
          if (!tokensByCollection.has(collectionName)) {
            tokensByCollection.set(collectionName, [])
          }
          tokensByCollection.get(collectionName)!.push(token)
        }
      }
    }
  }

  // Generate one .kt file per collection
  for (const [collectionName, collectionTokens] of tokensByCollection) {
    const fileName = exportConfiguration.fileNames[collectionName] || collectionName
    const objectName = exportConfiguration.objectNames[collectionName] || `${collectionName}Colors`
    
    const file = createComposeColorFile(
      collectionTokens,
      collectionName,
      objectName,
      fileName,
      exportConfiguration.outputFolderName,
      tokenGroups,
      tracker
    )
    
    if (file) {
      files.push(file)
    }
  }

  // Fallback: if no collections were found, create a single file with all color tokens
  if (tokensByCollection.size === 0 && colorTokens.length > 0) {
    const fallbackCollectionName = "colors"
    const fileName = exportConfiguration.fileNames[fallbackCollectionName] || "Colors"
    const objectName = exportConfiguration.objectNames[fallbackCollectionName] || "Colors"
    
    const file = createComposeColorFile(
      colorTokens,
      fallbackCollectionName,
      objectName,
      fileName,
      exportConfiguration.outputFolderName,
      tokenGroups,
      tracker
    )
    
    if (file) {
      files.push(file)
    }
  }

  // Optional write-back of property names to tokens as a custom property
  if (exportConfiguration.writeNameToProperty && !(context as any).isPreview) {
    const writeStore = new WriteTokenPropStore(sdk, remoteVersionIdentifier)
    await writeStore.writeTokenProperties(exportConfiguration.propertyToWriteNameTo, colorTokens, (t) => {
      // Use tracker to mirror exported property names
      const name = tracker.getTokenName(t, tokenGroups, StringCase.pascalCase, null, true)
      return NamingHelper.codeSafeVariableName(name, StringCase.pascalCase)
    })
  }

  // Return all files to the export engine for writing to the destination
  return files
})

/**
 * Helper function to find the root group (collection) for a token
 * by traversing up the group hierarchy
 */
function findRootGroup(token: Token, tokenGroups: Array<any>): any | null {
  // Get the group ID from the token's path or use a different approach
  const tokenGroupId = (token as any).groupId || (token as any).parentGroupId
  if (!tokenGroupId) {
    return null
  }
  
  const group = tokenGroups.find(g => g.id === tokenGroupId)
  if (!group) {
    return null
  }
  
  // If this group has no parent, it's the root group
  if (!group.parentId) {
    return group
  }
  
  // Recursively find the root group
  const parentToken = { ...token } as any
  parentToken.groupId = group.parentId
  return findRootGroup(parentToken as Token, tokenGroups)
}
