export type ExportTarget = "cursor" | "claude" | "codex" | "githubCopilot"
export type OutputLayout = "standard" | "bare"

/**
 * Main configuration of the exporter.
 * Default values are defined in config.json and can be overridden in pipelines.
 */
export type ExporterConfiguration = {
  /** Export skills to Cursor's discovery location. */
  exportForCursor: boolean
  /** Export skills to Claude Code's discovery location. */
  exportForClaude: boolean
  /** Export skills to OpenAI Codex's discovery location. */
  exportForCodex: boolean
  /** Export skills to GitHub Copilot's discovery location. */
  exportForGitHubCopilot: boolean
  /** Choose whether target folders are generated or omitted. */
  outputLayout: OutputLayout
  /** Preserve Supernova folder hierarchy in generated skill paths. */
  preserveFolderHierarchy: boolean
  /** Add Supernova provenance to SKILL.md frontmatter metadata. */
  addSupernovaMetadata: boolean
  /** Add raw SDK response files to the generated output for troubleshooting. */
  generateDebugFiles: boolean
}

export function exportTargets(configuration: ExporterConfiguration): Array<ExportTarget> {
  const targets: Array<ExportTarget> = []

  if (configuration.exportForCursor) {
    targets.push("cursor")
  }

  if (configuration.exportForClaude) {
    targets.push("claude")
  }

  if (configuration.exportForCodex) {
    targets.push("codex")
  }

  if (configuration.exportForGitHubCopilot) {
    targets.push("githubCopilot")
  }

  return targets
}
