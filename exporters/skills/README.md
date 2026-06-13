# Agentic Skills Exporter

The Agentic Skills exporter generates `SKILL.md` files from Supernova skills selected by the current context.

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

Selected output folders map to agent discovery locations:

| Output option          | Output folder             | Used by                                                                                            |
| ---------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| `exportToAgentsFolder` | `.agents/skills/`         | Cursor, OpenAI Codex, GitHub Copilot, and other agents that support the open Agent Skills location |
| `exportToClaudeFolder` | `.claude/skills/`         | Claude Code                                                                                        |
| `exportToPipelineRoot` | pipeline destination root | Custom setups where the pipeline destination already points at the desired skills folder           |

Empty workspaces or contexts with no matching skills export zero files without failing.

## Configuration

### Export targets

- **exportToAgentsFolder:** Export skills to `.agents/skills/`, the shared discovery folder used by Cursor, OpenAI Codex, GitHub Copilot, and other agents that support the open Agent Skills location.
- **exportToClaudeFolder:** Export skills to `.claude/skills/`, Claude Code's current project skill discovery folder.
- **exportToPipelineRoot:** Export skill folders directly into the selected pipeline destination, without adding a discovery-folder prefix.

### Output structure

- **preserveFolderHierarchy:** Keep Supernova folder paths in the exported output. When disabled, skills are flattened and duplicate names receive deterministic numeric suffixes such as `skill-name-2`.
- **addSupernovaMetadata:** Add Supernova update timestamp, provenance, and generated-file disclaimer to the `metadata` frontmatter field.
- **generateDebugFiles:** Emit `_debug` files with raw SDK responses, filtered skill results, normalized skills, and generated output metadata.
