# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

This repository is a **monorepo of Supernova.io exporter plugins** — TypeScript packages that transform design-system tokens into production code (CSS, CSS-in-JS, Tailwind, Style Dictionary, Jetpack Compose, SVG-to-React). There is no web server or database; local development means building packages and running Jest tests.

### Package layout

| Path | Package | Notes |
|------|---------|-------|
| `utils/` | `@supernovaio/export-utils` | Shared helpers; **must be installed first** |
| `exporters/css/` | CSS variables exporter | Depends on `file:../../utils` |
| `exporters/css-in-js/` | CSS-in-JS exporter | Has Jest tests |
| `exporters/jetpack-compose/` | Kotlin/Jetpack Compose exporter | |
| `exporters/style-dictionary/` | Style Dictionary JSON exporter | |
| `exporters/svg-to-react/` | SVG → React exporter | Uses `@supernovaio/export-helpers`, not `export-utils` |
| `exporters/tailwind-4/` | Tailwind CSS v4 exporter | |

Each package has its own `package.json` and `package-lock.json`. There is no root workspace or orchestration script.

### Standard commands

**Install dependencies (all packages):**
```bash
cd utils && npm install
for dir in css css-in-js jetpack-compose style-dictionary svg-to-react tailwind-4; do
  (cd "exporters/$dir" && npm install)
done
```

**Run tests:**
```bash
cd utils && npm test                    # 146 tests
cd exporters/css-in-js && npm test      # 13 tests
```

**Build exporter bundles (`dist/build.js`):**
```bash
cd exporters/<name> && npm run build
```

**Watch mode during development:**
```bash
cd utils && npm run dev                 # tsc --watch
cd exporters/<name> && npm run dev      # webpack --watch
```

### Important gotcha: do not rebuild `utils/` unless you intend to

Running `npm run build` in `utils/` recompiles `utils/dist/` from source via `tsc`. The committed `utils/dist/` is currently **out of sync** with `utils/helpers/KotlinHelper.ts` (the dist includes `colorFormat` in `TokenToKotlinOptions`; the source does not). Rebuilding utils breaks the **jetpack-compose** exporter build with a TypeScript error.

For normal exporter development and testing:
- Run `npm install` in `utils/` (uses committed `dist/`)
- Run `npm test` in `utils/` (tests run against source via ts-jest)
- Build individual exporters with `npm run build`

Only rebuild `utils/` when you are intentionally updating shared helper source and will fix downstream type errors.

### Lint / format

There is no repo-wide lint script. Prettier config lives at `.prettierrc`. Individual exporter packages include Prettier as a devDependency but no `npm run lint` script.

### End-to-end export

Full export against a live design system requires the external [Supernova.io](https://supernova.io) platform. Local verification is: install → test → webpack build → confirm `dist/build.js` exists.
