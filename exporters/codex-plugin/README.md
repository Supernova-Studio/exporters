# Codex plugin exporter

Turn a Supernova Context into a ready-to-install Codex plugin.

This exporter packages the setup your team would otherwise wire by hand: a context-scoped Supernova MCP connection, selected context skills, optional feedback capture, MCP usage guidance, and Codex plugin metadata. Export it to a repository, push it to GitHub, and your team can install the same Supernova-aware Codex setup.

Design-system content such as tokens, documentation pages, components, assets, and Storybook data is not written into the plugin. That data stays live in Supernova and is retrieved through the context-scoped MCP server, so Codex gets fresh context without committing snapshots to the repository.

## What it packages

The exported plugin uses the standard Codex plugin layout:

```text
.codex-plugin/
+-- plugin.json
.agents/plugins/
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

- `.codex-plugin/plugin.json` for Codex plugin metadata and install-surface `interface` fields.
- `.agents/plugins/marketplace.json` for Codex marketplace install (enabled by default).
- `.mcp.json` with the Supernova MCP scoped to the selected Context.
- `skills/` with Supernova skills selected by the Context.
- `using-supernova-mcp/SKILL.md` with guidance for using Supernova MCP tools.
- `capture-feedback/SKILL.md` when feedback collection is enabled for the Context and in exporter config.
- `README.md` for publishing and installing from a repository (enabled by default).

## Why design-system data is not exported

The plugin is an installable setup, not a snapshot of your design system. Tokens, documentation, components, assets, and Storybook data change over time, so Codex should retrieve them through the Supernova MCP when needed.

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

`interface.capabilities` is always `["Read"]` because the Supernova MCP is read-only today.

## Bundled skills

- **using-supernova-mcp:** Explains how to use the Supernova MCP. It emphasizes `search_documentation` as the primary entry point for documentation and workspace knowledge, with page lists as a secondary fallback.
- **capture-feedback:** Explains when and how to call `collect_agent_feedback`. This skill is generated only when `includeFeedbackSkill` is enabled and the context has feedback collection enabled.

## Configuration

### Marketplace & installation

- **includeMarketplaceManifest:** Generate `.agents/plugins/marketplace.json` so this plugin can be installed from a Git repository. Disable when adding this export to a repository that already has a shared marketplace listing multiple plugins. Enabled by default.
- **includeReadme:** Generate the plugin's root `README.md`.
- **pluginRepositoryUrl:** Optional repository URL. Used by `plugin.json`, marketplace.json, and generated `README.md`.
- **marketplaceInstallationPolicy:** Marketplace `policy.installation` (`AVAILABLE`, `INSTALLED_BY_DEFAULT`, `NOT_AVAILABLE`). Defaults to `AVAILABLE`.
- **marketplaceAuthenticationPolicy:** Marketplace `policy.authentication` (`ON_INSTALL`, `ON_USE`). Defaults to `ON_INSTALL`.

### MCP

- **includeMcpServer:** Generate `.mcp.json` with the Supernova MCP pre-scoped to the context.
- **includeMcpUsageSkill:** Generate the `using-supernova-mcp` skill.

### Plugin manifest

- **pluginName:** Codex plugin identifier. Leave empty to use a slug of the context name.
- **pluginVersion:** Version written to `.codex-plugin/plugin.json`. Defaults to `1.0.0`.
- **pluginDescription:** Description written to `plugin.json`, `interface.shortDescription`, and generated `README.md`. Leave empty to use the context description when available.
- **pluginAuthorName**, **pluginAuthorEmail**, **pluginAuthorUrl:** Optional author metadata. `pluginAuthorName` also maps to `interface.developerName`.
- **pluginHomepage:** Optional homepage URL. Also written to `interface.websiteURL` when it is an absolute `https://` URL.
- **pluginLicense:** License identifier.
- **pluginKeywords:** Open array of keyword strings written to `plugin.json`.

### Plugin interface

- **pluginDisplayName:** Human-readable name for `interface.displayName` and the marketplace title. Leave empty to use the context name.
- **pluginLongDescription:** Extended description for `interface.longDescription`.
- **pluginCategory:** Category for `interface.category` and the marketplace entry. Defaults to `Design systems`.
- **pluginBrandColor:** Hex color for `interface.brandColor`. Leave empty to omit.
- **pluginPrivacyPolicyUrl**, **pluginTermsOfServiceUrl:** Legal URLs for the Codex install surface. Must be absolute `https://` URLs when set.
- **pluginDefaultPrompts:** Starter prompts for `interface.defaultPrompt`. Up to 3 entries, 128 characters each.

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

## Install

With the default marketplace manifest:

```text
codex plugin marketplace add <owner/repo>
```

Restart Codex, open the plugin directory, and install the plugin from the marketplace.

See [Codex plugin build docs](https://developers.openai.com/codex/plugins/build) for local marketplace setup and manual install.
