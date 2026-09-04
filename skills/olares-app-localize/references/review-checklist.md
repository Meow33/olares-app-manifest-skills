# Olares manifest localization review checklist

Check each locale against `en-US`, not only against a neighboring translation.

## Structure

- `metadata.title`, `metadata.description`, and `spec.fullDescription` exist and are non-empty.
- `spec.upgradeDescription` follows the approved English source: omit it when the source omits it; require a non-empty translation when the source is non-empty. Target-only upgrade content is source drift.
- Block scalar style, Markdown hierarchy, bullets, links, and blank-line grouping remain valid.
- No ATX headings were introduced. Standalone bold section labels retain the source order and emphasis level.
- Tables, HTML, fenced code, deep list nesting, and unusually long fields receive manual rendering review.
- No English YAML key was translated.
- No locale file is empty or accidentally copied wholesale from English.

## Meaning

- App identity, purpose, features, limitations, scope, and user roles match the source.
- Numbers, versions, counts, supported formats/providers/models, and compatibility statements match.
- Upgrade actions, backup warnings, migration conditions, paths, and rollback statements match.
- Upstream product changes remain distinct from Olares packaging or deployment changes.

## Protected content

- Brand names, inline-code spans, URLs, link targets, placeholders, commands, environment variables, paths, image names, HTML structure, and configuration keys are unchanged.
- `Olares` terminology and fixed acronyms use the approved spelling.
- Visible Olares built-in app names follow the approved localized terminology rather than being treated as protected brands.
- Markdown link labels may be localized, but link targets remain exact. Sentence punctuation is not absorbed into a bare URL.

## Language quality

- The text sounds written in the target language rather than translated word for word.
- Tone is neutral and factual, with no added superlatives or promises.
- Headings and bullets are parallel and scannable.
- The short description has no final punctuation.
- Punctuation and spacing follow the locale, especially zh-CN and ja-JP spacing around Latin text.
- Japanese has no inserted spaces between Japanese text and adjacent Latin terms or numbers, except where an official name or protected syntax requires them.

## Repository source and locale set

- Before file writes, copy fields shared by the root manifest and `i18n/en-US` were compared. Any unresolved difference stopped the write and was reported by field.
- The target locale set matches root `spec.locale` and the established directory convention. Missing or extra directories are reported rather than silently created or ignored.
- Every locale was compared directly with the approved English source, not with another translation.
