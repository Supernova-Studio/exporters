import { OutputFileType, type OutputCopyRemoteURLFile } from "@supernovaio/sdk-exporters"
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
  file: SkillFile | null
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

function skillFileUrl(skill: ExportableSkill): string {
  const url = skill.file?.url ?? skill.file?.downloadUrl ?? skill.file?.sourceUrl

  if (!url) {
    throw new Error(`Skill ${skill.path || skill.id} does not have a downloadable file URL.`)
  }

  return url
}

function skillDestination(skill: ExportableSkill): { relativePath: string; fileName: string } {
  const segments = pathSegments(skill.path)
  const pathFileName = fileNameFromPath(skill.path)
  const fileName = skill.file?.fileName ?? skill.file?.name ?? fileNameFromPath(skill.file?.path) ?? pathFileName ?? "SKILL.md"
  const directorySegments = pathFileName ? segments.slice(0, -1) : segments

  return {
    relativePath: directorySegments.length > 0 ? directorySegments.join("/") : sanitizePathSegment(skill.id),
    fileName: sanitizePathSegment(fileName)
  }
}

export function writeSkills(
  skills: Array<ExportableSkill>,
  exportConfiguration: ExporterConfiguration
): Array<OutputCopyRemoteURLFile> {
  const targetPaths = [...new Set(exportTargets(exportConfiguration).flatMap((target) => TARGET_PATHS[target]))]
  const outputFiles = new Map<string, OutputCopyRemoteURLFile>()

  for (const skill of skills) {
    const { relativePath, fileName } = skillDestination(skill)
    const url = skillFileUrl(skill)

    for (const targetPath of targetPaths) {
      const outputFile: OutputCopyRemoteURLFile = {
        type: OutputFileType.copyRemoteUrl,
        path: `${targetPath}/${relativePath}`,
        name: fileName,
        url
      }

      outputFiles.set(`${outputFile.path}/${outputFile.name}`, outputFile)
    }
  }

  return [...outputFiles.values()]
}
