import {
  Supernova,
  PulsarContext,
  RemoteVersionIdentifier,
  AnyOutputFile,
  AssetFormat
} from "@supernovaio/sdk-exporters"
import { ExporterConfiguration } from "../config"
import {
  convertRenderedAssetsToComponentsInBatches,
  convertRenderedAssetsToOriginalSVG,
  convertRenderedAssetsToIndexFile
} from "./files"
import { isPathFilteredOut } from "./paths"

/**
 * Export entrypoint.
 * When running `export` through extensions or pipelines, this function will be called.
 * Context contains information about the design system and version that is currently being exported.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Fetch data from design system that is currently being exported (context)
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId
  }

  // Render all assets in the library
  let assets = await sdk.assets.getAssets(remoteVersionIdentifier)
  let assetGroups = await sdk.assets.getAssetGroups(remoteVersionIdentifier)
  let renderedAssets = await sdk.assets.getRenderedAssets(
    remoteVersionIdentifier,
    assets,
    assetGroups,
    AssetFormat.svg,
    exportConfiguration.svgScale
  )

  let resultingFiles: Array<AnyOutputFile> = []

  // Filter out assets that don't belong to the selected platform
  if (exportConfiguration.ignoredAssetPaths.length > 0) {
    renderedAssets = renderedAssets.filter(
      (a) => !isPathFilteredOut(exportConfiguration.ignoredAssetPaths, [...a.group.path, a.group.name])
    )
  }

  // Generate React components
  const components = await convertRenderedAssetsToComponentsInBatches(renderedAssets, sdk, exportConfiguration)
  resultingFiles = [...resultingFiles, ...components]

  // Add SVG definitions to the output if enabled
  if (exportConfiguration.keepOriginalSvgs) {
    const svgs = await convertRenderedAssetsToOriginalSVG(renderedAssets, exportConfiguration)
    resultingFiles = [...resultingFiles, ...svgs]
  }

  // Add index file to the output if enabled
  if (exportConfiguration.generateIndex) {
    const indexFile = await convertRenderedAssetsToIndexFile(renderedAssets, exportConfiguration)
    resultingFiles.push(indexFile)
  }

  return resultingFiles
})

/** Exporter configuration. Adheres to the `ExporterConfiguration` interface and its content comes from the resolved default configuration + user overrides of various configuration keys */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()
