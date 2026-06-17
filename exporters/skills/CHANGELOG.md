### Agent skills exporter release notes

All updates to this exporter are documented in this file.

## 0.2.6 - 2026-06-13

### Changed

- Render the Supernova disclaimer as a multiline configuration field.
- Write multiline frontmatter metadata values as YAML block scalars.

## 0.2.5 - 2026-06-13

### Removed

- Remove debug file generation from the exporter configuration and output.

## 0.2.4 - 2026-06-13

### Changed

- Rename the Claude folder option for clearer configuration wording.
- Add configurable generated-file disclaimer text for Supernova metadata.

## 0.2.3 - 2026-06-13

### Changed

- Group agent folder and skill path settings under folder hierarchy.
- Add separate frontmatter metadata toggles for update timestamp, generator name, and generated-file disclaimer.

## 0.2.2 - 2026-06-13

### Changed

- Replace agent-specific export toggles with folder-based output options.
- Store Supernova generated-file provenance in frontmatter metadata without internal skill IDs.

## 0.2.1 - 2026-06-13

### Fixed

- Normalize SDK skill model instances before generating output files.

## 0.2.0 - 2026-06-12

### Added

- Export Supernova skills as agent-compatible `SKILL.md` files.
- Add target folder mapping for `.agents/skills/` and `.claude/skills/`.
- Add bare output layout, hierarchy preservation, flattened name suffixing, and Supernova frontmatter metadata.
- Add optional debug files for inspecting raw SDK responses and generated output metadata.

## 0.1.0 - 2026-06-02

### Added

- Added the initial Agent skills exporter.
