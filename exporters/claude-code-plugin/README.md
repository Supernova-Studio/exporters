# Claude Code plugin exporter

Turn a Supernova Context into a ready-to-install Claude Code plugin.

This exporter packages the setup your team would otherwise wire by hand: a context-scoped Supernova MCP connection, selected context skills, optional feedback capture, MCP usage guidance, and Claude Code plugin metadata. Export it to a repository, push it to GitHub, and your team can install the same Supernova-aware Claude Code setup.

Design-system content such as tokens, documentation pages, components, assets, and Storybook data is not written into the plugin. That data stays live in Supernova and is retrieved through the context-scoped MCP server, so Claude Code gets fresh context without committing snapshots to the repository.

## What it packages

The exported plugin uses the standard Claude Code plugin layout:

```text
.claude-plugin/
+-- plugin.json
+-- marketplace.json     # enabled by default
.mcp.json                # optional, enabled by default
skills/
+-- using-supernova-mcp/
|   +-- SKILL.md
+-- capture-feedback/    # only when enabled in config and on the context
|   +-- SKILL.md
+-- context-skill/
    +-- SKILL.md
README.md                # optional, enabled by default
```

- `.claude-plugin/plugin.json` for Claude Code plugin metadata.
- `.mcp.json` with the Supernova MCP scoped to the selected Context.
- `skills/` with Supernova skills selected by the Context.
- `using-supernova-mcp/SKILL.md` with guidance for using Supernova MCP tools.
- `capture-feedback/SKILL.md` when feedback collection is enabled for the Context and in exporter config.
- `.claude-plugin/marketplace.json` and `README.md` for publishing and installing from a repository (enabled by default).

## Why design-system data is not exported

The plugin is an installable setup, not a snapshot of your design system. Tokens, documentation, components, assets, and Storybook data change over time, so Claude Code should retrieve them through the Supernova MCP when needed.

## Context scope

The exporter requires a Supernova Context. It resolves the context dataset, exports the context's selected skills, and reads context metadata through `sdk.projects.getProjectContext`.

The generated MCP configuration is always context-scoped:

```json
{
  "mcpServers": {
    "supernova": {
      "type": "http",
      "url": "https://mcp.supernova.io/mcp/c/<context-id>-<context-slug>"
    }
  }
}
```

The MCP server name, base URL, and scope are intentionally not user-configurable. The plugin is meant to be published for production use, and context scoping is the source of truth for what the plugin can retrieve.

## Bundled skills

- **using-supernova-mcp:** Explains how to use the Supernova MCP. It emphasizes `search_documentation` as the primary entry point for documentation and workspace knowledge, with page lists as a secondary fallback.
- **capture-feedback:** Explains when and how to call `collect_agent_feedback`. This skill is generated only when `includeFeedbackSkill` is enabled and the context has feedback collection enabled.

## Configuration

### Marketplace & installation

- **includeMarketplaceManifest:** Generate a marketplace manifest so this plugin can be installed from a Git repository. Disable when adding this export to a repository that already has a shared marketplace listing multiple plugins. Enabled by default.
- **includeReadme:** Generate the plugin's root `README.md`.
- **pluginRepositoryUrl:** Optional repository URL. Used by `plugin.json`, `marketplace.json`, and generated `README.md`.

### MCP

- **includeMcpServer:** Generate `.mcp.json` with the Supernova MCP pre-scoped to the context.
- **includeMcpUsageSkill:** Generate the `using-supernova-mcp` skill.

### Plugin manifest

- **pluginName:** Claude Code plugin identifier. Leave empty to use a slug of the context name.
- **pluginVersion:** Version written to `.claude-plugin/plugin.json`. Defaults to `1.0.0`.
- **pluginDescription:** Description written to `plugin.json` and generated `README.md`. Leave empty to use the context description when available.
- **pluginAuthorName**, **pluginAuthorEmail**, **pluginAuthorUrl:** Optional author metadata.
- **pluginHomepage:** Optional homepage URL.
- **pluginLicense:** License identifier.
- **pluginKeywords:** Open array of keyword strings written to `plugin.json`.

### Skills

- **includeContextSkills:** Export Supernova skills selected by the current context.
- **preserveFolderHierarchy:** Preserve Supernova skill folder hierarchy under `skills/`.
- **includeFeedbackSkill:** Generate the feedback capture skill only when feedback collection is also enabled on the context.

### Frontmatter metadata

- **includeSupernovaMetadata:** Add Supernova metadata to exported context skill frontmatter.
- **includeSupernovaUpdatedAt:** Add the Supernova skill update timestamp.
- **includeSupernovaGeneratedBy:** Add the generator name.
- **includeSupernovaDisclaimer:** Add a generated-file disclaimer.
- **supernovaDisclaimer:** Customize the generated-file disclaimer.
