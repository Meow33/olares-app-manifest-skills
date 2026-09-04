---
name: olares-app-localize
description: Translate approved English Olares app manifest copy into zh-CN, fr-FR, de-DE, ja-JP, it-IT, and es-ES, and optionally validate repository files. Use after the English source is approved. Do not use to research missing product facts or translate unrelated UI bundles.
---

# Olares app localization

Translate approved English app manifest copy into six target locales while preserving factual meaning, YAML structure, Markdown, technical tokens, and product terminology. English is the source and is not a translation deliverable.

Use `$olares-app-copy` first when the English source is missing, promotional, internally inconsistent, or contains unsupported claims. This skill is self-contained for manifest localization. When the repository provides a newer approved Olares glossary or non-translatable list, that repository source takes precedence over the bundled terminology reference.

## Target locales

The source locale is `en-US`. In preview mode, the default translation targets are `zh-CN`, `fr-FR`, `de-DE`, `ja-JP`, `it-IT`, and `es-ES`. Do not reproduce `en-US` unless the user explicitly asks for a combined package. In write or repository-review mode, discover declared targets from root `spec.locale` and existing locale directories; do not create an undeclared locale unless the user explicitly requests it. Locale identifiers are semantic labels, not permission to impose directory names.

Read [references/repository-discovery.md](references/repository-discovery.md) before deciding file paths. Read [references/terminology.md](references/terminology.md) and [references/localization-guide.md](references/localization-guide.md) before translating. Read [references/review-checklist.md](references/review-checklist.md) before finalizing or reviewing existing translations.

## Modes

### Preview mode (default)

When the user asks to generate or translate copy, return the completed locale variants in the conversation. Do not inspect the repository unless it is needed to understand the supplied source. Do not create directories, create files, or modify existing files.

Accept natural-language input, pasted YAML, an English manifest file, or the four field values. If the source is not already in YAML, normalize each translation to the four-field manifest shape. Label each of the six target locales clearly so an engineer can copy it into the appropriate repository location. Do not include a separate English block by default.

### Write mode (explicit only)

Enter write mode only when the user explicitly asks to write, save, apply, create, or update repository files. A repository path or attached file alone does not authorize write mode. In write mode, discover the repository layout before choosing paths and follow [references/repository-discovery.md](references/repository-discovery.md).

## Workflow

1. Identify the approved English source and check that it is factual, clear, and stable. In preview mode, user-supplied approved English is sufficient. In write or repository-review mode, compare copy fields shared by the root manifest and `i18n/en-US`; unresolved drift blocks file writes and must be reported field by field.
2. If repository terminology files are available in the provided context, use them and report any conflict with the bundled terminology reference.
3. Translate by meaning, not sentence shape. Keep the same facts, scope, conditions, warnings, placeholders, versions, links, paths, commands, HTML, image tags, configuration keys, and Markdown hierarchy. Treat `upgradeDescription` as conditional: when the approved source omits it, omit it in targets; when the source is non-empty, every declared target must contain an equivalent non-empty translation.
4. In preview mode, return one clearly labeled YAML block for each requested target locale and stop. Exclude the English source from the generated locale blocks unless requested. Mention unresolved terminology or source ambiguity; do not invent missing facts.
5. In explicit write mode, discover the repository structure, classify layout confidence, and map semantic locales to actual paths. Update existing files only after that mapping is known. Create missing files only when the repository establishes the pattern or the user approves it.
6. In write mode, run the bundled validator using the mode that matches the repository:

   ```bash
   # Conventional <app>/i18n/<locale>/OlaresManifest.yaml layout
   node ~/.codex/skills/olares-app-localize/scripts/validate-manifests.mjs <app-directory>

   # A locale root or different names
   node ~/.codex/skills/olares-app-localize/scripts/validate-manifests.mjs <locale-root> \
     --source en --locales en,zh-CN,fr-FR,de-DE,ja-JP,it-IT,es-ES --file Manifest.yaml

   # Arbitrary paths: JSON object mapping semantic locale to manifest path
   node ~/.codex/skills/olares-app-localize/scripts/validate-manifests.mjs \
     --map ./manifest-map.json --source en-US
   ```

7. Review generated copy—and the diff in write mode—manually for meaning and natural language. A structural validator cannot assess translation quality.

## Non-negotiable rules

- Keep third-party product names unchanged unless the publisher uses an official localized name.
- Keep `Olares`, `Olares OS`, `Olares ID`, `Olares Space`, `LarePass`, `Vault`, `Profile`, `Studio`, and `Wise` in English.
- Localize visible names of Olares built-in apps when the approved locale terminology does so: `Desktop`, `Market`, `Files`, `Settings`, `Control Hub`, and `Dashboard` are not protected brand terms.
- Preserve inline code, URLs, Markdown link targets, version strings, image names, file paths, environment variables, and configuration keys exactly.
- Preserve placeholders exactly, including braces, spelling, casing, and multiplicity. Preserve HTML tag names, closing tags, and required attributes.
- Preserve whether a claim says “supports,” “can,” “requires,” “may,” or “only.” Do not strengthen or weaken it.
- Preserve every warning and required action. Do not add a warning that the English source does not contain.
- Do not translate fixed English technical identifiers such as `CPU`, `GPU`, `API`, `HTTP`, `JSON`, or `YAML`.
- Do not add marketing language, cultural adaptations, new examples, or new product facts.
- `metadata.description` stays concise, uses sentence case appropriate to the locale, and has no final punctuation.
- Localize visible Markdown headings such as `Key features`, but keep Markdown markers unchanged.
- Do not introduce ATX headings (`#`, `##`, and so on). Preserve standalone bold section-label structure across locales. Tables, HTML, and fenced code require manual review when present in the approved source; do not add them during translation.

## Handoff

Report:

- source locale and any source ambiguity
- generated target locales; do not count the English source as generated
- files created or updated, only in write mode
- validator result, only when files were validated
- any terminology or factual question that still needs product review
- discovered layout and locale-to-path mapping, only in write mode

## Stop condition

In preview mode, unclear repository structure is never a blocker: generate the translations in the conversation. In write mode, if the application root, canonical source, root/en-US relationship, locale naming, or destination paths remain ambiguous after inspection, do not create files. Return the translations plus the source differences or proposed mapping for an engineer to confirm.
