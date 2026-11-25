# Changelog

All notable changes to this project will be documented in this file.

## [1.6.0] - 2026-11-25
- New "Repeated words" setting in Token names. "Remove all" (default) writes a word repeated inside one token or group name once again, as before 1.4.0: "Super super token" exports as `--color-super-token`, in variables and typography classes. "Remove where names meet" keeps the 1.4.0 names. If two tokens now share a name, for example "Fast-fast themed ref" and "Fast themed ref" → `--duration-fast-themed-ref`, pick "Remove where names meet" or "Keep all". "Keep all" also keeps a word repeated where a group meets the token name or the token type prefix meets a group: "Neutral 500" in the "Neutral" group exports as `--color-neutral-neutral-500`. Colors with a color utility prefix and blur tokens keep their names in every option.

## [1.5.0] - 2026-11-24
- Utility classes now show a token's theme value. The base file opens `@theme` instead of `@theme inline`, so a class such as `text-primary` reads `var(--text-color-primary)` and a theme file that overrides it changes the class.
- Theme files also write every token that references a themed token, such as an alias of a themed color or a color with its own opacity over it, so these keep following the theme.
- A shadow that a theme overrides is written as `--shadow-card: var(--value-shadow-card)`, and theme files override `--value-shadow-card`. Tailwind's `shadow-<color>` and `/<opacity>` modifiers do not change these shadows; shadows that no theme overrides keep them.
- With "Separate by type", a theme folder can now hold more type files, such as `dark/tailwind.typography.css` for typography tokens that reference a themed font size. If you import theme files yourself instead of `index.css`, import these too.
- With merged themes, the theme file now also holds tokens that only a later theme overrides, so their classes follow that theme.
- With merged themes, "Separate by type" and "Export only themed tokens", `index.css` imports only the type files that the merged theme file writes, so it no longer imports files that do not exist.
- Typography classes read font family, text decoration, text case, indent and paragraph spacing from variables, as they already did for size and weight, so a theme that changes them changes the class. Theme files no longer write typography classes.
- A typography token with an auto line height now writes `line-height: normal`, so its class and its `text-<name>` class show normal line height instead of the parent's, and a theme can switch a token between auto and a fixed line height.
- With a global prefix, references and theme files use the prefixed variable names (`--tw-color-primary`), so theme values reach classes.

## [1.4.0] - 2026-11-23
- A word repeated inside one token or group name now stays in variable names and typography classes. "Fast-fast themed ref" exports as `--duration-fast-fast-themed-ref` instead of sharing `--duration-fast-themed-ref` with "Fast themed ref", which now always belongs to "Fast themed ref". A typography token "Heading heading XL" in Typography/Heading gets `typography-heading-heading-xl`. A word repeated where the prefix, a group and the token name meet is still written once. Color tokens that get a color utility prefix, such as `--bg-color-brand-500`, keep their names, and find and replace still matches across parts in them.
- With "Apply find/replace" set to "Before prefix is added", find and replace runs on each group name and on the token name separately, so a find text that spans two group names, or a group name and the token name, no longer matches in variable names. To match across parts there, set "Apply find/replace" to "After prefix is added" and write the find text as it appears in the final name, such as `brand-primary`. Typography class names always run find and replace on each group name and on the token name separately, whatever "Apply find/replace" is set to.

## [1.3.1] - 2026-11-19
- Duration tokens get the Tailwind class `.duration-(--duration-fast)` instead of `.duration-fast`. Tailwind 4's `duration-*` utilities don't read `--duration-*` variables, so the old class built nothing, or Tailwind's own milliseconds for a numbered name like `duration-100`. The variables don't change.
- The README shows how to apply Duration tokens.

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