import { TokenType } from "@supernovaio/sdk-exporters"

export class FileNameHelper {
  /**
   * Ensures a filename has the correct extension
   */
  static ensureFileExtension(fileName: string, extension: string): string {
    if (!fileName.toLowerCase().endsWith(extension)) {
      return fileName + extension
    }
    return fileName
  }

  /**
   * Replaces file extension
   */
  static replaceFileExtension(fileName: string, oldExt: string, newExt: string): string {
    return fileName.replace(new RegExp(`${oldExt}$`), newExt)
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
    
    return baseNames[type] + extension
  }
} 