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
      "From a marketplace, add the repository and install the plugin:",
      "",
      "```text",
      `/plugin marketplace add ${marketplaceRepositoryUrl}`,
      `/plugin install ${metadata.name}`,
      "```",
      "",
      "For local development, load this directory as a local Claude Code plugin:",
      "",
      "```text",
      `claude --plugin-dir .`,
      "```"
    ]
  }

  return ["Load this directory as a local Claude Code plugin:", "", "```text", `claude --plugin-dir .`, "```"]
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
    "- Supernova: https://supernova.io"
  ].filter((line): line is string => line !== null)

  const content = [
    `# ${metadata.name}`,
    "",
    metadata.description,
    "",
    "## What's inside",
    "",
    "- Claude Code plugin manifest in `.claude-plugin/plugin.json`.",
    ...(includeMarketplaceManifest ? ["- Claude Code marketplace manifest in `.claude-plugin/marketplace.json`."] : []),
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
    "- Claude Code with plugin support.",
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
