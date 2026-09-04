# Repository discovery and safe file creation

Do not assume that every repository uses `i18n/<locale>/OlaresManifest.yaml`.

## Discover the layout

1. Find repository instructions such as `AGENTS.md`, contribution guides, localization documentation, generators, and CI checks that apply to the target app.
2. Identify the app boundary using existing application markers such as `Chart.yaml`, a root manifest, `values.yaml`, and `templates/`. In a monorepo, distinguish the repository root from the app root.
3. Search the target app and two or more neighboring apps for localized manifests. Record:
   - locale root directory
   - locale directory or filename convention
   - manifest filename and casing
   - canonical source locale
   - relationship between the root manifest and localized manifests
   - whether files are generated or maintained directly
4. Inspect existing target-language files before writing. Preserve extra fields and repository-specific differences that are outside the four copy fields.
5. Compare copy fields present in both the root manifest and the source-locale manifest. If they differ, list the exact fields and resolve the source of truth before writing.
6. Read root `spec.locale` when present and compare it with discovered locale directories. Use the declared and established set for write mode; adding a new locale requires an explicit request.

## Confidence and action

- **Confirmed:** repository instructions, a generator, or multiple consistent examples establish the layout. Update existing files and create missing files that follow that exact pattern.
- **Inferred:** one example suggests a layout but the convention is not fully established. Show the locale-to-path mapping and planned creates/updates before writing.
- **Unknown:** examples conflict, no localization structure exists, or the canonical source is unclear. Do not create files. Give the engineer a proposed mapping and list the unresolved decisions.

An explicit user-provided mapping counts as confirmed for that task.

## Mapping output

Before creating files in an inferred layout, report a compact mapping such as:

```text
Source: charts/mongodb/OlaresManifest.yaml -> en-US
zh-CN: charts/mongodb/locales/zh/Manifest.yaml (update)
fr-FR: charts/mongodb/locales/fr/Manifest.yaml (create)
...
```

Do not rename existing locale directories to the skill's preferred locale codes. Map semantic targets to repository paths instead.
