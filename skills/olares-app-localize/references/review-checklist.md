# Seven-locale review checklist

Check each locale against `en-US`, not only against a neighboring translation.

## Structure

- Exactly four required fields exist at the expected paths.
- Block scalar style, Markdown hierarchy, bullets, links, and blank-line grouping remain valid.
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

## Language quality

- The text sounds written in the target language rather than translated word for word.
- Tone is neutral and factual, with no added superlatives or promises.
- Headings and bullets are parallel and scannable.
- The short description has no final punctuation.
- Punctuation and spacing follow the locale, especially zh-CN and ja-JP spacing around Latin text.
