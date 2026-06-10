import { OutputFileType, type OutputTextFile } from "@supernovaio/sdk-exporters"
import { exportTargets, type ExportTarget, type ExporterConfiguration } from "../../config"

export type ExportableSkill = {
  id: string
  path: string
  content: string
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

function skillDestination(skill: ExportableSkill): { relativePath: string; fileName: string } {
  const segments = pathSegments(skill.path)
  const pathFileName = fileNameFromPath(skill.path)
  const fileName = pathFileName ?? "SKILL.md"
  const directorySegments = pathFileName ? segments.slice(0, -1) : segments

  return {
    relativePath: directorySegments.length > 0 ? directorySegments.join("/") : sanitizePathSegment(skill.id),
    fileName: sanitizePathSegment(fileName)
  }
}

export function writeSkills(
  skills: Array<ExportableSkill>,
  exportConfiguration: ExporterConfiguration
): Array<OutputTextFile> {
  const targetPaths = [...new Set(exportTargets(exportConfiguration).flatMap((target) => TARGET_PATHS[target]))]
  const outputFiles = new Map<string, OutputTextFile>()

  for (const skill of skills) {
    if (!skill.content?.trim()) {
      console.warn(`[Agentic Skills exporter] Skipping skill ${skill.path || skill.id}: no content.`)
      continue
    }

    const { relativePath, fileName } = skillDestination(skill)

    for (const targetPath of targetPaths) {
      const outputFile: OutputTextFile = {
        type: OutputFileType.text,
        path: `${targetPath}/${relativePath}`,
        name: fileName,
        content: skill.content
      }

      outputFiles.set(`${outputFile.path}/${outputFile.name}`, outputFile)
    }
  }

  return [...outputFiles.values()]
}
