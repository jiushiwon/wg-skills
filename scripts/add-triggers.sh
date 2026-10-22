#!/usr/bin/env bash
# add-triggers.sh v2 — 轻量版（无 awk）
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

DRY_RUN="${1:-}"
ADDED=0; SKIPPED=0

for f in $(find vibeCoding -name "SKILL.md" -type f 2>/dev/null); do
    # 已有触发词标记则跳过
    if grep -qE '触发[词：:]|trigger:' "$f" 2>/dev/null; then
        SKIPPED=$((SKIPPED+1))
        continue
    fi

    # 读 name
    name=$(grep -E '^name:' "$f" 2>/dev/null | head -1 | sed 's/^name:[[:space:]]*//' | sed 's/[[:space:]]*$//')
    if [ -z "$name" ]; then
        SKIPPED=$((SKIPPED+1))
        continue
    fi

    # 读 H1 标题（首个 # 开头的非 frontmatter 行）
    title=$(grep -E '^# ' "$f" 2>/dev/null | head -1 | sed 's/^# //' | sed 's/[[:space:]]*$//')

    # 构造触发词：name 去 -skill 后缀 + title 关键词
    base_name="${name%-skill}"

    if [ -n "$title" ] && [ "$title" != "$base_name" ]; then
        # 简单拼接（不再做 keyword 提取，避免超时）
        line="${base_name}、${title}"
    else
        line="${base_name}"
    fi

    if [ "$DRY_RUN" = "dry-run" ]; then
        echo "DRY: $f → $line"
        ADDED=$((ADDED+1))
    else
        printf "\n## 触发词\n\n%s\n" "$line" >> "$f"
        ADDED=$((ADDED+1))
    fi
done

echo "已添加: $ADDED  跳过(已有): $SKIPPED"
