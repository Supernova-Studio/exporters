# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-11-16
- Colors that reference another color with their own opacity now export as `oklch(var(--oklch-color-brand) / 0.4)`, or `rgba(var(--rgb-color-brand), 0.4)` in the hex, RGB and HSL formats. They were the invalid `rgba(var(--color-brand), 0.4)` in the RGB formats and a fixed value in the others.
- `--oklch-…` keeps the `%` on lightness, so shadows with their own opacity show the right color, and the hex, RGB and HSL formats use `--rgb-…` instead of the invalid `rgba(var(--oklch-…), …)`.
- Separate files per type and theme files write the channel variables they use, and shadows use the raw color with references off.

## [1.2.1] - 2026-11-09
- Border tokens whose color references a color token now use that color's variable instead of the invalid `oklch(var(--color-…) / 1)`.

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