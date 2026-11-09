import type { OutputTextFile } from "@supernovaio/sdk-exporters"
import type { ProjectContextMetadata } from "./context-api"
import { textFile } from "./output"
import { contextMcpUrl, type ResolvedPluginMetadata } from "./plugin-files"
import type { ExportedSkillSummary } from "./skill-utils"

function linkLine(label: string, value: string | undefined): string | null {
  return value ? `- ${label}: ${value}` : null
}

function skillLines(skills: Array<ExportedSkillSummary>): Array<string> {
  if (skills.length === 0) {
    return ["No skills were exported."]
  }

  return skills.map((skill) => {
    const description = skill.description ? ` - ${skill.description}` : ""
    return `- \`${skill.name}\`${description}`
  })
}

function installSection(metadata: ResolvedPluginMetadata, includeMarketplaceManifest: boolean): Array<string> {
  if (includeMarketplaceManifest) {
    const marketplaceRepositoryUrl = metadata.repositoryUrl ?? "<repository-url>"

    return [
      "From a Git repository with `.agents/plugins/marketplace.json`:",
      "",
      "```text",
      `codex plugin marketplace add ${marketplaceRepositoryUrl}`,
      "```",
      "",
      "Restart Codex, then open the plugin directory and install this plugin from the marketplace.",
      "",
      "For repo-local development, keep `.agents/plugins/marketplace.json` in the repository root and restart Codex so the plugin appears in the directory.",
      "",
      "See https://developers.openai.com/codex/plugins/build for details."
    ]
  }

  return [
    "Add this plugin to a Codex marketplace manually:",
    "",
    "1. Copy the exported plugin to your marketplace plugin directory.",
    "2. Add an entry to `~/.agents/plugins/marketplace.json` or `$REPO_ROOT/.agents/plugins/marketplace.json`.",
    "3. Point `source.path` at this plugin folder with a `./`-prefixed relative path.",
    "4. Restart Codex.",
    "",
    "See https://developers.openai.com/codex/plugins/build for details."
  ]
}

export function createReadmeFile(
  metadata: ResolvedPluginMetadata,
  contextMetadata: ProjectContextMetadata,
  skills: Array<ExportedSkillSummary>,
  includeMcpServer: boolean,
  includeMarketplaceManifest: boolean
): OutputTextFile {
  const links = [
    linkLine("Homepage", metadata.homepage),
    linkLine("Repository", metadata.repositoryUrl),
    "- Codex plugins: https://developers.openai.com/codex/plugins/build",
    "- Supernova: https://supernova.io"
  ].filter((line): line is string => line !== null)

  const content = [
    `# ${metadata.displayName}`,
    "",
    metadata.description,
    "",
    "## What's inside",
    "",
    "- Codex plugin manifest in `.codex-plugin/plugin.json`.",
    ...(includeMarketplaceManifest ? ["- Codex marketplace manifest in `.agents/plugins/marketplace.json`."] : []),
    includeMcpServer
      ? `- Context-scoped Supernova MCP configuration in \`.mcp.json\` (${contextMcpUrl(contextMetadata)}).`
      : "- No MCP configuration was generated for this export.",
    "- Supernova context skills in `skills/`.",
    "- Bundled guidance for using Supernova MCP and, when enabled for the context, capturing feedback.",
    "",
    "Design tokens, documentation pages, components, and assets are not committed to this repository. They are returned live by the Supernova MCP for the selected context.",
    "",
    "## Requirements",
    "",
    "- Codex with plugin support.",
    "- A Supernova account with access to the exported context.",
    "- First MCP use may ask you to sign in through Supernova OAuth.",
    "",
    "## Install",
    "",
    ...installSection(metadata, includeMarketplaceManifest),
    "",
    "## Skills shipped",
    "",
    ...skillLines(skills),
    "",
    "## Links",
    "",
    ...links,
    ""
  ].join("\n")

  return textFile("", "README.md", content)
}
