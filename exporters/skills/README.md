# Agent skills exporter

The Agent skills exporter generates `SKILL.md` files from Supernova skills selected by the current context.

## Output

Each exported skill is written as a folder containing a `SKILL.md` file:

```text
.agents/skills/
+-- skill-name/
    +-- SKILL.md
```

When folder hierarchy is preserved, Supernova skill folders are emitted as category folders:

```text
.agents/skills/
+-- frontend/
    +-- skill-name/
        +-- SKILL.md
```

When agent folders are enabled, selected output folders map to agent discovery locations:

| Output option          | Output folder     | Used by                                                                                            |
| ---------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| `exportToAgentsFolder` | `.agents/skills/` | Cursor, OpenAI Codex, GitHub Copilot, and other agents that support the open Agent Skills location |
| `exportToClaudeFolder` | `.claude/skills/` | Claude Code                                                                                        |

When agent folders are disabled, skill folders are written directly into the export destination.

Empty workspaces or contexts with no matching skills export zero files without failing.

## Configuration

### Folder hierarchy

- **createAgentFolders:** Create agent discovery folders in the export destination. When disabled, skill folders are written directly to the export destination.
- **exportToAgentsFolder:** Create `.agents/skills/`, the shared discovery folder used by Cursor, OpenAI Codex, GitHub Copilot, and other agents that support the open Agent Skills location.
- **exportToClaudeFolder:** Create `.claude/skills/` for Claude Code.
- **preserveFolderHierarchy:** Keep Supernova folder paths in the exported output. When disabled, skills are flattened and duplicate names receive deterministic numeric suffixes such as `skill-name-2`.

### Frontmatter metadata

- **includeSupernovaMetadata:** Add Supernova metadata to the `SKILL.md` frontmatter.
- **includeSupernovaUpdatedAt:** Add the Supernova skill update timestamp to frontmatter metadata.
- **includeSupernovaGeneratedBy:** Add the Supernova generator name to frontmatter metadata.
- **includeSupernovaDisclaimer:** Add a generated-file disclaimer to frontmatter metadata.
- **supernovaDisclaimer:** Customize the generated-file disclaimer text.
