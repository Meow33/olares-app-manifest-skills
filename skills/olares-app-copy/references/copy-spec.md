# Olares app manifest copy specification

## Field semantics

### `metadata.title`

- Use the current official product spelling and capitalization.
- Do not add a category, version, or Olares unless it is part of the official name.
- Keep the same product name in every locale unless the product has an official localized name.

### `metadata.description`

- Write a single neutral English phrase that answers “What is this?”
- Aim for roughly 35–90 characters. Clarity matters more than hitting a hard count.
- Use sentence case and no final period.
- Prefer a concrete category and differentiator: `A free, privacy-focused media server`.
- Avoid calls to action, second-person claims, exclamation marks, and unverified adjectives.

### `spec.fullDescription`

- Open with one short paragraph explaining the app's purpose and primary use.
- Add `**For Olares users**`, setup, shared-service behavior, hardware needs, or storage sections only when the chart or Olares documentation verifies them.
- Use `**Key features**` followed by 4–7 parallel bullets when a feature list improves scanning.
- Prioritize stable, user-visible capabilities over exhaustive model/provider/plugin lists that quickly become stale.
- Do not copy upstream prose at length. Summarize facts in original wording.
- Do not claim privacy, security, offline behavior, hardware acceleration, format compatibility, or “no code changes” unless the source supports the precise scope.
- Write for an app user, not a chart maintainer. Omit internal chart structure, init-container details, UIDs, base images, and template mechanics unless they change user actions, data, configuration, security, compatibility, or resource requirements.

### `spec.upgradeDescription`

- This field is optional. Omit it when no reliable current-upgrade information exists; do not create an empty block.
- When a specific upstream release exists, link its official release or tag page near the beginning. Do not fabricate a link for an Olares-only packaging change.
- Use these optional sections only when relevant: `**Breaking change**`, `**What's changed**`, `**Fixes**`, `**Olares deployment changes**`, and `**Storage migration**`.
- Describe what users gain, lose, notice, must reconfigure, or must do. Do not describe what an engineer changed in the chart.
- Use past tense for completed changes and imperative language only for required user action.
- Put paths, image tags, environment variables, commands, and configuration keys in backticks.
- Link the exact official release notes when available.
- Cover only the current publishable upgrade. Do not accumulate old release history or copy a complete upstream changelog.
- Never invent an upgrade summary from the new version number alone.

For each candidate chart change, ask: “What will a user experience differently, and what must they do?”

- If the answer is verified, write the outcome and action in user language.
- If the only answer is “a template, probe, label, image tag, init container, or internal wiring changed,” omit it.
- If the chart change is evidence for a user impact, state the impact rather than the implementation.
- If the impact cannot be established, omit it from the field and flag the uncertainty in the handoff.

Examples:

| Implementation evidence | Do not write | Write only when verified |
| --- | --- | --- |
| Image tag changed | “Updated the image tag in `values.yaml`” | “Upgraded AppName to X.Y.Z” |
| Persistent volume added | “Added a PVC template” | “Application data now persists across restarts” |
| Environment variable renamed | “Changed the Deployment template” | “Custom configurations using `OLD_VAR` must switch to `NEW_VAR`” |
| Mount path fixed | “Fixed the volume mount” | “Fixed an issue that could prevent saved data from loading after restart” |

### Manifest Markdown contract

- Begin `fullDescription` with one or two short paragraphs explaining the app before any list.
- Use standalone bold section labels such as `**Key features**`, with one blank line before and after. Use sentence case and no trailing colon.
- Do not generate `#`, `##`, or other ATX headings inside these fields. Existing ATX headings are legacy content to report, not a template to copy.
- Prefer one-level `-` lists. Use numbered lists only for steps with a real order dependency.
- Treat tables as an exception for short, genuinely two-dimensional comparisons. Use no more than four concise columns. Do not use tables in upgrade notes by default.
- Use fenced code only when users need to copy multiline commands or configuration, and include a language tag. Use inline code for individual commands, paths, variables, and parameters.
- Do not generate HTML unless the repository has a verified rendering need that Markdown cannot express.
- Prefer `[descriptive label](exact-url)` over a bare URL. Preserve exact link targets across locales.
- Treat length as a review signal, not a hard limit: review `fullDescription` above 50 lines and `upgradeDescription` above 30 lines for unnecessary detail or accumulated history.

### English source drift

When both the root `OlaresManifest.yaml` and `i18n/en-US/OlaresManifest.yaml` define a copy field, compare them before a repository edit or localization handoff. A difference is not automatically an error in either file, but it makes the source of truth ambiguous. List the differing fields and resolve them from repository instructions, current chart/version context, history, or maintainer direction. Do not silently combine the two versions.

## Evidence standard

Classify each material fact:

- **Verified upstream:** official documentation, repository, or release notes.
- **Verified for Olares:** chart templates, values, manifest, or Olares documentation.
- **Unverified:** only a third-party page, old marketing copy, issue comment, or inference supports it.

Use verified facts. Use an unverified fact only when the user explicitly asks to retain it, and flag it in the handoff.

When sources conflict:

1. Prefer the source that describes the exact shipped version.
2. For deployment behavior, prefer the chart over upstream documentation.
3. For product features, prefer official app documentation over the chart.
4. If the conflict remains, do not silently choose. Report it.

## Olares writing rules

- Keep `Olares`, `Olares OS`, `Olares ID`, `Olares Space`, `LarePass`, `Vault`, `Profile`, `Studio`, and `Wise` in English.
- Use exact spellings such as `Wi-Fi`, `CPU`, `GPU`, and `API`.
- Use simple present tense for capabilities and active voice where natural.
- Keep most sentences below 25 words and one idea per sentence.
- Avoid idioms, hype, competitive claims, and vague benefits.
- Use `Select`, `Open`, `Go to`, or `Enter` instead of device-specific `click` or `tap` in setup steps.
