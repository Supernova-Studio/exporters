import {
  NamingHelper,
  CSSHelper,
  StringCase,
} from "@supernovaio/export-helpers";
import { Token, TokenGroup } from "@supernovaio/sdk-exporters";
import { exportConfiguration } from "..";

export function convertedStyleToken(
  token: Token,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>
): string {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenStyleVariableName(token, tokenGroups);

  // Then creating the value of the token, using another helper function
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    tokenToVariableRef: (t) => {
      return `var(--${tokenStyleVariableName(t, tokenGroups)})`;
    },
  });
  const indentString = " ".repeat(exportConfiguration.indent);

  if (exportConfiguration.showDescriptions && token.description) {
    // Generate token with comments
    return `${indentString}/* ${token.description.trim()} */\n${indentString}--${name}: ${value};`;
  } else {
    // Generate tokens without comments
    return `${indentString}--${name}: ${value};`;
  }
}

export function convertedTypeScriptToken(
  token: Token,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>
): string {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenTypeScriptVariableName(token, tokenGroups);

  // Then creating the value of the token, using another helper function
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: exportConfiguration.useReferences,
    decimals: exportConfiguration.colorPrecision,
    colorFormat: exportConfiguration.colorFormat,
    tokenToVariableRef: (t) => {
      return `var(--${tokenStyleVariableName(t, tokenGroups)})`;
    },
  });

  return `const ${name} = "${value}";`;
}

function tokenStyleVariableName(
  token: Token,
  tokenGroups: Array<TokenGroup>
): string {
  const prefix = exportConfiguration.tokenPrefixes[token.tokenType];
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!;
  return NamingHelper.codeSafeVariableNameForToken(
    token,
    exportConfiguration.tokenNameStyle,
    parent,
    prefix
  );
}

export function tokenTypeScriptVariableName(
  token: Token,
  tokenGroups: Array<TokenGroup>
): string {
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!;
  return NamingHelper.codeSafeVariableNameForToken(
    token,
    "camelCase" as StringCase,
    parent,
    null
  );
}
