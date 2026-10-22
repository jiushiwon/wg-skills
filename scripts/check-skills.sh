#!/usr/bin/env bash
# check-skills.sh — wg-skills 仓库 skill 健康检查
#
# 用途：CI 必跑，校验以下 5 项：
#   1. SKILL.md 数量与 .expected-count 一致
#   2. 每个 SKILL.md 有 name + description frontmatter
#   3. 触发词缺失检测（description 无任何触发词标记）
#   4. 引用了不存在目录的 skill 名
#   5. README.md 顶部数字与实际 SKILL.md 数量一致
#   6. *-skill 目录必须位于 vibeCoding/ 或 others/ 下（防误建副本）
#
# 用法：
#   bash scripts/check-skills.sh           # 全量检查
#   bash scripts/check-skills.sh count     # 只查数量
#   bash scripts/check-skills.sh front     # 只查 frontmatter
#   bash scripts/check-skills.sh missing   # 只查缺失引用
#   bash scripts/check-skills.sh readme    # 只查 README 数字
#   bash scripts/check-skills.sh layout    # 只查技能目录位置
#
# 退出码：0=通过；1=有错误；2=有警告

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# ---- 颜色（仅交互终端） ----
if [ -t 1 ]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; BLUE='\033[0;34m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; NC=''
fi

ok()   { echo -e "${GREEN}✓${NC} $*"; }
fail() { echo -e "${RED}✗${NC} $*"; ERRORS=$((ERRORS+1)); }
warn() { echo -e "${YELLOW}⚠${NC} $*"; WARNINGS=$((WARNINGS+1)); }
info() { echo -e "${BLUE}ℹ${NC} $*"; }

ERRORS=0
WARNINGS=0

# ---- 检查 1: SKILL.md 数量 ----
check_count() {
    local count
    count=$(find vibeCoding others -name "SKILL.md" -type f 2>/dev/null | wc -l | tr -d ' ')
    # 从 README 提取数字
    local readme_count
    readme_count=$(grep -oE '\*\*[0-9]+ 个\*\*' README.md 2>/dev/null | head -1 | grep -oE '[0-9]+' || echo "0")
    if [ "$count" = "$readme_count" ]; then
        ok "数量: 实际 $count = README 标记 $readme_count"
    else
        fail "数量: 实际 $count ≠ README 标记 $readme_count"
        info "  修复：find . -name SKILL.md | wc -l 后改 README.md"
    fi
}

# ---- 检查 2: frontmatter 完整性 ----
check_frontmatter() {
    local total=0 missing_name=0 missing_desc=0
    while IFS= read -r f; do
        total=$((total+1))
        if ! grep -qE '^name:' "$f" 2>/dev/null; then
            fail "frontmatter 缺 name: $f"
            missing_name=$((missing_name+1))
        fi
        if ! grep -qE '^description:' "$f" 2>/dev/null; then
            fail "frontmatter 缺 description: $f"
            missing_desc=$((missing_desc+1))
        fi
    done < <(find vibeCoding others -name "SKILL.md" -type f 2>/dev/null)
    if [ "$missing_name" -eq 0 ] && [ "$missing_desc" -eq 0 ]; then
        ok "frontmatter: $total 个 SKILL.md 全部含 name+description"
    fi
}

# ---- 检查 3: 触发词缺失（description 无任何触发词） ----
check_triggers() {
    # 触发词标记：「触发词」「触发：」「trigger」
    local total=0 missing=0
    while IFS= read -r f; do
        total=$((total+1))
        if ! grep -qE '触发[词：:]|trigger:' "$f" 2>/dev/null; then
            warn "触发词缺失: $f"
            missing=$((missing+1))
        fi
    done < <(find vibeCoding others -name "SKILL.md" -type f 2>/dev/null)
    if [ "$missing" -eq 0 ]; then
        ok "触发词: $total 个 SKILL.md 全部含触发词"
    else
        info "  $missing/$total 缺触发词，建议在 description 末尾加 '触发词：...' 段"
    fi
}

# ---- 检查 4: 引用了不存在的 skill ----
# v1 简化版：精确目录名匹配 + 豁免私有仓库
# 已知限制：不识别带前缀的短名（如 auth-module-skill → springboot-auth-module-skill）
# v2 改进：scripts/skill-name-map.txt 短名→长名映射
check_missing_refs() {
    # 已知在私有仓库的 skill（豁免列表）
    local missing_list_file="MISSING_SKILLS.md"
    if [ ! -f "$missing_list_file" ]; then
        warn "$missing_list_file 不存在，跳过 missing-refs 检查"
        return
    fi

    # 从 MISSING_SKILLS.md 提取 skill 名
    local private_skills
    private_skills=$(grep -oE '\*\*`[a-z-]+-skill`\*\*' "$missing_list_file" | sed 's/\*\*`//;s/`\*\*//' | sort -u)

    # 从所有 .md 提取所有 *-skill 名
    local all_refs
    all_refs=$(grep -rhoE '\b[a-z][a-z0-9-]*-skill\b' --include="*.md" . 2>/dev/null | sort -u)

    local total_refs=0 broken_refs=0 false_positives=0
    while IFS= read -r skill; do
        [ -z "$skill" ] && continue
        total_refs=$((total_refs+1))
        # 豁免私有仓库 skill
        if echo "$private_skills" | grep -qF "$skill"; then
            continue
        fi
        # 精确目录名匹配
        if find vibeCoding -type d -name "$skill" 2>/dev/null | grep -q .; then
            continue
        fi
        # 模糊匹配：目录名包含 skill（处理带前缀的情况）
        # 例：auth-module-skill → springboot-auth-module-skill
        if find vibeCoding -type d -name "*-${skill}" 2>/dev/null | grep -q .; then
            false_positives=$((false_positives+1))
            continue
        fi
        warn "可能引用了不存在的 skill: $skill（v1 简化版，建议人工核对）"
        broken_refs=$((broken_refs+1))
    done <<< "$all_refs"
    if [ "$broken_refs" -eq 0 ]; then
        ok "引用: $total_refs 个 *-skill 引用全部找到目录（$false_positives 个带前缀短名已模糊匹配）"
    fi
}

# ---- 检查 5: README 数字 ----
check_readme() {
    local count
    count=$(find vibeCoding others -name "SKILL.md" -type f 2>/dev/null | wc -l | tr -d ' ')
    local declared
    declared=$(grep -oE '\*\*[0-9]+ 个\*\*' README.md 2>/dev/null | head -1 | grep -oE '[0-9]+' || echo "0")
    if [ "$count" = "$declared" ]; then
        ok "README 数字: $count = 实际"
    else
        warn "README 数字: 标记 $declared ≠ 实际 $count（不阻塞，可后续校准）"
    fi
}

# ---- 检查 6: 技能目录位置 ----
# 所有 *-skill 目录必须位于 vibeCoding/ 或 others/ 之下。
# 防止在仓库根（或其它层）误建技能目录副本（曾出现 vue-base-skill/vue-empty-skill/）。
check_layout() {
    local bad
    bad=$(find . -type d -name "*-skill" \
        -not -path "./vibeCoding/*" \
        -not -path "./others/*" \
        -not -path "./.git/*" \
        -not -path "./docs/*" \
        -not -path "./graphify-out/*" \
        -not -path "./.claude/*" \
        -not -path "./.superpowers/*" \
        -not -path "./.worktrees/*" \
        -not -path "*/node_modules/*" \
        -not -path "*/unpackage/*" 2>/dev/null)

    if [ -n "$bad" ]; then
        while IFS= read -r d; do
            [ -z "$d" ] && continue
            fail "技能目录位置错误（应在 vibeCoding/ 或 others/ 下）: $d"
        done <<< "$bad"
    else
        ok "所有 *-skill 目录均在 vibeCoding/ 或 others/ 下"
    fi
}

# ---- 主入口 ----
MODE="${1:-all}"

case "$MODE" in
    count)    check_count ;;
    front)    check_frontmatter ;;
    triggers) check_triggers ;;
    missing)  check_missing_refs ;;
    readme)   check_readme ;;
    layout)   check_layout ;;
    all)
        echo "=== wg-skills 健康检查 ==="
        check_count
        check_frontmatter
        check_triggers
        check_missing_refs
        check_readme
        check_layout
        ;;
    *)
        echo "用法: $0 {all|count|front|triggers|missing|readme|layout}"
        exit 2
        ;;
esac

echo
echo "=== 汇总 ==="
echo "  错误: $ERRORS"
echo "  警告: $WARNINGS"
if [ "$ERRORS" -gt 0 ]; then
    exit 1
fi
exit 0
