import { OutputTextFile, Supernova, PulsarContext, RemoteVersionIdentifier } from "@supernova-studio/pulsar-next"
import { AllTokenTypes } from "./helpers/constants"
import { indexOutputFile } from "./files/index-file"
import { styleOutputFile } from "./files/style-file"

Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<OutputTextFile>> => {
  // Fetch data from design system that is currently being exported (context)
  const remoteVersionIdentifier: RemoteVersionIdentifier = {
    designSystemId: context.dsId,
    versionId: context.versionId,
  }

  // Fetch the necessary data
  const tokens = await sdk.tokens.getTokens(remoteVersionIdentifier)
  const tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier)

  // Generate output files
  // - one file per token type
  // - one file that imports all other files
  return [...AllTokenTypes.map((type) => styleOutputFile(type, tokens, tokenGroups)), indexOutputFile(tokens)]
})
