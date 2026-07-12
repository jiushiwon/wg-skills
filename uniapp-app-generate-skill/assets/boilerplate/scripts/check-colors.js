// 色阶外颜色硬卡：扫描业务代码（src 下除 styles/ 与 constants/colors.ts），
// 凡是不在 scripts/.theme-scale.json 白名单内的颜色字面量一律报错并 exit 1。
// 修改主题请先改 theme.json 再 npm run theme:sync 刷新白名单。
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'scripts/.theme-scale.json');
const extraAllowlistPath = path.join(root, 'scripts/color-allowlist.json');
const scanRoot = path.join(root, 'src');

const HEX_RE = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const RGB_RE = /\brgba?\([^)]*\)/gi;
const HSL_RE = /\bhsla?\([^)]*\)/gi;
const FILE_RE = /\.(vue|scss|ts)$/;

const NEUTRAL = new Set(['#ffffff', '#000000']); // #fff/#000 归一后落到此
const TRANSPARENT_KEYWORDS = new Set(['transparent']);

function loadAllowlist() {
  if (!fs.existsSync(manifestPath)) {
    console.error('[check-colors] 缺少 scripts/.theme-scale.json，请先运行 npm run theme:sync');
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const set = new Set((manifest.allowed || []).map((c) => c.toLowerCase()));

  if (fs.existsSync(extraAllowlistPath)) {
    const extra = JSON.parse(fs.readFileSync(extraAllowlistPath, 'utf8'));
    for (const c of extra.allowed || extra || []) {
      const norm = normalizeHex(String(c));
      if (norm) set.add(norm);
    }
  }

  for (const c of NEUTRAL) set.add(c);
  return set;
}

// 返回 6 位小写 hex（带 #）；若含非 opaque 的 alpha，返回 null（视为违规）
function normalizeHex(raw) {
  let s = raw.trim().toLowerCase();
  if (!s.startsWith('#')) return null;
  s = s.slice(1);
  if (s.length === 3) {
    s = s.split('').map((c) => c + c).join('');
  } else if (s.length === 4) {
    if (s[3] !== 'f') return null;
    s = s.slice(0, 3).split('').map((c) => c + c).join('');
  } else if (s.length === 8) {
    if (s.slice(6) !== 'ff') return null;
    s = s.slice(0, 6);
  } else if (s.length !== 6) {
    return null;
  }
  return `#${s}`;
}

// rgba(*, 0) 视为透明，允许；其余 rgb()/hsl() 函数字面量一律要求走 token，判违规
function isTransparentFunction(raw) {
  const m = raw.match(/rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*0\s*\)/i);
  return Boolean(m);
}

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else if (FILE_RE.test(entry.name)) {
      acc.push(full);
    }
  }
}

function isExcluded(fullPath) {
  const rel = path.relative(root, fullPath).replace(/\\/g, '/');
  if (rel.startsWith('src/styles/')) return true; // token 定义自身，豁免
  if (rel === 'src/constants/colors.ts') return true; // 生成的色阶常量，豁免
  return false;
}

function checkFile(fullPath, allowlist) {
  const rel = path.relative(root, fullPath).replace(/\\/g, '/');
  const text = fs.readFileSync(fullPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const violations = [];

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;

    for (const match of line.matchAll(HEX_RE)) {
      const raw = match[0];
      const norm = normalizeHex(raw);
      if (!norm || !allowlist.has(norm)) {
        violations.push(`${rel}:${lineNo}: ${raw}`);
      }
    }

    for (const match of line.matchAll(RGB_RE)) {
      const raw = match[0];
      if (!isTransparentFunction(raw)) {
        violations.push(`${rel}:${lineNo}: ${raw} (rgb/rgba 请改用 token)`);
      }
    }

    for (const match of line.matchAll(HSL_RE)) {
      violations.push(`${rel}:${lineNo}: ${match[0]} (hsl/hsla 请改用 token)`);
    }
  });

  return violations;
}

function main() {
  const allowlist = loadAllowlist();
  const files = [];
  walk(scanRoot, files);

  const violations = [];
  for (const file of files) {
    if (isExcluded(file)) continue;
    violations.push(...checkFile(file, allowlist));
  }

  // 抑制未使用变量的 lint 噪声（透明关键字集合保留作语义说明）
  void TRANSPARENT_KEYWORDS;

  if (violations.length) {
    console.error(`[check-colors] 发现 ${violations.length} 处色阶外颜色：`);
    for (const v of violations) console.error(`  ${v}`);
    console.error('\n请改用 $primary-*/$gray-*/$color-* 等语义/色阶 token；确需例外请写入 scripts/color-allowlist.json。');
    process.exit(1);
  }

  console.log(`[check-colors] OK：扫描 ${files.length} 个文件，颜色均在色阶白名单内。`);
}

main();
