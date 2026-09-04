#!/usr/bin/env bash

set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source_dir="$repo_dir/skills"

for skill in olares-app-copy olares-app-localize; do
  source_path="$source_dir/$skill"
  if [[ ! -f "$source_path/SKILL.md" ]]; then
    echo "Missing skill: $source_path/SKILL.md" >&2
    exit 1
  fi
  for agent_dir in "$HOME/.codex/skills" "$HOME/.cursor/skills" "$HOME/.claude/skills"; do
    mkdir -p "$agent_dir"
    ln -sfn "$source_path" "$agent_dir/$skill"
    echo "Registered $skill in $agent_dir"
  done
done

validator_dir="$source_dir/olares-app-localize"
if command -v npm >/dev/null 2>&1; then
  npm install --prefix "$validator_dir" --omit=dev --ignore-scripts --no-audit --no-fund
else
  echo "Warning: npm was not found; the localization validator dependency was not installed." >&2
fi

echo "Skills registered. Restart the agent if they do not appear immediately."
