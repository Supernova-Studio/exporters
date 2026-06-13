# Claude Code Plugin Exporter

The Claude Code Plugin exporter generates a publishable Claude Code plugin from the currently selected Supernova Context.

## Output

The exported plugin uses the standard Claude Code plugin layout:

```text
.claude-plugin/
+-- plugin.json
+-- marketplace.json     # optional
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

The exporter does not write design-system content such as tokens, documentation pages, components, assets, or Storybook data into the plugin. Those are returned live by the context-scoped Supernova MCP server.

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

### Plugin manifest

- **pluginName:** Claude Code plugin identifier. Leave empty to use a slug of the context name.
- **pluginVersion:** Version written to `.claude-plugin/plugin.json`.
- **pluginDescription:** Description written to `plugin.json` and generated `README.md`. Leave empty to use the context description when available.
- **pluginAuthorName**, **pluginAuthorEmail**, **pluginAuthorUrl:** Optional author metadata.
- **pluginHomepage:** Optional homepage URL.
- **pluginRepositoryUrl:** Optional repository URL. Used by `plugin.json`, generated `README.md`, and optional marketplace metadata.
- **pluginLicense:** License identifier.
- **pluginKeywords:** Open array of keyword strings written to `plugin.json`.

### MCP

- **includeMcpServer:** Generate `.mcp.json` with the Supernova MCP pre-scoped to the context.
- **includeMcpUsageSkill:** Generate the `using-supernova-mcp` skill.

### Context skills

- **includeContextSkills:** Export Supernova skills selected by the current context.
- **preserveFolderHierarchy:** Preserve Supernova skill folder hierarchy under `skills/`.

### Frontmatter metadata

- **includeSupernovaMetadata:** Add Supernova metadata to exported context skill frontmatter.
- **includeSupernovaUpdatedAt:** Add the Supernova skill update timestamp.
- **includeSupernovaGeneratedBy:** Add the generator name.
- **includeSupernovaDisclaimer:** Add a generated-file disclaimer.
- **supernovaDisclaimer:** Customize the generated-file disclaimer.

### Feedback

- **includeFeedbackSkill:** Generate the feedback capture skill only when feedback collection is also enabled on the context.

### Publishing

- **includeMarketplaceManifest:** Generate `.claude-plugin/marketplace.json`.
- **includeReadme:** Generate the plugin's root `README.md`.
