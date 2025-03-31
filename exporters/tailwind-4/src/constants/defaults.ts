import { TokenType } from "@supernovaio/sdk-exporters"

export const TAILWIND_TOKEN_PREFIXES: Record<TokenType, string> = {
  Color: "color",
  Typography: "text",
  Dimension: "size",
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
 */
export const TAILWIND_ALLOWED_CUSTOMIZATION: TokenType[] = [
  TokenType.color,
  TokenType.space,
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
  TokenType.blur
] 