// Core imports from Supernova SDK for exporter functionality
import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, AssetFormat } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration } from "../config"
// Import asset conversion functions for generating React components and related files
import { convertRenderedAssetsToComponentsInBatches, convertRenderedAssetsToOriginalSVG, convertRenderedAssetsToIndexFile } from "./files"
// Import path filtering utilities
import { isPathFilteredOut } from "./paths"

/**
 * SVG to React Component Exporter - Main Export Function
 * 
 * This is the primary entry point for the SVG to React component exporter.
 * When users run the export process through Supernova's interface or pipelines,
 * this function orchestrates the entire conversion process.
 * 
 * The exporter takes SVG assets from a Supernova design system and converts them into:
 * - React components (TypeScript or JavaScript)
 * - Optional original SVG files
 * - Optional index file for easy importing
 * 
 * @param sdk - Supernova SDK instance providing access to design system data
 * @param context - Export context containing design system ID and version information
 * @returns Promise<Array<AnyOutputFile>> - Array of generated files ready for download/deployment
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Create identifier for the specific design system version being exported
  // This ensures we're working with the exact version the user selected
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  // Fetch all asset-related data from the design system
  // - assets: Individual asset metadata (names, descriptions, etc.)
  // - assetGroups: Organizational structure (folders, categories)
  // - renderedAssets: Actual SVG files rendered at the specified scale
  let assets = await sdk.assets.getAssets(remoteVersionIdentifier)
  let assetGroups = await sdk.assets.getAssetGroups(remoteVersionIdentifier)
  let renderedAssets = await sdk.assets.getRenderedAssets(
    remoteVersionIdentifier,
    assets,
    assetGroups,
    AssetFormat.svg, // We specifically request SVG format
    exportConfiguration.svgScale // Scale factor from user configuration
  )

  // Initialize array to collect all generated files
  let resultingFiles: Array<AnyOutputFile> = []

  // Apply path-based filtering if configured
  // Users can specify asset paths/folders to exclude from export
  // This is useful for excluding deprecated assets or platform-specific icons
  if (exportConfiguration.ignoredAssetPaths.length > 0) {
    renderedAssets = renderedAssets.filter(
      (a) => !isPathFilteredOut(exportConfiguration.ignoredAssetPaths, [...a.group.path, a.group.name])
    )
  }

  // STEP 1: Convert SVG assets to React components
  // This is the core functionality - transforming raw SVG files into reusable React components
  // Processing happens in batches to avoid overwhelming the system with concurrent operations
  const components = await convertRenderedAssetsToComponentsInBatches(renderedAssets, sdk, exportConfiguration)
  resultingFiles = [...resultingFiles, ...components]

  // STEP 2: Optionally preserve original SVG files
  // Some users want both React components AND the original SVG files
  // This is useful for teams that need SVGs for other platforms (Android, iOS, etc.)
  if (exportConfiguration.keepOriginalSvgs) {
    const svgs = await convertRenderedAssetsToOriginalSVG(renderedAssets, exportConfiguration)
    resultingFiles = [...resultingFiles, ...svgs]
  }

  // STEP 3: Optionally generate an index file
  // Creates a central index.ts/js file that exports all components
  // This enables clean imports like: import { IconName } from './icons'
  if (exportConfiguration.generateIndex) {
    const indexFile = await convertRenderedAssetsToIndexFile(renderedAssets, exportConfiguration)
    resultingFiles.push(indexFile)
  }

  // Return all generated files to the Supernova platform
  // These files will be packaged and made available for download
  return resultingFiles
})

/**
 * Exporter Configuration Instance
 * 
 * This configuration object contains all user-customizable settings for the SVG to React exporter.
 * It merges default configuration values with user overrides from the Supernova interface.
 * 
 * Key configuration areas include:
 * - Output format (TypeScript vs JavaScript)
 * - Component structure (props, export style, naming)
 * - SVG optimization settings
 * - File organization (folders, index generation)
 * - Code formatting (Prettier integration)
 * - Accessibility features
 * 
 * The configuration adheres to the `ExporterConfiguration` interface defined in ../config.ts
 */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()
