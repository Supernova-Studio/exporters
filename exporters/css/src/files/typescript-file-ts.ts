import { FileHelper } from "@supernovaio/export-helpers";
import {
  OutputTextFile,
  Token,
  TokenGroup,
  TokenType,
} from "@supernovaio/sdk-exporters";
import { exportConfiguration } from "..";
import {
  convertedTypeScriptToken,
  tokenTypeScriptVariableName,
} from "../content/token";
import { capitalizeFirstLetter } from "../content/utils";

export function typescriptOutputFile(
  type: TokenType,
  tokens: Array<Token>,
  tokenGroups: Array<TokenGroup>,
  theme: string
): OutputTextFile | null {
  // Filter tokens by top level type
  const tokensOfType = tokens.filter((token) => token.tokenType === type);

  // Filter out files where there are no tokens, if enabled
  if (!exportConfiguration.generateEmptyFiles && tokensOfType.length === 0) {
    return null;
  }

  // Convert all tokens to CSS variables
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]));
  const tsVariablesAndValues = tokensOfType
    .map((token) => convertedTypeScriptToken(token, mappedTokens, tokenGroups))
    .join("\n");
  const tsVariables = tokensOfType
    .map((token) => `    ${tokenTypeScriptVariableName(token, tokenGroups)}`)
    .join(",\n");

  // Create file content
  let content = `${tsVariablesAndValues}\n\nexport const ${capitalizeFirstLetter(
    exportConfiguration.typeScriptFileNames[type]
  )} = {\n${tsVariables},\n}`;
  if (exportConfiguration.showGeneratedFileDisclaimer) {
    // Add disclaimer to every file if enabled
    content = `/* ${exportConfiguration.disclaimer} */\n${content}`;
  }

  // Retrieve content as file which content will be directly written to the output
  return FileHelper.createTextFile({
    relativePath: exportConfiguration.baseTypeScriptFilePath,
    fileName: `${exportConfiguration.typeScriptFileNames[type]}.ts`,
    content: content,
  });
}
