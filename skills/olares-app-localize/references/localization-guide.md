# Localization guide

## Shared approach

- Translate the meaning of the whole paragraph or bullet. Do not mirror English syntax when it sounds unnatural.
- Keep feature bullets parallel within each locale.
- Keep paragraphs short and use the source Markdown structure.
- Prefer established software terminology used by major operating systems and developer tools in the target language.
- Do not translate a technical term merely to avoid English if the English term is the standard searchable term for administrators.

## Locale notes

### `zh-CN`

- Use concise Simplified Chinese and avoid mechanical `你/你的/该/此` when the subject is clear.
- Add half-width spaces between Chinese and adjacent Latin product or technical terms: `在 Olares 上运行`.
- Use Chinese punctuation in prose. Keep Western punctuation inside code, paths, versions, and URLs.

### `ja-JP`

- Use natural polite-neutral product prose; avoid literal translation and excessive pronouns.
- Do not add spaces between Japanese text and adjacent Latin letters, product names, acronyms, or numbers: `Olaresで実行`, `GPUを使用`, `v1.2に更新`. Keep spaces only when they are part of an official name or required inside code, commands, paths, URLs, or other protected syntax.
- Japanese normally uses kanji, hiragana, and katakana without word spaces. Do not insert spaces merely because adjacent source terms use different scripts.
- Keep English technical terms when they are conventional in Japanese software documentation.

### `de-DE`

- Prefer clear standard German over long compound nouns when a short phrase is more readable.
- Preserve formal-neutral documentation tone and avoid promotional intensifiers.
- Expect expansion; restructure sentences rather than dropping facts.

### `fr-FR`

- Use standard French software terminology and natural sentence structure.
- Apply French spacing and punctuation conventions in visible prose without changing code or URLs.
- Avoid unnecessary English calques when an established French term exists.

### `it-IT`

- Use concise standard Italian and established software terminology.
- Avoid phrasing that makes short descriptions sound promotional.

### `es-ES`

- Use standard European Spanish and consistent software terminology.
- Prefer direct neutral phrasing; avoid regional marketing idioms.

## What remains identical across locales

- YAML keys and nesting
- Markdown markers and link destinations
- product names without official localized forms
- version numbers and image tags
- file paths, commands, variables, ports, protocols, and identifiers in backticks
- the factual distinction between upstream changes and Olares deployment changes
