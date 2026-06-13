import { OutputFileType, type AnyOutputFile, type OutputTextFile } from "@supernovaio/sdk-exporters"
import type { ExporterConfiguration } from "../../config"
import { DEFAULT_SUPERNOVA_GENERATED_BY, addSupernovaMetadata, upsertSkillName } from "./frontmatter"

const SKILL_FILE_NAME = "SKILL.md"

export type ExportableSkill = {
  id: string
  path: string
  content: string
  updatedAt: string
}

function sanitizePathSegment(segment: string): string {
  return segment.trim().replace(/[<>:"\\|?*\x00-\x1F]/g, "-")
}

function pathSegments(path: string): Array<string> {
  return path.split("/").map(sanitizePathSegment).filter(Boolean)
}

function skillPathSegments(skill: ExportableSkill, preserveFolderHierarchy: boolean): Array<string> {
  const segments = pathSegments(skill.path)
  const fallbackName = sanitizePathSegment(skill.id)

  if (segments.length === 0) {
    return [fallbackName]
  }

  return preserveFolderHierarchy ? segments : [segments[segments.length - 1]]
}

function suffixLastSegment(segments: Array<string>, index: number): Array<string> {
  const suffix = index === 1 ? "" : `-${index}`
  const lastSegment = segments[segments.length - 1]

  return [...segments.slice(0, -1), `${lastSegment}${suffix}`]
}

function relativePath(segments: Array<string>): string {
  return segments.join("/")
}

function lastSegment(segments: Array<string>): string {
  return segments[segments.length - 1]
}

function targetPaths(exportConfiguration: ExporterConfiguration): Array<string> {
  if (!exportConfiguration.createAgentFolders) {
    return [""]
  }

  const paths: Array<string> = []

  if (exportConfiguration.exportToAgentsFolder) {
    paths.push(".agents/skills")
  }

  if (exportConfiguration.exportToClaudeFolder) {
    paths.push(".claude/skills")
  }

  return [...new Set(paths)]
}

function skillContent(skill: ExportableSkill, skillName: string, exportConfiguration: ExporterConfiguration): string {
  const content =
    skillName === lastSegment(pathSegments(skill.path)) ? skill.content : upsertSkillName(skill.content, skillName)

  if (!exportConfiguration.includeSupernovaMetadata) {
    return content
  }

  const metadata = {
    updatedAt: exportConfiguration.includeSupernovaUpdatedAt ? skill.updatedAt : undefined,
    generatedBy: exportConfiguration.includeSupernovaGeneratedBy ? DEFAULT_SUPERNOVA_GENERATED_BY : undefined,
    disclaimer: exportConfiguration.includeSupernovaDisclaimer ? exportConfiguration.supernovaDisclaimer : undefined
  }

  return metadata.updatedAt || metadata.generatedBy || metadata.disclaimer
    ? addSupernovaMetadata(content, metadata)
    : content
}

function remoteValue(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown> & { toRemote?: () => unknown }
  const remote = typeof record.toRemote === "function" ? record.toRemote() : record

  return remote && typeof remote === "object" ? (remote as Record<string, unknown>) : null
}

function normalizeDateLike(value: unknown): string | null {
  if (typeof value === "string") {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value && typeof value === "object" && typeof (value as { toISOString?: unknown }).toISOString === "function") {
    return (value as { toISOString: () => string }).toISOString()
  }

  return null
}

export function normalizeSkill(skill: unknown): ExportableSkill | null {
  const value = remoteValue(skill)

  if (!value) {
    return null
  }

  const id = typeof value.id === "string" ? value.id : null
  const path = typeof value.path === "string" ? value.path : null
  const content = typeof value.content === "string" ? value.content : null
  const updatedAt = normalizeDateLike(value.updatedAt)

  if (!id || !path || content === null || !updatedAt) {
    return null
  }

  return {
    id,
    path,
    content,
    updatedAt
  }
}

export function writeSkills(
  skills: Array<ExportableSkill>,
  exportConfiguration: ExporterConfiguration
): Array<AnyOutputFile> {
  const paths = targetPaths(exportConfiguration)
  const outputFiles = new Map<string, AnyOutputFile>()
  const destinationCounts = new Map<string, number>()
  const orderedSkills = [...skills].sort((a, b) => a.path.localeCompare(b.path) || a.id.localeCompare(b.id))

  for (const skill of orderedSkills) {
    const baseSegments = skillPathSegments(skill, exportConfiguration.preserveFolderHierarchy)
    const basePath = relativePath(baseSegments)
    const destinationIndex = (destinationCounts.get(basePath) ?? 0) + 1
    const destinationSegments = suffixLastSegment(baseSegments, destinationIndex)
    const destinationPath = relativePath(destinationSegments)
    const skillName = lastSegment(destinationSegments)
    const content = skillContent(skill, skillName, exportConfiguration)

    destinationCounts.set(basePath, destinationIndex)

    for (const targetPath of paths) {
      const outputPath = [targetPath, destinationPath].filter(Boolean).join("/")
      const outputKey = `${outputPath}/${SKILL_FILE_NAME}`

      const outputFile: OutputTextFile = {
        type: OutputFileType.text,
        path: outputPath,
        name: SKILL_FILE_NAME,
        content
      }

      outputFiles.set(outputKey, outputFile)
    }
  }

  return [...outputFiles.values()]
}
