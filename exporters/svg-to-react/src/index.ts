import { FileHelper } from "@supernova-studio/export-helpers"
import {
  Supernova,
  PulsarContext,
  RemoteVersionIdentifier,
  AnyOutputFile,
  AssetFormat,
  AssetScale,
  RenderedAsset,
} from "@supernova-studio/pulsar-next"
import { ExporterConfiguration } from "../config"

/**
 * Export entrypoint.
 * When running `export` through extensions or pipelines, this function will be called.
 * Context contains information about the design system and version that is currently being exported.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  console.log("X")
  // Fetch data from design system that is currently being exported (context)
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }
  console.log(remoteVersionIdentifier)

  // Fetch the necessary data
  let assets = await sdk.assets.getAssets(remoteVersionIdentifier)

  console.log("Z")

  let assetGroups = await sdk.assets.getAssetGroups(remoteVersionIdentifier)

  console.log("F")

  // Render assets
  let renderedAssets = await sdk.assets.getRenderedAssets(remoteVersionIdentifier, assets, assetGroups, AssetFormat.svg, AssetScale.x1)

  // Generate output files
  return renderedAssets.map((a) => {
    const destination = exportDestination(a)
    return FileHelper.createCopyRemoteFile({
      url: a.sourceUrl,
      relativePath: destination.path,
      fileName: destination.name,
    })
  })
})

function exportDestination(asset: RenderedAsset): {
  name: string
  path: string
} {
  const extension = asset.format.toString()
  const duplicates = asset.previouslyDuplicatedNames > 0 ? "-" + asset.previouslyDuplicatedNames : ""
  const name = asset.originalName.toLowerCase().replaceAll(" ", "-")

  // Create full path
  const path = [...asset.group.path]
  path.push(asset.group.name)
  const resultingPath = path.join("/").replaceAll(" ", "-").toLowerCase()

  if (path.length > 0) {
    return {
      name: `${name}${duplicates}.${extension}`,
      path: resultingPath,
    }
  } else {
    return {
      name: `${name}${duplicates}.${extension}`,
      path: "./",
    }
  }
}

/** Exporter configuration. Adheres to the `ExporterConfiguration` interface and its content comes from the resolved default configuration + user overrides of various configuration keys */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()
