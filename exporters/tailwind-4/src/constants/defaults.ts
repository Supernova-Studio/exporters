import { TokenType } from "@supernovaio/sdk-exporters"

export const DEFAULT_TOKEN_PREFIXES: Record<TokenType, string> = {
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
  ProductCopy: "productCopy",
  FontFamily: "font",
  FontWeight: "font-weight",
  TextCase: "textCase",
  TextDecoration: "textDecoration",
  Visibility: "visibility",
  Blur: "blur"
} 