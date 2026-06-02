# Agentic Skills Exporter

The Agentic Skills exporter is the starting point for generating Supernova agentic skill artifacts.

This exporter is intentionally barebones right now. It registers with the Supernova export engine and returns no output files until the skill generation format is implemented.

## Output

No files are generated yet.

## Configuration

### Export targets

- **exportForCursor:** Generate skills for Cursor. Project-level targets are `.cursor/skills/` or `.agents/skills/`. Global targets are `~/.cursor/skills/` or `~/.agents/skills/`. Cursor also loads compatible Claude and Codex skill folders.
- **exportForClaude:** Generate skills for Claude Code and Claude Desktop. Project-level target is `.claude/skills/`. Global target is `~/.claude/skills/`.
- **exportForCodex:** Generate skills for OpenAI Codex. Project-level targets are `.codex/skills/` and `.agents/skills/`. Global targets are `~/.codex/skills/` and `~/.agents/skills/`.
- **exportForGitHubCopilot:** Generate skills for GitHub Copilot. Project-level targets are `.github/skills/` or `.agents/skills/`. Global targets are `~/.copilot/skills/` or `~/.agents/skills/`.
