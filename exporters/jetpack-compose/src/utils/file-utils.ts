import { FileNameHelper } from "@supernovaio/export-utils"
import { TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_TOKEN_TYPE_FILE_NAMES } from "../constants/defaults"

export function getTokenTypeFileName(type: TokenType): string {
  const fileName = exportConfiguration.customizeSeparatedByTypeFileNames
    ? exportConfiguration.separatedByTypeFileNames[type]
    : DEFAULT_TOKEN_TYPE_FILE_NAMES[type]

  return FileNameHelper.ensureFileExtension(fileName, "kt")
}
