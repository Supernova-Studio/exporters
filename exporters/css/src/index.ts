import { ExportHelper } from "./helpers/ExportHelper"
import { Supernova, TokenType, Pulsar, PulsarContext, AnyOutputFile, OutputTextFile } from "@supernova-studio/pulsar-next"

Pulsar.export(async (sdk: Supernova, context: PulsarContext): Promise<Array<AnyOutputFile>> => {
  // Fetch color tokens
  const tokens = await sdk.tokens.getTokens({
    designSystemId: context.dsId,
    versionId: context.versionId,
  })

  console.log("Something to console")

  // Process files per token type
  return [
    tokenFileFromType(tokens, TokenType.color),
    tokenFileFromType(tokens, TokenType.typography),
    tokenFileFromType(tokens, TokenType.shadow),
    tokenFileFromType(tokens, TokenType.dimension),
    tokenFileFromType(tokens, TokenType.size),
    tokenFileFromType(tokens, TokenType.space),
  ]
})

function tokenFileFromType(tokens: Array<any>, type: TokenType): OutputTextFile {
  // Filter tokens by type
  const typedTokens = tokens.filter((token) => token.tokenType === type)

  // Create variables
  const content = typedTokens
    .map((token) => {
      return `--vars(my-token-${token.name})`
    })
    .join("\n")

  return textFile(content, `${type}.css`)
}

function textFile(content: string, name: string): OutputTextFile {
  return ExportHelper.outputTextFile({
    relativePath: "./styles",
    name: name,
    content: content,
  })
}
