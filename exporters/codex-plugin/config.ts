/**
 * Main configuration of the exporter.
 * Default values are defined in config.json and can be overridden in pipelines.
 */
export type ExporterConfiguration = {
  /** Codex plugin identifier. Empty means a slug of the context name is used at export time. */
  pluginName: string
  /** Version written to .codex-plugin/plugin.json. */
  pluginVersion: string
  /** Description written to plugin.json and README.md. Empty means the context description is used when available. */
  pluginDescription: string
  /** Author name written to plugin.json author.name and interface.developerName. */
  pluginAuthorName: string
  /** Optional author email written to plugin.json. */
  pluginAuthorEmail: string
  /** Optional author URL written to plugin.json. */
  pluginAuthorUrl: string
  /** Optional homepage URL written to plugin.json homepage and interface.websiteURL. */
  pluginHomepage: string
  /** Optional repository URL written to plugin.json, marketplace.json, and README.md. */
  pluginRepositoryUrl: string
  /** License identifier written to plugin.json. */
  pluginLicense: string
  /** Keywords written to plugin.json. */
  pluginKeywords: string[]
  /** Human-readable name for interface.displayName. Empty means the context name is used. */
  pluginDisplayName: string
  /** Extended description for interface.longDescription. */
  pluginLongDescription: string
  /** Category for interface.category and marketplace entry category. */
  pluginCategory: string
  /** Hex theme color for interface.brandColor. Empty means omit from output. */
  pluginBrandColor: string
  /** Privacy policy URL for interface.privacyPolicyURL. */
  pluginPrivacyPolicyUrl: string
  /** Terms of service URL for interface.termsOfServiceURL. */
  pluginTermsOfServiceUrl: string
  /** Starter prompts for interface.defaultPrompt. */
  pluginDefaultPrompts: string[]
  /** Marketplace entry policy.installation. */
  marketplaceInstallationPolicy: "AVAILABLE" | "INSTALLED_BY_DEFAULT" | "NOT_AVAILABLE"
  /** Marketplace entry policy.authentication. */
  marketplaceAuthenticationPolicy: "ON_INSTALL" | "ON_USE"
  /** Generate .mcp.json with the Supernova MCP pre-scoped to this context. */
  includeMcpServer: boolean
  /** Generate a using-supernova-mcp skill that explains the MCP tools. */
  includeMcpUsageSkill: boolean
  /** Export Supernova skills selected by the current context. */
  includeContextSkills: boolean
  /** Preserve Supernova folder hierarchy in generated skill paths. */
  preserveFolderHierarchy: boolean
  /** Add Supernova metadata to exported context skill frontmatter. */
  includeSupernovaMetadata: boolean
  /** Add the Supernova skill update timestamp to frontmatter metadata. */
  includeSupernovaUpdatedAt: boolean
  /** Add the Supernova generator name to frontmatter metadata. */
  includeSupernovaGeneratedBy: boolean
  /** Add a generated-file disclaimer to frontmatter metadata. */
  includeSupernovaDisclaimer: boolean
  /** Generated-file disclaimer text written to frontmatter metadata. */
  supernovaDisclaimer: string
  /** Generate the feedback capture skill when context feedback collection is also enabled. */
  includeFeedbackSkill: boolean
  /** Generate a marketplace manifest for single-plugin repository install. */
  includeMarketplaceManifest: boolean
  /** Generate README.md. */
  includeReadme: boolean
}
