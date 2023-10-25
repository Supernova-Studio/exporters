import { FileHelper } from "@supernovaio/export-helpers"
import { ALL_TOKEN_TYPES, OutputTextFile, Token } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."

export function indexOutputFile(tokens: Array<Token>): OutputTextFile {
  // Generate import statement for every token type there is
  // Filter out files where there are no tokens, if enabled
  let content = ALL_TOKEN_TYPES.map((type) => {
    const importStatement = `@import "./${exportConfiguration.styleFileNames[type]}";`
    if (exportConfiguration.generateEmptyFiles) {
      return importStatement
    } else {
      const tokensOfType = tokens.filter((token) => token.tokenType === type)
      return tokensOfType.length > 0 ? importStatement : null
    }
  })
    .filter((c) => c !== null)
    .join("\n")

  if (exportConfiguration.showGeneratedFileDisclaimer) {
    // Add disclaimer to index file if enabled
    content = `/* ${exportConfiguration.disclaimer} */\n${content}`
  }
  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseIndexFilePath,
    fileName: exportConfiguration.indexFileName,
    content: content,
  })
}
