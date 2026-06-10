import {
  OutputFileType,
  type AnyOutputFile,
  type OutputCopyRemoteURLFile,
  type OutputTextFile
} from "@supernovaio/sdk-exporters"
import { exportTargets, type ExportTarget, type ExporterConfiguration } from "../../config"

type SkillFile = {
  url?: string
  downloadUrl?: string
  sourceUrl?: string
  name?: string
  fileName?: string
  path?: string
}

export type ExportableSkill = {
  id: string
  path: string
  content?: string
  file?: SkillFile | null
}

const TARGET_PATHS: Record<ExportTarget, Array<string>> = {
  cursor: [".cursor/skills", ".agents/skills"],
  claude: [".claude/skills"],
  codex: [".codex/skills", ".agents/skills"],
  githubCopilot: [".github/skills", ".agents/skills"]
}

function sanitizePathSegment(segment: string): string {
  return segment.trim().replace(/[<>:"\\|?*\x00-\x1F]/g, "-")
}

function pathSegments(path: string): Array<string> {
  return path.split("/").map(sanitizePathSegment).filter(Boolean)
}

function fileNameFromPath(path: string | undefined): string | null {
  const lastSegment = pathSegments(path ?? "").pop()
  return lastSegment && /\.[a-z0-9]+$/i.test(lastSegment) ? lastSegment : null
}

function skillFileUrl(skill: ExportableSkill): string | null {
  return skill.file?.url ?? skill.file?.downloadUrl ?? skill.file?.sourceUrl ?? null
}

function skillDestination(skill: ExportableSkill): { relativePath: string; fileName: string } {
  const segments = pathSegments(skill.path)
  const pathFileName = fileNameFromPath(skill.path)
  const fileName =
    skill.file?.fileName ?? skill.file?.name ?? fileNameFromPath(skill.file?.path) ?? pathFileName ?? "SKILL.md"
  const directorySegments = pathFileName ? segments.slice(0, -1) : segments

  return {
    relativePath: directorySegments.length > 0 ? directorySegments.join("/") : sanitizePathSegment(skill.id),
    fileName: sanitizePathSegment(fileName)
  }
}

export function normalizeSkill(skill: unknown): ExportableSkill | null {
  if (!skill || typeof skill !== "object") {
    return null
  }

  const value = skill as Record<string, unknown>
  const id = typeof value.id === "string" ? value.id : null
  const path = typeof value.path === "string" ? value.path : null

  if (!id || !path) {
    return null
  }

  return {
    id,
    path,
    content: typeof value.content === "string" ? value.content : undefined,
    file: (value.file as SkillFile | null | undefined) ?? null
  }
}

export function writeSkills(
  skills: Array<ExportableSkill>,
  exportConfiguration: ExporterConfiguration
): Array<AnyOutputFile> {
  const targetPaths = [...new Set(exportTargets(exportConfiguration).flatMap((target) => TARGET_PATHS[target]))]
  const outputFiles = new Map<string, AnyOutputFile>()

  for (const skill of skills) {
    const { relativePath, fileName } = skillDestination(skill)
    const content = skill.content?.trim()
    const url = skillFileUrl(skill)

    if (!content && !url) {
      console.warn(`[Agentic Skills exporter] Skipping skill ${skill.path || skill.id}: no content or file URL.`)
      continue
    }

    for (const targetPath of targetPaths) {
      const outputPath = `${targetPath}/${relativePath}`
      const outputKey = `${outputPath}/${fileName}`

      const outputFile: OutputTextFile | OutputCopyRemoteURLFile = content
        ? {
            type: OutputFileType.text,
            path: outputPath,
            name: fileName,
            content
          }
        : {
            type: OutputFileType.copyRemoteUrl,
            path: outputPath,
            name: fileName,
            url: url!
          }

      outputFiles.set(outputKey, outputFile)
    }
  }

  return [...outputFiles.values()]
}
