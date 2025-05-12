import { TokenType } from "@supernovaio/sdk-exporters"

export const TAILWIND_TOKEN_PREFIXES: Record<TokenType, string> = {
  Color: "color",
  Typography: "text",
  Dimension: "spacing",
  Size: "size",
  Space: "spacing",
  Opacity: "opacity",
  FontSize: "text",
  LineHeight: "leading",
  LetterSpacing: "tracking",
  ParagraphSpacing: "paragraph",
  BorderWidth: "border",
  BorderRadius: "radius",
  Duration: "duration",
  ZIndex: "z",
  Shadow: "shadow",
  Border: "border",
  Gradient: "gradient",
  String: "string",
  ProductCopy: "product-copy",
  FontFamily: "font",
  FontWeight: "font-weight",
  TextCase: "text-case",
  TextDecoration: "text-decoration",
  Visibility: "visibility",
  Blur: "blur"
} 

/**
 * List of token types that can be customized in Tailwind 4
 * These are the token types supported by Tailwind CSS configuration
 * 
 * Unsupported token types that will be filtered out:
 * - Dimension (use size or space instead)
 * - ParagraphSpacing (not directly supported by Tailwind)
 * - Gradient (not a core Tailwind property)
 * - String (not relevant for CSS variables)
 * - ProductCopy (not relevant for CSS variables)
 * - TextCase (use Tailwind text-case utilities instead)
 * - TextDecoration (use Tailwind text-decoration utilities instead)
 * - Visibility (use Tailwind visibility utilities instead)
 */
export const TAILWIND_ALLOWED_CUSTOMIZATION: TokenType[] = [
  TokenType.color,
  TokenType.space,
  TokenType.size,
  TokenType.fontSize,
  TokenType.lineHeight,
  TokenType.letterSpacing,
  TokenType.radius,
  TokenType.borderWidth,
  TokenType.fontFamily,
  TokenType.fontWeight,
  TokenType.shadow,
  TokenType.opacity,
  TokenType.duration,
  TokenType.zIndex,
  TokenType.blur,
  TokenType.typography,
  TokenType.border,
  TokenType.dimension
] 


export const DEFAULT_CONFIG_FILE_NAMES: Record<TokenType, string> = {
  Color: "tailwind.color.css",
  Typography: "tailwind.typography.css",
  Dimension: "tailwind.dimension.css",
  Size: "tailwind.size.css",
  Space: "tailwind.space.css",
  Opacity: "tailwind.opacity.css",
  FontSize: "tailwind.font-size.css",
  LineHeight: "tailwind.line-height.css",
  LetterSpacing: "tailwind.letter-spacing.css",
  ParagraphSpacing: "tailwind.paragraph-spacing.css",
  BorderWidth: "tailwind.border-width.css",
  BorderRadius: "tailwind.border-radius.css",
  Duration: "tailwind.duration.css",
  ZIndex: "tailwind.z-index.css",
  Shadow: "tailwind.shadow.css",
  Border: "tailwind.border.css",
  Gradient: "tailwind.gradient.css",
  String: "tailwind.string.css",
  ProductCopy: "tailwind.product-copy.css",
  FontFamily: "tailwind.font-family.css",
  FontWeight: "tailwind.font-weight.css",
  TextCase: "tailwind.text-case.css",
  TextDecoration: "tailwind.text-decoration.css",
  Visibility: "tailwind.visibility.css",
  Blur: "tailwind.blur.css"
}