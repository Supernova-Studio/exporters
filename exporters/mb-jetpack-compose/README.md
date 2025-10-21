# Android Jetpack Compose Color Exporter

Exports Supernova color tokens to Android Jetpack Compose Kotlin files with `@Immutable` color objects.
Each token collection generates a separate `.kt` file with configurable naming.

## What it does
- Generates Kotlin files with `@Immutable` color objects for Android Jetpack Compose
- Groups color tokens by collection (e.g., primitive, semantic)
- Each collection outputs to a separate `.kt` file with configurable folder, file, and object names
- Color values formatted as `Color(0xAARRGGBB)` where AA=alpha, RR=red, GG=green, BB=blue
- Ensures unique, stable property names using token hierarchy and PascalCase naming
- Optional write-back of generated property names to tokens as a custom property

## Installation (in Supernova.io)
1) Commit/push this exporter folder to a Git host (or use the path within this monorepo).
2) Copy the URL to the exporter folder in the repository (the folder that contains `exporter.json`).
3) In Supernova: Workspace → Code automation → Exporters → New custom exporter.
4) Paste the URL and confirm. Supernova will register the exporter.
5) The exporter is now available in your workspace and can be used in pipelines.

Notes:
- If the repository is private, ensure the Supernova integration/credentials can access it.
- If you don't use Github for hosting the exporter, change also the Git provider.
- The exporter expects `dist/build.js` to exist; build locally and commit if needed.

## Output structure
```
<outputFolderName>/                    # configurable folder name (default: "color")
  <fileName>.kt                       # configurable file name per collection
  <fileName>.kt
```

## File format
Each collection file (`.kt`) contains:
```kotlin
@Immutable 
object ObjectName {                   // configurable object name
    val PropertyName1 = Color(0xFFF3F8FF)
    val PropertyName2 = Color(0xFFFFFFFF)
    val PropertyName3 = Color(0xFF000000)
}
```

## Configuration
Defined in `config.json` (Pulsar exporter schema). Key options:

### Collections
- `collectionNames` (array, default `["primitive"]`): List of token collection names to export (e.g., primitive, semantic). Each collection will generate a separate .kt file.

### Output
- `outputFolderName` (string, default `"color"`): Name of the folder where .kt files will be generated.

### Naming
- `fileNames` (object, default `{"primitive": "Primitive"}`): Mapping of collection names to .kt file names (without extension).
- `objectNames` (object, default `{"primitive": "PrimitiveColors"}`): Mapping of collection names to Kotlin object names.

### Automatic write-back
- `writeNameToProperty` (boolean, default false): Enable write-back of property names to tokens.
- `propertyToWriteNameTo` (string, default "Android variable"): Custom property key for write-back.

These are available in the Supernova exporter UI and can be overridden in pipelines.

## Write-back (keeps docs and Portal in sync)
When `writeNameToProperty` is enabled, the exporter saves the generated property name for each color token
into a custom property (default: "Android variable"). This makes the value visible in Supernova token management section and available in documentation/Portal as custom properties — always reflecting the latest exported naming used in code.

How it works:
- During export (non-preview), the exporter computes the final property name using PascalCase.
- It writes that value back to the token as a custom property via `WriteTokenPropStore`, under `propertyToWriteNameTo`.
- These values are great to surface in docs or the Portal so designers/devs see the exact, current identifier used by code.

## Color Format
Colors are exported in Android's ARGB format: `Color(0xAARRGGBB)`
- AA: Alpha channel (00-FF, where FF = fully opaque)
- RR: Red channel (00-FF)
- GG: Green channel (00-FF) 
- BB: Blue channel (00-FF)

Example: `Color(0xFFF3F8FF)` = fully opaque light blue

## Local dependencies
- `@supernovaio/export-utils` — local monorepo dependency (linked via `file:../../utils`)

Ensure the monorepo root is installed so `utils` is present, then run `npm i` in this exporter before building.

## Development
- Install dependencies (from this exporter folder):
```
npm i
```
- Build once:
```
npm run build
```
- Watch during development:
```
npm run dev
```

Build produces `dist/build.js` which is referenced by `exporter.json` as the executable.

## Iteration tips
- Source code:
  - `src/index.ts` — exporter entry; token collection grouping, file generation
  - `src/files/compose-colors.ts` — Kotlin file builders with @Immutable object generation
- If you change config schema, update both `config.json` (UI schema) and `config.ts` (types)
- Token collections are determined by the root group in the token hierarchy

## License
MIT