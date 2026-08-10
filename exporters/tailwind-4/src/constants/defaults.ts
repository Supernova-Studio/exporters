import { TokenType } from "@supernovaio/sdk-exporters"

export const TAILWIND_TOKEN_PREFIXES: Record<TokenType, string> = {
  Color: "color",
  Typography: "text",
  Dimension: "spacing",
  Size: "spacing",
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
 * Token types whose pixel values are always converted to rem, regardless of the
 * global `forceRemUnit` setting.
 *
 * These are the namespaces where rem is the correct unit because the value should
 * scale with the user's browser font size (WCAG 1.4.4). Everything not listed here
 * keeps its authored unit, so px passes through untouched - no value is ever
 * converted to rem and then converted back.
 *
 * Deliberately excluded:
 * - radius: rem-scaled corner radii look wrong at large text sizes. This is a
 *   departure from the Tailwind v4 defaults, and an intentional one.
 * - blur, borderWidth, shadow: optical values that should not scale with text.
 *
 * Note that conversion only ever applies to values authored in pixels, so token
 * types measured in ms (duration) or raw numbers (zIndex, opacity) are unaffected
 * even if they are listed.
 */
export const REM_TOKEN_TYPES: ReadonlySet<TokenType> = new Set([
  TokenType.space,
  TokenType.size,
  TokenType.dimension,
  TokenType.fontSize
])

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
