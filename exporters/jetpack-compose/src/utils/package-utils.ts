import { NamingHelper, StringCase, ThemeHelper } from "@supernovaio/export-utils"
import { exportConfiguration } from "../index"
import { TokenTheme } from "@supernovaio/sdk-exporters"

/**
 * Generates the package name based on the provided theme or a fallback configuration.
 *
 * @param theme - The theme object used to determine the package name. If undefined, a default configuration is used.
 * @return {string} The generated package name composed of a prefix and identifier.
 */
export function getPackageName(theme: TokenTheme | undefined): string {
  // Every theme is located in a folder with the same name;
  // However, the non-themed path can be nested and contain several segments
  const packageNameSuffix = theme
    ? ThemeHelper.getThemeIdentifier(theme, StringCase.camelCase)
    : NamingHelper.codeSafeVariableName(exportConfiguration.nonThemedFilePath, StringCase.dotCase)

  return [exportConfiguration.packageNamePrefix, packageNameSuffix].filter(Boolean).join(".")
}
