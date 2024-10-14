import { Supernova, PulsarContext, RemoteVersionIdentifier, AnyOutputFile, TokenType, TokenTheme } from "@supernovaio/sdk-exporters"
import { ExporterConfiguration } from "../config"
import { indexOutputFile } from "./files/index-file"
import { styleOutputFile } from "./files/style-file"

/** Exporter configuration. Adheres to the `ExporterConfiguration` interface and its content comes from the resolved default configuration + user overrides of various configuration keys */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>()

/**
 * Export entrypoint.
 * When running `export` through extensions or pipelines, this function will be called.
 * Context contains information about the design system and version that is currently being exported.
 */
Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Fetch data from design system that is currently being exported (context)
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  // Fetch the necessary data
  let tokens = await sdk.tokens.getTokens(remoteVersionIdentifier)
  let tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier)

  // Filter by brand, if specified
  if (context.brandId) {
    const brands = await sdk.brands.getBrands(remoteVersionIdentifier)
    const brand = brands.find((brand) => brand.id === context.brandId || brand.idInVersion === context.brandId)
    if (!brand) {
      throw new Error(`Unable to find brand ${context.brandId}.`)
    }

    tokens = tokens.filter((token) => token.brandId === brand.id)
    tokenGroups = tokenGroups.filter((tokenGroup) => tokenGroup.brandId === brand.id)
  }

  // Apply themes, if specified
  if (context.themeIds && context.themeIds.length > 0) {
    const themes = await sdk.tokens.getTokenThemes(remoteVersionIdentifier)

    const themesToApply = context.themeIds.map((themeId) => {
      const theme = themes.find((theme) => theme.id === themeId || theme.idInVersion === themeId)
      if (!theme) {
        throw new Error(`Unable to find theme ${themeId}.`)
      }
      return theme
    })
    
    tokens = sdk.tokens.computeTokensByApplyingThemes(tokens, tokens, themesToApply)
  }

  // Generate output files
  return [
    // One file per token type
    ...(Object.values(TokenType)
      .map((type) => styleOutputFile(type, tokens, tokenGroups))
      .filter((f) => f !== null) as Array<AnyOutputFile>),
    // One file that imports all other files, if enabled
    indexOutputFile(tokens),
  ]
})
