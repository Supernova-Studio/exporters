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

In standard layout, selected targets map to canonical skill folders:

| Target         | Output folder     |
| -------------- | ----------------- |
| Cursor         | `.agents/skills/` |
| Claude         | `.claude/skills/` |
| OpenAI Codex   | `.agents/skills/` |
| GitHub Copilot | `.agents/skills/` |

The exporter deduplicates shared target folders, so selecting Cursor, Codex, and GitHub Copilot emits one `.agents/skills/` copy. Empty workspaces or contexts with no matching skills export zero files without failing.

## Configuration

### Export targets

- **exportForCursor:** Export skills to Cursor's discovery location (`.agents/skills/`).
- **exportForClaude:** Export skills to Claude Code's discovery location (`.claude/skills/`).
- **exportForCodex:** Export skills to OpenAI Codex's discovery location (`.agents/skills/`).
- **exportForGitHubCopilot:** Export skills to GitHub Copilot's discovery location (`.agents/skills/`).

### Output structure

- **outputLayout:** Use `standard` to emit agent discovery folders, or `bare` to emit skill folders directly into the pipeline destination.
- **preserveFolderHierarchy:** Keep Supernova folder paths in the exported output. When disabled, skills are flattened and duplicate names receive deterministic numeric suffixes such as `skill-name-2`.
- **addSupernovaMetadata:** Add `supernova-skill-id` and `supernova-updated-at` to the `metadata` frontmatter field.
- **generateDebugFiles:** Emit `_debug` files with raw SDK responses, filtered skill results, normalized skills, and generated output metadata.
