import type { OutputTextFile } from "@supernovaio/sdk-exporters"
import type { ExporterConfiguration } from "../../config"
import type { ProjectContextMetadata } from "./context-api"
import { textFile } from "./output"
import type { ExportedSkillSummary } from "./skill-utils"

const MCP_USAGE_SKILL_NAME = "using-supernova-mcp"
const FEEDBACK_SKILL_NAME = "capture-feedback"

type BundledSkill = {
  name: string
  description: string
  content: string
}

function usingSupernovaMcpSkillContent(): string {
  return [
    "---",
    "name: using-supernova-mcp",
    "description: Use the Supernova MCP to retrieve context-scoped design system documentation, tokens, components, assets, and feedback tools.",
    "---",
    "",
    "# Using Supernova MCP",
    "",
    "Use this skill whenever you need design-system context from Supernova. The plugin includes a preconfigured `supernova` MCP server scoped to the current Supernova Context.",
    "",
    "Do not expect tokens, documentation pages, components, or assets to be present as files in this plugin. They are served live through MCP tools.",
    "",
    "## Documentation and workspace knowledge",
    "",
    "Start with `search_documentation` for almost every documentation or knowledge question. It searches both documentation pages and workspace knowledge selected by the context.",
    "",
    "Recommended flow:",
    "",
    "1. Call `search_documentation` with the user's terms.",
    "2. Keep `mode` as `hybrid` unless you have a reason to use `full-text` or `vector`.",
    "3. Use `limit` between 5 and 10 for focused answers.",
    "4. If a result has a `pageId`, call `get_documentation_page_content` with that id before making detailed claims.",
    "5. Use `get_documentation_page_list` only when you need to enumerate available pages or the search terms are unclear.",
    "",
    "## Tokens",
    "",
    "- Use `get_token_list` to discover context-scoped tokens. Filter with `tokenTypes` when useful.",
    "- Use `get_token_details` with `tokenIds` for exact resolved token values.",
    "- Use `themes` in `get_token_details` when the user asks for themed values; pass theme UUIDs or code names.",
    "- Use `get_token_theme_list` to discover theme IDs and code names.",
    "",
    "## Components",
    "",
    "- Use `get_design_system_component_list` then `get_design_system_component_detail` for Supernova design-system components.",
    "- Use `get_figma_component_list` then `get_figma_component_detail` for linked Figma components.",
    "- Use `get_code_component_list` then `get_code_component_detail` when implementation/API details are needed.",
    "",
    "## Assets and Storybook",
    "",
    "- Use `get_asset_list` then `get_asset_detail` for context-scoped assets.",
    "- Use `get_storybook_story_list` then `get_storybook_story_detail` for Storybook references.",
    "",
    "## Project and account context",
    "",
    "- Use `get_me` to confirm the authenticated Supernova user when needed.",
    "- Use `get_selected_project_feature_details`, `get_selected_project_document_details`, and `get_project_feature_artifact_details` only when a selected MCP stream is available for project feature/document work.",
    "",
    "## Pagination",
    "",
    "Many list tools return a `nextCursor:` footer. When present, call the same tool again with that `cursor` value to continue.",
    "",
    "## Scope",
    "",
    "The MCP URL is context-scoped. List and search tools should only surface items selected by the Supernova Context. Detail tools may still be able to resolve explicit IDs, so prefer ids found from context-scoped search/list calls.",
    ""
  ].join("\n")
}

function feedbackSkillContent(contextMetadata: ProjectContextMetadata): string {
  return [
    "---",
    "name: capture-feedback",
    "description: Capture useful design-system feedback and submit it through the Supernova MCP collect_agent_feedback tool.",
    "---",
    "",
    "# Capture Feedback",
    "",
    "Use this skill when work with this plugin reveals useful feedback about the Supernova context, MCP results, design-system docs, tokens, components, or generated agent output.",
    "",
    "Capture feedback when one of these signals occurs:",
    "",
    "- `MissingInformation`: the MCP or context did not contain information needed to answer or implement confidently.",
    "- `Incorrect`: retrieved information was wrong, stale, contradictory, or corrected by the user.",
    "- `WrongSource`: the answer relied on a source outside the Supernova context when the context should have covered it.",
    "- `Output`: the agent produced output that exposed a design-system documentation, token, component, or guidance gap.",
    "",
    "Submit feedback by calling the Supernova MCP tool `collect_agent_feedback`.",
    "",
    "Required fields:",
    "",
    "- `message`: short human-readable summary.",
    "- `conversation`: the relevant transcript excerpts available in the current session.",
    "- `sentiment`: `Positive`, `Neutral`, `Negative`, or `Aggressive`.",
    "- `category`: `MissingInformation`, `Incorrect`, `Output`, or `WrongSource`.",
    "- `llm`: object with `provider` and `model`.",
    "",
    "Optional fields:",
    "",
    "- `description`: concise details, reproduction notes, expected source, or suggested fix.",
    "- `metadata`: structured context such as file paths, tool names, token names, page ids, or component ids.",
    "",
    contextMetadata.isFeedbackCollectionAnonymous
      ? "This context is configured for anonymous feedback collection; do not add personal user details to metadata."
      : "This context allows non-anonymous feedback collection; still include only details that help triage the issue.",
    "",
    "If the user asks to stop capturing feedback, skip this skill until they opt back in.",
    ""
  ].join("\n")
}

function bundledSkillFile(skill: BundledSkill): OutputTextFile {
  return textFile(`skills/${skill.name}`, "SKILL.md", skill.content)
}

function bundledSkillSummary(skill: BundledSkill): ExportedSkillSummary {
  return {
    name: skill.name,
    path: `skills/${skill.name}/SKILL.md`,
    description: skill.description
  }
}

export function createBundledSkills(
  exportConfiguration: ExporterConfiguration,
  contextMetadata: ProjectContextMetadata
): { files: Array<OutputTextFile>; summaries: Array<ExportedSkillSummary> } {
  const skills: Array<BundledSkill> = []

  if (exportConfiguration.includeMcpServer && exportConfiguration.includeMcpUsageSkill) {
    skills.push({
      name: MCP_USAGE_SKILL_NAME,
      description: "How to use the context-scoped Supernova MCP tools, with search_documentation as the primary docs workflow.",
      content: usingSupernovaMcpSkillContent()
    })
  }

  if (exportConfiguration.includeFeedbackSkill && contextMetadata.isFeedbackCollectionEnabled) {
    skills.push({
      name: FEEDBACK_SKILL_NAME,
      description: "Capture design-system and MCP feedback through the Supernova collect_agent_feedback tool.",
      content: feedbackSkillContent(contextMetadata)
    })
  }

  return {
    files: skills.map(bundledSkillFile),
    summaries: skills.map(bundledSkillSummary)
  }
}
