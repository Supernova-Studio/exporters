// Utility imports for file operations and general helper functions
import { FileHelper, GeneralHelper } from "@supernovaio/export-utils"
// Core types for file output and asset handling from Supernova SDK
import { AnyOutputFile, OutputTextFile, RenderedAsset, Supernova } from "@supernovaio/sdk-exporters"
// Configuration interface for exporter settings
import { ExporterConfiguration } from "../config"
// Path generation utilities for determining output file locations
import { exportReactDefinitionDestination, exportAssetDestination } from "./paths"
// SVG to React component conversion logic
import { convertSvgToReactComponent } from "./svg"

/**
 * Convert Single Rendered Asset to React Component File
 * 
 * This function handles the conversion of a single SVG asset into a React component file.
 * It orchestrates the entire process from fetching the SVG content to generating the final file.
 * 
 * Process flow:
 * 1. Determine output file destination and naming
 * 2. Fetch the actual SVG content from Supernova's CDN
 * 3. Convert SVG markup to React component code
 * 4. Apply optional disclaimer text
 * 5. Create the final output file object
 * 
 * @param asset - The rendered asset metadata containing URLs and naming information
 * @param sdk - Supernova SDK instance for network operations
 * @param exportConfiguration - User configuration settings
 * @returns Promise<AnyOutputFile> - The generated React component file ready for output
 */
export async function convertRenderedAssetToComponent(
  asset: RenderedAsset,
  sdk: Supernova,
  exportConfiguration: ExporterConfiguration
): Promise<AnyOutputFile> {
  // Generate the destination path and component name based on asset metadata
  // This respects the folder structure from the design system and user configuration
  const destination = exportReactDefinitionDestination(asset, exportConfiguration.componentFolder)
  
  // Fetch the actual SVG content from Supernova's asset CDN
  // The sourceUrl points to the rendered SVG file at the specified scale
  const response = await sdk.network.fetch(asset.sourceUrl)
  const svg = await response.text()
  
  // Transform the raw SVG markup into a complete React component
  // This includes attribute conversion, prop handling, styling, etc.
  const componentCode = await convertSvgToReactComponent(svg, destination.className)
  
  // Optionally add a header disclaimer to the generated file
  // This helps users understand the file is auto-generated and shouldn't be manually edited
  let finalContent = componentCode
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    finalContent = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, componentCode)
  }
  
  // Create the final file object that will be included in the export package
  const component = FileHelper.createTextFile({
    content: finalContent,
    relativePath: destination.path,
    fileName: destination.name,
  })
  return component
}

/**
 * Convert Multiple Assets to React Components Using Batch Processing
 * 
 * This function processes multiple SVG assets concurrently while managing system resources.
 * It implements batch processing to prevent overwhelming the network and memory with too many
 * simultaneous operations, which is especially important for large icon libraries.
 * 
 * Why batch processing?
 * - Prevents memory exhaustion with large asset collections
 * - Manages network concurrency to avoid rate limiting
 * - Provides better error isolation (one bad asset doesn't kill the entire export)
 * - Allows for potential progress reporting in the future
 * 
 * @param renderedAssets - Array of all assets to be converted to React components
 * @param sdk - Supernova SDK instance for network operations
 * @param exportConfiguration - User configuration settings
 * @returns Promise<Array<AnyOutputFile>> - Array of all generated React component files
 */
export async function convertRenderedAssetsToComponentsInBatches(
  renderedAssets: Array<RenderedAsset>,
  sdk: Supernova,
  exportConfiguration: ExporterConfiguration
): Promise<Array<AnyOutputFile>> {
  const resultingFiles: Array<AnyOutputFile> = []
  // Split assets into manageable chunks of 20 for concurrent processing
  // This balances performance with resource management
  const chunks = chunkArray(renderedAssets, 20)

  // Process each batch sequentially, but items within each batch concurrently
  for (const chunk of chunks) {
    const batchPromises = chunk.map((asset) => convertRenderedAssetToComponent(asset, sdk, exportConfiguration))
    const batchResults = await Promise.all(batchPromises)
    resultingFiles.push(...batchResults)
  }

  return resultingFiles
}

/**
 * Generate Original SVG Files from Rendered Assets
 * 
 * This function creates copies of the original SVG files alongside the React components.
 * This is useful for teams that need the raw SVG files for:
 * - Other platforms (Android, iOS, Web without React)
 * - Design tools and documentation
 * - Manual customization or editing
 * - Backup/archival purposes
 * 
 * The function creates remote file references that tell Supernova to download
 * and include the original SVG files in the export package.
 * 
 * @param renderedAssets - Array of assets with their rendered SVG URLs
 * @param exportConfiguration - User configuration including the original SVG folder setting
 * @returns Promise<Array<AnyOutputFile>> - Array of SVG file references for download
 */
export async function convertRenderedAssetsToOriginalSVG(
  renderedAssets: Array<RenderedAsset>,
  exportConfiguration: ExporterConfiguration
): Promise<Array<AnyOutputFile>> {
  // Map each asset to a file copy operation
  // This creates references to download the SVG files from their source URLs
  const renderedSVGs = renderedAssets.map((a) => {
    const destination = exportAssetDestination(a, exportConfiguration.originalSvgFolder)
    return FileHelper.createCopyRemoteFile({
      url: a.sourceUrl, // Supernova CDN URL for the rendered SVG
      relativePath: destination.path, // Destination folder structure
      fileName: destination.name, // Final SVG file name
    })
  })

  return renderedSVGs
}

/**
 * Generate Central Index File for All React Components
 * 
 * This function creates a central index.ts/js file that exports all generated React components.
 * This enables clean, centralized imports in consuming applications:
 * 
 * Examples:
 * - import { IconHome, IconSettings } from './generated-icons'
 * - import * as Icons from './generated-icons'
 * 
 * The index file respects the user's export style configuration:
 * - Default exports: export { default as IconName } from './path/IconName'
 * - Named exports: export { IconName } from './path/IconName'  
 * - Direct exports: export * from './path/IconName'
 * 
 * @param renderedAssets - Array of assets to include in the index
 * @param exportConfiguration - User configuration for export style and file format
 * @returns Promise<OutputTextFile> - The generated index file
 */
export async function convertRenderedAssetsToIndexFile(
  renderedAssets: Array<RenderedAsset>,
  exportConfiguration: ExporterConfiguration
): Promise<OutputTextFile> {
  // Transform asset metadata into file path information needed for imports
  const filePaths = renderedAssets.map((asset) => {
    const destination = exportReactDefinitionDestination(asset, exportConfiguration.componentFolder)
    return {
      path: destination.path, // Relative path to the component file
      componentName: destination.className // The component's class/function name
    }
  })
  
  // Generate the actual export statements based on user configuration
  const { generateIndexFile } = await import("./svg")
  const { applyCustomIndexTemplate } = await import("./templates")
  const indexContent = generateIndexFile(filePaths)
  
  // Apply user's custom index template if configured
  // This allows advanced users to customize the index file structure
  const customizedContent = applyCustomIndexTemplate(indexContent, filePaths)
  
  // Add optional disclaimer header to the index file
  let finalContent = customizedContent
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    finalContent = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, customizedContent)
  }

  // Create the final index file with appropriate extension
  const indexFile = FileHelper.createTextFile({
    content: finalContent,
    relativePath: "./", // Place in root of export
    fileName: exportConfiguration.typescript ? "index.ts" : "index.js",
  })

  return indexFile
}

/**
 * Utility Function: Split Array into Smaller Chunks
 * 
 * This helper function divides a large array into smaller, manageable chunks.
 * It's used to implement batch processing for asset conversion to prevent
 * memory issues and manage concurrency effectively.
 * 
 * @param array - The array to be chunked
 * @param chunkSize - The maximum size of each chunk
 * @returns T[][] - Array of chunks, where each chunk is an array of T
 * @throws Error if chunkSize is <= 0
 * 
 * @example
 * chunkArray([1,2,3,4,5], 2) => [[1,2], [3,4], [5]]
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    throw new Error("Chunk size should be greater than 0.")
  }

  const result: T[][] = []
  // Process array in chunks by slicing at regular intervals
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize))
  }
  return result
}
