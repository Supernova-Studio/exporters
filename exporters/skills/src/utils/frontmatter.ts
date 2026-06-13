type FrontmatterBlock = {
  frontmatterBody: string
  contentAfter: string
}

type SupernovaMetadata = {
  updatedAt?: string
  generatedBy?: string
  disclaimer?: string
}

const SUPERNOVA_METADATA_KEYS = ["supernova-updated-at", "supernova-generated-by", "supernova-disclaimer"]
const SUPERNOVA_GENERATED_BY = "Supernova.io"

function matchFrontmatterBlock(text: string): FrontmatterBlock | null {
  const withoutBom = text.replace(/^\uFEFF/, "")
  const frontmatterMatch = withoutBom.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)
  const fullMatch = frontmatterMatch?.[0]
  const frontmatterBody = frontmatterMatch?.[1]

  if (frontmatterBody === undefined || fullMatch === undefined) {
    return null
  }

  return {
    frontmatterBody: frontmatterBody.replace(/\r\n/g, "\n"),
    contentAfter: withoutBom.slice(fullMatch.length)
  }
}

function isCommentLine(line: string): boolean {
  return /^\s*#/.test(line)
}

function findNextTopLevelKeyOffset(lines: Array<string>): number {
  return lines.findIndex((line) => !isCommentLine(line) && /^\S[^:]*:/.test(line))
}

function renderFrontmatter(frontmatterBody: string, contentAfter: string): string {
  const body = contentAfter.replace(/^\uFEFF/, "").replace(/^\r?\n+/, "")

  return `---\n${frontmatterBody}\n---${body ? `\n${body}` : ""}`
}

function renderField(fieldName: string, value: string): Array<string> {
  return [`${fieldName}: ${value}`]
}

function upsertTopLevelField(frontmatterBody: string, fieldName: string, value: string): string {
  const lines = frontmatterBody ? frontmatterBody.split("\n") : []
  const rendered = renderField(fieldName, value)
  const keyPattern = new RegExp(`^${fieldName}:`, "i")
  const startIndex = lines.findIndex((line) => keyPattern.test(line))

  if (startIndex === -1) {
    return [...lines, ...rendered].join("\n")
  }

  const followingLines = lines.slice(startIndex + 1)
  const nextKeyOffset = findNextTopLevelKeyOffset(followingLines)
  const endIndex = nextKeyOffset === -1 ? lines.length : startIndex + 1 + nextKeyOffset

  return [...lines.slice(0, startIndex), ...rendered, ...lines.slice(endIndex)].join("\n")
}

function renderMetadataLines(metadata: SupernovaMetadata): Array<string> {
  const lines = ["metadata:"]

  if (metadata.updatedAt) {
    lines.push(...renderMetadataField("supernova-updated-at", metadata.updatedAt))
  }

  if (metadata.generatedBy) {
    lines.push(...renderMetadataField("supernova-generated-by", metadata.generatedBy))
  }

  if (metadata.disclaimer) {
    lines.push(...renderMetadataField("supernova-disclaimer", metadata.disclaimer))
  }

  return lines
}

function renderMetadataField(fieldName: string, value: string): Array<string> {
  if (!value.includes("\n")) {
    return [`  ${fieldName}: ${value}`]
  }

  const indentedLines = value.split("\n").map((line) => (line ? `    ${line}` : line))

  return [`  ${fieldName}: |`, ...indentedLines]
}

function metadataKey(line: string): string | null {
  return line.match(/^\s+([^:#]+):/)?.[1]?.trim() ?? null
}

function upsertMetadata(frontmatterBody: string, metadata: SupernovaMetadata): string {
  const lines = frontmatterBody ? frontmatterBody.split("\n") : []
  const startIndex = lines.findIndex((line) => /^metadata:\s*$/i.test(line))
  const renderedMetadata = renderMetadataLines(metadata)

  if (startIndex === -1) {
    return renderedMetadata.length === 1 ? frontmatterBody : [...lines, ...renderedMetadata].join("\n")
  }

  const followingLines = lines.slice(startIndex + 1)
  const nextKeyOffset = findNextTopLevelKeyOffset(followingLines)
  const endIndex = nextKeyOffset === -1 ? lines.length : startIndex + 1 + nextKeyOffset
  const existingMetadataLines = lines.slice(startIndex + 1, endIndex).filter((line) => {
    const key = metadataKey(line)
    return key ? !SUPERNOVA_METADATA_KEYS.includes(key) : true
  })

  return [
    ...lines.slice(0, startIndex),
    "metadata:",
    ...existingMetadataLines,
    ...renderedMetadata.slice(1),
    ...lines.slice(endIndex)
  ].join("\n")
}

export function upsertSkillName(text: string, name: string): string {
  const block = matchFrontmatterBlock(text)
  const frontmatterBody = upsertTopLevelField(block?.frontmatterBody ?? "", "name", name)

  return renderFrontmatter(frontmatterBody, block?.contentAfter ?? text)
}

export function addSupernovaMetadata(text: string, metadata: SupernovaMetadata): string {
  const block = matchFrontmatterBlock(text)
  const frontmatterBody = upsertMetadata(block?.frontmatterBody ?? "", metadata)

  return renderFrontmatter(frontmatterBody, block?.contentAfter ?? text)
}

export const DEFAULT_SUPERNOVA_GENERATED_BY = SUPERNOVA_GENERATED_BY
