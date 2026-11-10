import { TokenType } from "@supernovaio/sdk-exporters"
import { StringCase } from "../enums/StringCase"
import { NamingHelper } from "./NamingHelper"

export class FileNameHelper {
  /**
   * Ensures a filename has the correct extension
   */
  static ensureFileExtension(fileName: string, extension: string): string {
    // Ensure extension starts with a dot
    const normalizedExtension = extension.startsWith(".") ? extension : `.${extension}`
    if (!fileName.toLowerCase().endsWith(normalizedExtension.toLowerCase())) {
      return fileName + normalizedExtension
    }
    return fileName
  }

  /**
   * Replaces file extension
   */
  static replaceFileExtension(fileName: string, oldExt: string, newExt: string): string {
    // Ensure extensions start with a dot
    const normalizedOldExt = oldExt.startsWith(".") ? oldExt : `.${oldExt}`
    const normalizedNewExt = newExt.startsWith(".") ? newExt : `.${newExt}`
    return fileName.replace(new RegExp(`${normalizedOldExt}$`), normalizedNewExt)
  }

  /**
   * Computes a posix-style relative path between two directory specs.
   *
   * Output module specifiers must use forward slashes regardless of host OS, and
   * the Node `path` module is not always available in bundled exporter runtimes,
   * so this implements the small subset we need without that dependency.
   *
   * Both inputs are interpreted as directory paths. Leading "./" and trailing
   * "/" are stripped before computing.
   *
   * Examples:
   *   posixRelativeDir("darkMode", "base")              -> "../base"
   *   posixRelativeDir("darkMode", "tokens/base")       -> "../tokens/base"
   *   posixRelativeDir("tokens/dark", "tokens/base")    -> "../base"
   *   posixRelativeDir(".", ".")                        -> "."
   */
  static posixRelativeDir(from: string, to: string): string {
    const normalize = (p: string) => p.replace(/^\.\//, "").replace(/\/$/, "") || "."
    const fromSegments = normalize(from).split("/").filter(s => s && s !== ".")
    const toSegments = normalize(to).split("/").filter(s => s && s !== ".")
    let common = 0
    while (
      common < fromSegments.length &&
      common < toSegments.length &&
      fromSegments[common] === toSegments[common]
    ) {
      common++
    }
    const ups = "../".repeat(fromSegments.length - common)
    const tail = toSegments.slice(common).join("/")
    if (!ups && !tail) return "."
    return (ups + tail).replace(/\/$/, "")
  }

  /**
   * Gets the default style file name for a token type
   */
  static getDefaultStyleFileName(
    type: TokenType,
    extension: string = ".css",
    stringCase: StringCase = StringCase.kebabCase
  ): string {
    const baseNames: Record<TokenType, string> = {
      Color: "color",
      Typography: "typography",
      Dimension: "dimension",
      Size: "size",
      Space: "space",
      Opacity: "opacity",
      FontSize: "font-size",
      LineHeight: "line-height",
      LetterSpacing: "letter-spacing",
      ParagraphSpacing: "paragraph-spacing",
      BorderWidth: "border-width",
      BorderRadius: "border-radius",
      Duration: "duration",
      ZIndex: "z-index",
      Shadow: "shadow",
      Border: "border",
      Gradient: "gradient",
      String: "string",
      ProductCopy: "product-copy",
      FontFamily: "font-family",
      FontWeight: "font-weight",
      TextCase: "text-case",
      TextDecoration: "text-decoration",
      Visibility: "visibility",
      Blur: "blur"
    }

    // Ensure the extension starts with a dot
    const normalizedExtension = extension.startsWith(".") ? extension : `.${extension}`
    return NamingHelper.codeSafeVariableName(baseNames[type], stringCase) + normalizedExtension
  }
}
