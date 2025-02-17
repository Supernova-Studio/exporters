### CSS Exporter Release Notes
All the updates to this exporter are documented in this file.

## 3.1.0 - 2025-02-17

### ✨ Added
- New `fileStructure` configuration option that controls how token styles are organized in files:
  - `separateByType`: Generate separate files for each token type (default)
  - `singleFile`: Generate one combined file containing all token types

## 3.0.0 - 2025-02-10

### 🚀 New Features

- Added support for global name prefix configuration
- Introduced customizable token type prefixes
- Enhanced brand filtering capabilities
- Improved theme handling with three distinct export modes:
  - Direct theme application
  - Separate theme files
  - Merged theme output
- Added comprehensive TypeScript type definitions

### 💥 Breaking Changes

- Updated token naming convention system
- Modified theme export structure
- Changed default export behavior for base values

## 2.0.0 - 2023-11-07

### 🚀 New

This is a major release of the CSS Exporter. The entire exporter was rewritten from scratch, and it is now based on the new export engine. This release is a part of the Pulsar 2.0 release. 

The CSS exporter now comes with a configuration file, which allows you to customize the output. The configuration file is located at ./src/config.ts. Before you start tinkering with the code itself, try to adjust the configuration options to fit your needs - it is very likely the exporter can do it exactly as you want.