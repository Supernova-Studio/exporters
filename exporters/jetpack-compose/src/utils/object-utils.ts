import { TokenType } from "@supernovaio/sdk-exporters"
import { getTokenTypeFileName } from "./file-utils"

/**
 * Returns the sanitized object name.
 * It is the same as the file name but without the extension.
 * @param fileName
 */
export function getObjectNameFromFileName(fileName: string) {
  return fileName.endsWith(".kt") ? fileName.slice(0, -3) : fileName
}

/**
 * Returns the object name for a specific token type.
 * @param tokenType
 */
export function getObjectNameFromTokenType(tokenType: TokenType) {
  return getObjectNameFromFileName(getTokenTypeFileName(tokenType))
}