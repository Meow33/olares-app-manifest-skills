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

echo "Skills registered. Restart the agent if they do not appear immediately."

