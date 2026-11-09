/**
 * Main configuration of the exporter.
 * Default values are defined in config.json and can be overridden in pipelines.
 */
export type ExporterConfiguration = {
  /** Create agent discovery folders instead of writing skills directly to the export destination. */
  createAgentFolders: boolean
  /** Export skills to the shared .agents/skills discovery folder. */
  exportToAgentsFolder: boolean
  /** Export skills to Claude Code's .claude/skills discovery folder. */
  exportToClaudeFolder: boolean
  /** Preserve Supernova folder hierarchy in generated skill paths. */
  preserveFolderHierarchy: boolean
  /** Add Supernova metadata to SKILL.md frontmatter. */
  includeSupernovaMetadata: boolean
  /** Add the Supernova skill update timestamp to frontmatter metadata. */
  includeSupernovaUpdatedAt: boolean
  /** Add the Supernova generator name to frontmatter metadata. */
  includeSupernovaGeneratedBy: boolean
  /** Add a generated-file disclaimer to frontmatter metadata. */
  includeSupernovaDisclaimer: boolean
  /** Generated-file disclaimer text written to frontmatter metadata. */
  supernovaDisclaimer: string
}
