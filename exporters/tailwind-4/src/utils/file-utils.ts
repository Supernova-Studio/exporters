import { FileNameHelper } from '@supernovaio/export-utils';
import { TokenType } from "@supernovaio/sdk-exporters"
import { exportConfiguration } from ".."
import { DEFAULT_STYLE_FILE_NAMES } from "../constants/defaults"

export function getStyleFileName(type: TokenType, extension: string): string {
  const fileName = exportConfiguration.customizeStyleFileNames
    ? exportConfiguration.styleFileNames[type]
    : DEFAULT_STYLE_FILE_NAMES[type]
  
  // Ensure file name ends with the specified extension
  return FileNameHelper.ensureFileExtension(fileName, extension)
} 