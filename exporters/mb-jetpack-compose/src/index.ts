import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, Token, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { StringCase, TokenNameTracker, WriteTokenPropStore, NamingHelper, ThemeHelper } from "@supernovaio/export-utils"
import { createComposeColorFile, createInterfaceFile, createThemedImplementationFile } from "./files/compose-colors"
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

  // CASE 1: No theme support (current behavior)
  if (!exportConfiguration.enableThemeSupport) {
    return generateStandardExport(colorTokens, tokenGroups, tokenCollections, tracker)
  }

  // CASE 2: Theme support enabled
  // Generate files for each configured collection
  const configuredCollectionNames = new Set(
    exportConfiguration.collectionNames.map(name => name.toLowerCase().trim())
  )

  // Filter tokens based on their collectionId
  const filteredTokens = colorTokens.filter((token) => {
    const tokenCollection = tokenCollections.find(c => c.persistentId === token.collectionId)
    return tokenCollection && configuredCollectionNames.has(tokenCollection.name.toLowerCase().trim())
  })

  // Group tokens by collection
  const tokensByCollection = new Map<string, Array<Token>>()
  
  for (const token of filteredTokens) {
    const tokenCollection = tokenCollections.find(c => c.persistentId === token.collectionId)
    if (tokenCollection) {
      const collectionName = tokenCollection.name.toLowerCase().trim()
      if (!tokensByCollection.has(collectionName)) {
        tokensByCollection.set(collectionName, [])
      }
      tokensByCollection.get(collectionName)!.push(token)
    }
  }

  // Generate files for each collection
  for (const [collectionName, collectionTokens] of tokensByCollection) {
    const fileName = exportConfiguration.fileNames[collectionName] || collectionName
    const objectName = exportConfiguration.objectNames[collectionName] || `${collectionName}Colors`
    
    // Generate primitive file (always @Immutable object)
    const primitiveFile = createComposeColorFile(
      collectionTokens,
      collectionName,
      objectName,
      fileName,
      exportConfiguration.outputFolderName,
      tokenGroups,
      tracker
    )
    
    if (primitiveFile) {
      files.push(primitiveFile)
    }
  }

  // Generate interface from specified interfaceCollections
  const interfaceCollectionNames = new Set(
    exportConfiguration.interfaceCollections.map(name => name.toLowerCase().trim())
  )

  const interfaceTokens: Array<Token> = []
  for (const [collectionName, collectionTokens] of tokensByCollection) {
    if (interfaceCollectionNames.has(collectionName)) {
      interfaceTokens.push(...collectionTokens)
    }
  }

  if (interfaceTokens.length > 0) {
    const interfaceFile = generateInterfaceFile(interfaceTokens, tokenGroups, tracker)
    if (interfaceFile) {
      files.push(interfaceFile)
    }
  }
  
  // Generate themed implementations
  if (context.themeIds && context.themeIds.length > 0) {
    const themes = await sdk.tokens.getTokenThemes(remoteVersionIdentifier)
    const themesToApply = context.themeIds.map(themeId => {
      const theme = themes.find(t => t.id === themeId || t.idInVersion === themeId)
      if (!theme) throw new Error(`Unable to find theme ${themeId}`)
      return theme
    })
    
    const themeCollectionNames = new Set(
      exportConfiguration.themeCollections.map(name => name.toLowerCase().trim())
    )
    
    for (const theme of themesToApply) {
      const themedTokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, [theme])
      const themedColorTokens = themedTokens.filter((t) => t.tokenType === TokenType.color)
      
      // Filter themed tokens by themeCollections
      const filteredThemedTokens = themedColorTokens.filter((token) => {
        const tokenCollection = tokenCollections.find(c => c.persistentId === token.collectionId)
        return tokenCollection && themeCollectionNames.has(tokenCollection.name.toLowerCase().trim())
      })
      
      // Group themed tokens by collection
      const themedTokensByCollection = new Map<string, Array<Token>>()
      for (const token of filteredThemedTokens) {
        const tokenCollection = tokenCollections.find(c => c.persistentId === token.collectionId)
        if (tokenCollection) {
          const collectionName = tokenCollection.name.toLowerCase().trim()
          if (!themedTokensByCollection.has(collectionName)) {
            themedTokensByCollection.set(collectionName, [])
          }
          themedTokensByCollection.get(collectionName)!.push(token)
        }
      }
      
      // Generate themed file for each collection
      for (const [collectionName, collectionTokens] of themedTokensByCollection) {
        const fileName = exportConfiguration.themeFileNames[collectionName] || "color"
        const objectName = exportConfiguration.themeObjectNames[collectionName] || "ThemeColor"
        
        const themedFile = generateThemedImplementation(
          collectionTokens,
          themedColorTokens,
          theme,
          objectName,
          fileName,
          exportConfiguration.themeFolderName,
          exportConfiguration.themeObjectExtends,
          tokenGroups,
          tokenCollections,
          tracker
        )
        if (themedFile) {
          files.push(themedFile)
        }
      }
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
 * Generate standard export (current behavior) when theme support is disabled
 */
function generateStandardExport(
  colorTokens: Array<Token>,
  tokenGroups: Array<any>,
  tokenCollections: Array<any>,
  tracker: TokenNameTracker
): Array<AnyOutputFile> {
  const files: Array<AnyOutputFile> = []

  // Filter tokens to only include those from configured collections
  const configuredCollectionNames = new Set(
    exportConfiguration.collectionNames.map(name => name.toLowerCase().trim())
  )

  // Filter tokens based on their collectionId
  const filteredTokens = colorTokens.filter((token) => {
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
  
  for (const token of filteredTokens) {
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
  if (tokensByCollection.size === 0 && filteredTokens.length > 0) {
    const fallbackCollectionName = "colors"
    const fileName = exportConfiguration.fileNames[fallbackCollectionName] || "Colors"
    const objectName = exportConfiguration.objectNames[fallbackCollectionName] || "Colors"
    
    const file = createComposeColorFile(
      filteredTokens,
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

  return files
}

/**
 * Generate interface file from semantic collections
 */
function generateInterfaceFile(
  semanticTokens: Array<Token>,
  tokenGroups: Array<any>,
  tracker: TokenNameTracker
): AnyOutputFile | null {
  if (semanticTokens.length === 0) {
    return null
  }
  
  return createInterfaceFile(
    semanticTokens,
    exportConfiguration.interfaceName,
    exportConfiguration.interfaceFileName,
    exportConfiguration.interfacePropertyAnnotation,
    tokenGroups,
    tracker
  )
}

/**
 * Generate themed implementation file
 */
function generateThemedImplementation(
  collectionTokens: Array<Token>,
  allThemedTokens: Array<Token>,
  theme: TokenTheme,
  objectName: string,
  fileName: string,
  folderName: string,
  extendsName: string,
  tokenGroups: Array<any>,
  tokenCollections: Array<any>,
  tracker: TokenNameTracker
): AnyOutputFile | null {
  if (collectionTokens.length === 0) {
    return null
  }
  
  const themeIdentifier = ThemeHelper.getThemeIdentifier(theme, StringCase.kebabCase)
  
  return createThemedImplementationFile(
    collectionTokens,
    allThemedTokens,
    theme,
    objectName,
    fileName,
    themeIdentifier,
    folderName,
    extendsName,
    tokenGroups,
    tokenCollections,
    tracker
  )
}

