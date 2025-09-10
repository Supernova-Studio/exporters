import { OutputTextFile, Token, TokenGroup, TokenType, ColorToken } from "@supernovaio/sdk-exporters"
import { FileHelper, NamingHelper, StringCase, TokenNameTracker } from "@supernovaio/export-utils"

const fileNameTracker = new TokenNameTracker()

function toHexComponent(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)))
  return `0x${clamped.toString(16).toUpperCase().padStart(2, "0")}`
}

function toAlphaString(alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha))
  return a.toFixed(3)
}

export function createCatalogRootFile(rootPath: string): OutputTextFile {
  const content = JSON.stringify({ info: { version: 1, author: "xcode" } }, null, 2)
  return FileHelper.createTextFile({
    relativePath: `./${rootPath}`,
    fileName: "Contents.json",
    content
  })
}

function extractRgbaFromToken(token: Token): { r: number; g: number; b: number; a: number } | null {
  try {
    const c = (token as ColorToken).value
    const r = typeof c.color.r === "number" ? c.color.r : 0
    const g = typeof c.color.g === "number" ? c.color.g : 0
    const b = typeof c.color.b === "number" ? c.color.b : 0
    const a = typeof c.opacity.measure === "number" ? c.opacity.measure : 1
    return { r, g, b, a }
  } catch {
    return null
  }
}

export function createPerTokenFile(
  token: Token,
  tokenGroups: Array<TokenGroup>,
  rootPath: string,
  themedVariants: Array<Token>
): OutputTextFile | null {
  if (token.tokenType !== TokenType.color) {
    return null
  }

  const base = extractRgbaFromToken(token)
  if (!base) {
    return null
  }

  const entries: any[] = []

  entries.push({
    color: {
      "color-space": "srgb",
      components: {
        alpha: toAlphaString(base.a),
        blue: toHexComponent(base.b),
        green: toHexComponent(base.g),
        red: toHexComponent(base.r)
      }
    },
    idiom: "universal"
  })

  for (const themedToken of themedVariants) {
    const tv = extractRgbaFromToken(themedToken)
    if (!tv) continue
    entries.push({
      appearances: [{ appearance: "luminosity", value: "dark" }],
      color: {
        "color-space": "srgb",
        components: {
          alpha: toAlphaString(tv.a),
          blue: toHexComponent(tv.b),
          green: toHexComponent(tv.g),
          red: toHexComponent(tv.r)
        }
      },
      idiom: "universal"
    })
  }

  const baseName = fileNameTracker.getTokenName(token, tokenGroups, StringCase.kebabCase, null, false)
  const fileSafeName = NamingHelper.codeSafeVariableName(baseName, StringCase.kebabCase)
  const content = JSON.stringify(entries, null, 2)
  return FileHelper.createTextFile({
    relativePath: `./${rootPath}/${fileSafeName}.colorset`,
    fileName: "Contents.json",
    content
  })
}

