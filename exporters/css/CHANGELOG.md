### CSS exporter release notes
All the updates to this exporter are documented in this file.

## 3.7.0 - 2026-11-23

### 🐞 Fixed
- A word repeated inside one token or group name now stays in the variable name. A token "Fast-fast themed ref" exports as `--duration-fast-fast-themed-ref` instead of `--duration-fast-themed-ref`, the name of "Fast themed ref". A word repeated where the prefix, a group and the token name meet is still written once, as in `--color-neutral-500` for the token "Neutral 500" in the group "Neutral". Tokens and groups with a repeated word inside one name get new variable names after this update.

## 3.6.0 - 2026-11-16

### 🐞 Fixed
- Colors that reference another color with their own opacity, shown in Supernova as "Brand / 40%", now export as `rgba(var(--rgb-color-brand), 0.4)`, or `oklch(var(--oklch-color-brand) / 0.4)` in the OKLCH formats. They were the invalid `rgba(var(--color-brand), 0.4)` in the RGB formats and a fixed value in the others. An own opacity that references an opacity token uses its variable. With references off they are written as the resolved color.
- Shadows with their own opacity are valid in the OKLCH formats, where they now use `--oklch-…`, and use the raw color with references off.
- With Export only themed tokens, theme files write the `--rgb-…` and `--oklch-…` variables of all colors used with their own opacity, so they follow the theme when they change through an alias or a referenced color.

## 3.5.1 - 2026-11-09

### 🐞 Fixed
- Border and gradient tokens whose color references a color token now use that color's variable, for example `1px solid var(--color-border-active)`. They were written as `rgba(var(--color-border-active), 1)`, which is not valid CSS. With references off they are written as the raw color. A border or stop whose color a shadow also uses changes from `rgba(var(--rgb-…), …)` to `var(--color-…)`; in the rgb, hashHex6 and hsl formats the color variable has no transparency, so these borders and stops are now opaque, like the color token itself.

## 3.3.0 - 2025-01-XX

### ✨ Added
- Added fallback value support for token references:
  - New `useFallbackValues` configuration option to enable/disable fallback values
  - When enabled, references include raw token values as fallback in CSS `var()` function
  - Provides graceful degradation when referenced variables are not loaded in the browser
  - Format: `var(--token-name, fallback-value)` instead of just `var(--token-name)`

## 3.2.0 - 2025-03-12

### ✨ Added
- Added automatic write-back functionality that allows saving generated variable names back to tokens:
  - New option to enable/disable automatic write-back of generated names
  - Configurable custom property name where the generated names will be saved
  - Option to include var() syntax in the saved property values
  - Helps maintain consistency between design tokens and generated code

## 3.1.0 - 2025-02-17

### ✨ Added
- New `fileStructure` configuration option that controls how token styles are organized in files:
  - `separateByType`: Generate separate files for each token type (default)
  - `singleFile`: Generate one combined file containing all token types
- New `tokenNameStructure` configuration option that controls what parts are included in exported token names:
  - `pathAndName`: Include token path and name (default)
  - `nameOnly`: Only include token name
  - `collectionPathAndName`: Include collection, path, and name

## 3.0.0 - 2025-02-10

### 🚀 New features

- Added support for global name prefix configuration
- Introduced customizable token type prefixes
- Enhanced brand filtering capabilities
- Improved theme handling with three distinct export modes:
  - Direct theme application
  - Separate theme files
  - Merged theme output
- Added comprehensive TypeScript type definitions

### 💥 Breaking changes

- Updated token naming convention system
- Modified theme export structure
- Changed default export behavior for base values

## 2.0.0 - 2023-11-07

### 🚀 New

This is a major release of the CSS Exporter. The entire exporter was rewritten from scratch, and it is now based on the new export engine. This release is a part of the Pulsar 2.0 release. 

The CSS exporter now comes with a configuration file, which allows you to customize the output. The configuration file is located at ./src/config.ts. Before you start tinkering with the code itself, try to adjust the configuration options to fit your needs - it is very likely the exporter can do it exactly as you want.
