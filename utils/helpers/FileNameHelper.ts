import { TokenType } from "@supernovaio/sdk-exporters"

export class FileNameHelper {
  /**
   * Ensures a filename has the correct extension
   */
  static ensureFileExtension(fileName: string, extension: string): string {
    // Ensure extension starts with a dot
    const normalizedExtension = extension.startsWith('.') ? extension : `.${extension}`
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
    const normalizedOldExt = oldExt.startsWith('.') ? oldExt : `.${oldExt}`
    const normalizedNewExt = newExt.startsWith('.') ? newExt : `.${newExt}`
    return fileName.replace(new RegExp(`${normalizedOldExt}$`), normalizedNewExt)
  }

  /**
   * Gets the default style file name for a token type
   */
  static getDefaultStyleFileName(type: TokenType, extension: string = '.css'): string {
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
    
    // Ensure extension starts with a dot
    const normalizedExtension = extension.startsWith('.') ? extension : `.${extension}`
    return baseNames[type] + normalizedExtension
  }
} 