#!/usr/bin/env bash
# verify.sh — 端到端验证脚本
# 用法：bash demo/verify.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

echo "=== Frontend UI Foundry — 端到端验证 ==="
echo ""

# 1. detect-stack 测试
echo "--- 1. detect-stack 脚本测试 ---"
node "$ROOT/scripts/detect-stack.mjs" "$ROOT" 2>&1 | head -20
echo ""

# 2. extract-tokens 测试
echo "--- 2. extract-tokens 脚本测试 ---"
node "$ROOT/scripts/extract-tokens.mjs" "$ROOT" 2>&1 | head -30
echo ""

# 3. match-profile 测试（先 extract，再 match）
echo "--- 3. match-profile 脚本测试 ---"
node "$ROOT/scripts/extract-tokens.mjs" "$ROOT" > /tmp/tokens.json
node "$ROOT/scripts/match-profile.mjs" /tmp/tokens.json 2>&1 | head -40
echo ""

# 4. verify-output 测试
echo "--- 4. verify-output 脚本测试 ---"
node "$ROOT/scripts/verify-output.mjs" "$ROOT" /tmp/verify-result.json 2>&1 | tail -30
echo ""

# 5. 文件清单检查
echo "--- 5. 文件清单检查 ---"
echo "SKILL.md: $(test -f "$ROOT/SKILL.md" && echo ✓ || echo ✗)"
echo "anti-patterns.md: $(test -f "$ROOT/references/anti-patterns.md" && echo ✓ || echo ✗)"

echo ""
echo "Tokens（6 份）:"
for f in color-palettes typography spacing-scale radius-elevation motion layout-grid; do
  echo "  $f.md: $(test -f "$ROOT/references/tokens/$f.md" && echo ✓ || echo ✗)"
done

echo ""
echo "场景（8 个）:"
for s in mobile-responsive pc-corporate admin-dashboard landing-marketing docs-site fintech-app mobile-native threejs-3d; do
  echo "  $s.md: $(test -f "$ROOT/references/scenarios/$s.md" && echo ✓ || echo ✗)"
done

echo ""
echo "品牌（10 个详细卡）:"
for b in stripe linear vercel apple supabase mintlify revolut lovable cursor claude; do
  echo "  $b.md: $(test -f "$ROOT/references/brands/$b.md" && echo ✓ || echo ✗)"
done
echo "  index.md: $(test -f "$ROOT/references/brands/index.md" && echo ✓ || echo ✗)"

echo ""
echo "技术栈（6 个）:"
for s in html-tailwind react-nextjs vue-nuxt uniapp react-native svelte; do
  echo "  $s.md: $(test -f "$ROOT/references/stacks/$s.md" && echo ✓ || echo ✗)"
done

echo ""
echo "子命令（8 个）:"
for c in forge optimize tokens unify audit brand scenario stack; do
  echo "  $c.md: $(test -f "$ROOT/references/commands/$c.md" && echo ✓ || echo ✗)"
done

echo ""
echo "脚本（4 个）:"
for s in detect-stack extract-tokens match-profile verify-output; do
  echo "  $s.mjs: $(test -f "$ROOT/scripts/$s.mjs" && echo ✓ || echo ✗)"
done

echo ""
echo "模板:"
for t in tokens.css.tpl tokens.tailwind.tpl; do
  echo "  $t: $(test -f "$ROOT/templates/$t" && echo ✓ || echo ✗)"
done

echo ""
echo "=== 验证完成 ==="
