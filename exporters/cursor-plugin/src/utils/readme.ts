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

export function createReadmeFile(
  metadata: ResolvedPluginMetadata,
  contextMetadata: ProjectContextMetadata,
  skills: Array<ExportedSkillSummary>,
  includeMcpServer: boolean
): OutputTextFile {
  const links = [
    linkLine("Homepage", metadata.homepage ?? metadata.authorUrl),
    linkLine("Repository", metadata.repositoryUrl),
    "- Supernova: https://supernova.io",
    "- Cursor plugins: https://cursor.com/docs/plugins"
  ].filter((line): line is string => line !== null)

  const content = [
    `# ${metadata.name}`,
    "",
    metadata.description,
    "",
    "## What's inside",
    "",
    "- Cursor plugin manifest in `.cursor-plugin/plugin.json`.",
    includeMcpServer
      ? `- Context-scoped Supernova MCP configuration in \`mcp.json\` (${contextMcpUrl(contextMetadata)}).`
      : "- No MCP configuration was generated for this export.",
    "- Supernova context skills in `skills/`.",
    "- Bundled guidance for using Supernova MCP and, when enabled for the context, capturing feedback.",
    "",
    "Design tokens, documentation pages, components, and assets are not committed to this repository. They are returned live by the Supernova MCP for the selected context.",
    "",
    "## Requirements",
    "",
    "- Cursor with plugin support.",
    "- A Supernova account with access to the exported context.",
    "- First MCP use may ask you to sign in through Supernova OAuth.",
    "",
    "## Install",
    "",
    "From a marketplace, install this plugin through Cursor's marketplace panel.",
    "",
    "For local development, copy or symlink this directory to Cursor's local plugin folder:",
    "",
    "```bash",
    `ln -s <path-to-this-plugin> ~/.cursor/plugins/local/${metadata.name}`,
    "```",
    "",
    "Restart Cursor or run `Developer: Reload Window`, then verify the plugin's skills and MCP server are available in Cursor settings.",
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
