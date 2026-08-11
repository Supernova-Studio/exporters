# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-08-10

### Changed
- Forked as a TeamViewer custom exporter: `id` is now `teamviewer.exporter-tailwind-4`
  so it installs alongside the official Tailwind exporter instead of colliding with it.
- Units and namespaces are resolved from the token **path** rather than the token type,
  via the new `tokenPathUnits` and `tokenPathPrefixes` settings. A design system imported
  from Figma commonly types every scalar as a generic `Dimension`, which makes the token
  type useless as a signal and collapses the whole system into `--spacing-*`.
- `reference/spacing/*` and `reference/font-size/*` are emitted in `rem`;
  `radius`, `line-height` and `letter-spacing` keep their authored pixels;
  `font-weight` has its unit stripped.
- `remBase` is no longer gated behind `forceRemUnit`, since path rules perform rem
  conversion with `forceRemUnit` off.

### Fixed
- Font weights are no longer emitted as `--spacing-reference-font-weight-600: 37.5rem`.
  They are typed as generic dimensions carrying `600px`, so the previous type-based rule
  converted them as spacing. They now emit `--font-weight-600: 600`.
- Radius, line height and letter spacing are no longer converted to `rem`. The previous
  rule listed `Dimension` as a rem type, which caught every generically-typed token
  including the ones meant to stay in pixels.
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