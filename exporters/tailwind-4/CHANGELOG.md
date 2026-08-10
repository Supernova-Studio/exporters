# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-08-10

### Changed
- Forked as a TeamViewer custom exporter: `id` is now `teamviewer.exporter-tailwind-4`
  so it installs alongside the official Tailwind exporter instead of colliding with it.
- Rem conversion is now decided per token type instead of globally. Space, Size, Dimension
  and FontSize tokens are emitted in `rem`; BorderRadius, Blur, BorderWidth and Shadow keep
  their authored pixel values.
- `forceRemUnit` still converts every pixel value, so existing pipelines that enable it are
  unaffected.

## [1.1.1] - 2025-09-10
- Fix spacing token output: generate `--spacing-*` instead of `--size-*` for sizing. Thanks @mickaelnijean for contribution!

## [1.1.0] - 2025-07-18

### Added
- OKLCH utility variable support for color tokens referenced with opacity
- Automatic generation of `--oklch-*` variables for color tokens used in shadows, borders, and gradients with custom opacity
- Support for `oklch(var(--oklch-...) / alpha)` syntax when using OKLCH color formats
- Proper color function selection (oklch vs rgba) based on configured color format

### Changed
- Updated color reference handling to use channel-based utility variables for better opacity control
- Improved compatibility with modern CSS color spaces

## [1.0.0] - 2025-04-07

### Added
- Initial release of the Tailwind CSS Exporter
- Support for all Supernova token types (that are also supported by Tailwind config)
- Branding and theming support
- Customizable output formatting
- Comment support for token descriptions
- File organization options (single file or separate by type)
- Reset rules functionality (can be in separate file or main CSS file)
- Typography classes generation
- Comprehensive configuration options for all aspects of the exporter