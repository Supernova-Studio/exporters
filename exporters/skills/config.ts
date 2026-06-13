/**
 * Main configuration of the exporter.
 * Default values are defined in config.json and can be overridden in pipelines.
 */
export type ExporterConfiguration = {
  /** Export skills to the shared .agents/skills discovery folder. */
  exportToAgentsFolder: boolean
  /** Export skills to Claude Code's .claude/skills discovery folder. */
  exportToClaudeFolder: boolean
  /** Export skill folders directly into the selected pipeline destination. */
  exportToPipelineRoot: boolean
  /** Preserve Supernova folder hierarchy in generated skill paths. */
  preserveFolderHierarchy: boolean
  /** Add Supernova provenance to SKILL.md frontmatter metadata. */
  addSupernovaMetadata: boolean
  /** Add raw SDK response files to the generated output for troubleshooting. */
  generateDebugFiles: boolean
}
