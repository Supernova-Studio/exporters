### Style Dictionary Exporter
All the updates to this exporter are documented in this file.

## 2.5.0 - 2025-01-XX

### ✨ Added
- Added support for color opacity in composite tokens:
  - Color tokens referenced in shadows, borders, and gradients now support custom opacity values
  - Automatically generates RGB utility values for color tokens when needed
  - Improves compatibility with design systems that use opacity variations

## 2.4.0 - 2025-03-12

### ✨ Added
- New `fileStructure` configuration option that controls how token files are organized:
  - `separateByType`: Generate separate files for each token type (default)
  - `singleFile`: Generate one combined file containing all token types

## 2.3.0 - 2025-02-27

### ✨ Added
- Added token `type` information to Style Dictionary output for better compatibility
- New `useTokenTypePrefixes` configuration option that controls whether token names are prefixed with their type

## 2.2.0 - 2025-02-24

### ✨ Added
- New `tokenNameStructure` configuration option that controls how tokens are structured:
  - `pathAndName`: Include path and name (e.g. button/primary/bg)
  - `nameOnly`: Only include name (e.g. primary)
  - `collectionPathAndName`: Include collection, path, and name (e.g. core/button/primary/bg)

## 2.1.0 - 2025-02-17

### 🚀 New
- Added new "Nested themes" export format that combines all theme values into a single object structure
- Each token now includes base value and theme-specific values in a unified structure
- Improved theme value organization for better readability and integration

## 2.0.0 - 2025-02-10

### 🚀 New

This is the initial release of the Style Dictionary Exporter. The exporter is built on the new export engine and is part of the Pulsar 2.0 release.

The Style Dictionary exporter comes with extensive configuration options that allow you to customize the output format. Before modifying the code itself, check the configuration options - it's likely you can achieve your desired output through configuration alone.

The generated output is compatible with Style Dictionary's token format, allowing seamless integration into your design systems and applications.

Key features include:
- Support for all token types (colors, typography, spacing, etc.)
- Flexible theming support
- Multiple color format options (HEX, RGB, HSL, OKLCH)
- Customizable file organization