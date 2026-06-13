export type ExportTarget = "cursor" | "claude" | "codex" | "githubCopilot"
export type OutputLayout = "standard" | "bare"

/**
 * Main configuration of the exporter.
 * Default values are defined in config.json and can be overridden in pipelines.
 */
export type ExporterConfiguration = {
  /** Generate Cursor-compatible skills. */
  exportForCursor: boolean
  /** Generate Claude Code / Claude Desktop-compatible skills. */
  exportForClaude: boolean
  /** Generate OpenAI Codex-compatible skills. */
  exportForCodex: boolean
  /** Generate GitHub Copilot-compatible skills. */
  exportForGitHubCopilot: boolean
  /** Choose whether target folders are generated or omitted. */
  outputLayout: OutputLayout
  /** Preserve Supernova folder hierarchy in generated skill paths. */
  preserveFolderHierarchy: boolean
  /** Add Supernova provenance to SKILL.md frontmatter metadata. */
  addSupernovaMetadata: boolean
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
