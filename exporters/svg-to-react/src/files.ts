import { FileHelper, GeneralHelper } from "@supernovaio/export-utils"
import { AnyOutputFile, OutputTextFile, RenderedAsset, Supernova } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration } from "../config"
import { exportReactDefinitionDestination, exportAssetDestination } from "./paths"
import { convertSvgToReactComponent } from "./svg"

export async function convertRenderedAssetToComponent(
  asset: RenderedAsset,
  sdk: Supernova,
  exportConfiguration: ExporterConfiguration
): Promise<AnyOutputFile> {
  const destination = exportReactDefinitionDestination(asset, exportConfiguration.componentFolder)
  
  // Fetch SVG content from the source URL
  const response = await sdk.network.fetch(asset.sourceUrl)
  const svg = await response.text()
  
  // Convert SVG to React component
  const componentCode = await convertSvgToReactComponent(svg, destination.className)
  
  // Add disclaimer if enabled
  let finalContent = componentCode
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    finalContent = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, componentCode)
  }
  
  const component = FileHelper.createTextFile({
    content: finalContent,
    relativePath: destination.path,
    fileName: destination.name,
  })
  return component
}

export async function convertRenderedAssetsToComponentsInBatches(
  renderedAssets: Array<RenderedAsset>,
  sdk: Supernova,
  exportConfiguration: ExporterConfiguration
): Promise<Array<AnyOutputFile>> {
  const resultingFiles: Array<AnyOutputFile> = []
  const chunks = chunkArray(renderedAssets, 20)

  for (const chunk of chunks) {
    const batchPromises = chunk.map((asset) => convertRenderedAssetToComponent(asset, sdk, exportConfiguration))
    const batchResults = await Promise.all(batchPromises)
    resultingFiles.push(...batchResults)
  }

  return resultingFiles
}

export async function convertRenderedAssetsToOriginalSVG(
  renderedAssets: Array<RenderedAsset>,
  exportConfiguration: ExporterConfiguration
): Promise<Array<AnyOutputFile>> {
  const renderedSVGs = renderedAssets.map((a) => {
    const destination = exportAssetDestination(a, exportConfiguration.originalSvgFolder)
    return FileHelper.createCopyRemoteFile({
      url: a.sourceUrl,
      relativePath: destination.path,
      fileName: destination.name,
    })
  })

  return renderedSVGs
}

export async function convertRenderedAssetsToIndexFile(
  renderedAssets: Array<RenderedAsset>,
  exportConfiguration: ExporterConfiguration
): Promise<OutputTextFile> {
  // Prepare file paths for index generation
  const filePaths = renderedAssets.map((asset) => {
    const destination = exportReactDefinitionDestination(asset, exportConfiguration.componentFolder)
    return {
      path: destination.path,
      componentName: destination.className
    }
  })
  
  // Generate index content
  const { generateIndexFile } = await import("./svg")
  const { applyCustomIndexTemplate } = await import("./templates")
  const indexContent = generateIndexFile(filePaths)
  
  // Apply custom template if configured
  const customizedContent = applyCustomIndexTemplate(indexContent, filePaths)
  
  // Add disclaimer if enabled
  let finalContent = customizedContent
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    finalContent = GeneralHelper.addDisclaimer(exportConfiguration.disclaimer, customizedContent)
  }

  const indexFile = FileHelper.createTextFile({
    content: finalContent,
    relativePath: "./",
    fileName: exportConfiguration.typescript ? "index.ts" : "index.js",
  })

  return indexFile
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    throw new Error("Chunk size should be greater than 0.")
  }

  const result: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize))
  }
  return result
}
