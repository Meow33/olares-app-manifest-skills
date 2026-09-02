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

### `spec.upgradeDescription`

- State the Olares package version and upstream app version when both are known.
- Use these optional sections only when relevant: backup warning, `**What's changed**`, `**Fixes**`, `**Olares deployment changes**`, `**Storage migration**`, and `**Images**`.
- Describe user-visible or operator-relevant changes. Omit commit-level noise.
- Use past tense for completed changes and imperative language only for required user action.
- Put paths, image tags, environment variables, commands, and configuration keys in backticks.
- Link the exact official release notes when available.
- Never invent an upgrade summary from the new version number alone. If no release or chart changes are available, state the limitation instead of fabricating notes.

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

