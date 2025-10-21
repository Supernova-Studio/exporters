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

  const filter = {brandId: context.brandId ?? undefined}

  // Fetch tokens, token groups, and token collections from the selected design system version
  const tokens = await sdk.tokens.getTokens(remoteVersionIdentifier, filter)
  const tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier, filter)
  const tokenCollections = await sdk.tokens.getTokenCollections(remoteVersionIdentifier)

  // Only color tokens are relevant for Jetpack Compose colors
  let colorTokens = tokens.filter((t) => t.tokenType === TokenType.color)

  // Prepare output files
  const files: Array<AnyOutputFile> = []
  const tracker = new TokenNameTracker()

  // Filter tokens to only include those from configured collections
  const configuredCollectionNames = new Set(
    exportConfiguration.collectionNames.map(name => name.toLowerCase().trim())
  )

  // Filter tokens based on their collectionId
  colorTokens = colorTokens.filter((token) => {
    // Find the collection this token belongs to
    const tokenCollection = tokenCollections.find(c => c.persistentId === token.collectionId)
    
    // Include if the collection name matches any configured collection (case-insensitive)
    if (tokenCollection && configuredCollectionNames.has(tokenCollection.name.toLowerCase().trim())) {
      return true // Include this token
    }
    
    return false // Exclude this token
  })

  // Group tokens by collection
  const tokensByCollection = new Map<string, Array<Token>>()
  
  for (const token of colorTokens) {
    // Find the collection this token belongs to
    const tokenCollection = tokenCollections.find(c => c.persistentId === token.collectionId)
    
    if (tokenCollection) {
      const collectionName = tokenCollection.name.toLowerCase().trim()
      
      if (!tokensByCollection.has(collectionName)) {
        tokensByCollection.set(collectionName, [])
      }
      tokensByCollection.get(collectionName)!.push(token)
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

