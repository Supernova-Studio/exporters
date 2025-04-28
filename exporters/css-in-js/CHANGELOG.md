### CSS in JS Exporter Release Notes
All the updates to this exporter are documented in this file.

## 2.1.0 - 2025-03-12

### 🚀 New

Added automatic write-back functionality that allows saving generated variable names back to tokens:
- New option to enable/disable automatic write-back of generated names
- Configurable custom property name where the generated names will be saved
- Helps maintain consistency between design tokens and generated code

## 2.0.0 - 2025-02-10

### 🚀 New

This is the initial release of the CSS in JS Exporter. The exporter is built on the new export engine and is part of the Pulsar 2.0 release.

The CSS in JS exporter comes with extensive configuration options that allow you to customize the output format. Before modifying the code itself, check the configuration options - it's likely you can achieve your desired output through configuration alone.

The generated output is compatible with popular CSS-in-JS libraries like Emotion and Styled Components, allowing seamless integration into your applications.

Key features include:
- Support for all token types (colors, typography, spacing, etc.)
- Multiple color format options (HEX, RGB, HSL, OKLCH)
- Various token naming conventions (camelCase, constantCase, etc.)
- Flexible theming and branding support
- Customizable file organization