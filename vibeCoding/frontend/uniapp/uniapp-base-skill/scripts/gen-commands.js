/**
 * 由 components/_registry.json + 各组件 props.json 生成 commands/*.md
 * 保证索引与实现永远同步（STANDARD C09）。
 *
 * 用法：node scripts/gen-commands.js
 *
 * 组件契约真源：
 *   - 容器   → containers/<name>/props.json
 *   - 组件   → components/<category>/<name>/props.json
 *   - 样式类 → styles/<dir>/props.json（dir 取注册表 path 的末段）
 */
const fs = require('fs');
const path = require('path');

const SKILL = path.join(__dirname, '..');
const BASE = SKILL;

const registry = JSON.parse(fs.readFileSync(path.join(SKILL, 'components/_registry.json'), 'utf8'));

const CAT_TITLE = {
  container: '根容器',
  form: '表单类',
  feedback: '反馈类',
  list: '列表类',
  navigation: '导航类',
  business: '业务类',
  style: '样式类',
};

const EMPTY = '';

function mdEscape(v) {
  return String(v).replace(/\|/g, '\\|');
}

function fmtDefault(v) {
  if (v === '' || v === undefined || v === null) return EMPTY;
  if (typeof v === 'boolean') return `\`${v}\``;
  if (typeof v === 'number') return `\`${v}\``;
  if (Array.isArray(v)) return `\`[]\``;
  const s = String(v);
  if (s === '') return EMPTY;
  return `\`${mdEscape(s)}\``;
}

/** 定位组件契约文件：容器在 containers/，组件在 components/<category>/，样式类在 styles/<dir>/ */
function contractPath(c) {
  if (c.kind === 'container') return path.join(BASE, 'containers', c.name, 'props.json');
  if (c.kind === 'style') return path.join(BASE, 'styles', path.basename(c.path), 'props.json');
  return path.join(BASE, 'components', c.category, c.name, 'props.json');
}

/** 定位组件用法文档 */
function usagePath(c) {
  if (c.kind === 'container') return path.join(BASE, 'containers', c.name, 'usage.md');
  if (c.kind === 'style') return path.join(BASE, 'styles', path.basename(c.path), 'usage.md');
  return path.join(BASE, 'components', c.category, c.name, 'usage.md');
}

function readContract(c) {
  const p = contractPath(c);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

const byCat = {};
for (const c of registry.components) {
  (byCat[c.category] ||= []).push(c);
}

const outDir = path.join(SKILL, 'commands');
fs.mkdirSync(outDir, { recursive: true });

// 清理旧分类文件
for (const f of fs.readdirSync(outDir)) {
  if (f.endsWith('.md')) fs.unlinkSync(path.join(outDir, f));
}

const missing = [];

for (const cat of Object.keys(CAT_TITLE)) {
  const list = byCat[cat] || [];
  const lines = [];
  lines.push(`# ${CAT_TITLE[cat]}组件（${cat}）`);
  lines.push('');
  lines.push('> 实现真源：`vibeCoding/frontend/uniapp/uniapp-base-skill/`（本模块即实现层）');
  lines.push('> 本文件由 `components/_registry.json` + 各组件 `props.json` 同步生成，**改实现必须重新生成本文件**。');
  lines.push('> 重新生成：`node scripts/gen-commands.js`');
  lines.push('');

  lines.push('## 总览');
  lines.push('');
  lines.push('| 组件 | 说明 | 别名 | 类型 |');
  lines.push('|------|------|------|------|');
  for (const c of list) {
    const contract = readContract(c);
    const desc = contract?.description || '';
    const kindLabel = { container: '容器', component: '组件', style: '样式类' }[c.kind] || c.kind;
    lines.push(
      `| \`${c.name}\` | ${mdEscape(desc)} | ${c.aliases.map((a) => mdEscape(a)).join(' / ')} | ${kindLabel} |`,
    );
  }
  lines.push('');

  for (const c of list) {
    const contract = readContract(c);
    if (!contract) {
      missing.push(`${c.name} → ${contractPath(c)}`);
    }

    lines.push('---');
    lines.push('');
    lines.push(`## ${c.name} ${c.title}`);
    lines.push('');
    lines.push(`**说明**：${contract?.description || ''}`);
    lines.push('');
    lines.push(`**别名**：${c.aliases.join('、')}`);
    lines.push('');
    lines.push(`**路径**：\`${c.path}\``);
    lines.push('');

    const props = contract?.props || [];
    const events = contract?.events || [];
    const slots = contract?.slots || [];
    const classes = contract?.classes || {};

    if (props.length) {
      lines.push('**属性**：');
      lines.push('');
      lines.push('| 名称 | 类型 | 默认值 | 说明 |');
      lines.push('|------|------|--------|------|');
      for (const pr of props) {
        lines.push(
          `| \`${pr.name}\` | \`${pr.type}\` | ${fmtDefault(pr.default)} | ${mdEscape(pr.desc || '')} |`,
        );
      }
      lines.push('');
    }

    if (events.length) {
      lines.push('**事件**：');
      lines.push('');
      for (const e of events) lines.push(`- \`${e}\``);
      lines.push('');
    }

    if (slots.length) {
      lines.push('**插槽**：');
      lines.push('');
      lines.push('| 名称 | 说明 |');
      lines.push('|------|------|');
      for (const s of slots) lines.push(`| \`${s.name}\` | ${mdEscape(s.desc || '')} |`);
      lines.push('');
    }

    const classNames = Object.keys(classes);
    if (classNames.length) {
      lines.push('**CSS 类**：');
      lines.push('');
      lines.push('| 类名 | 说明 |');
      lines.push('|------|------|');
      for (const cn of classNames) lines.push(`| \`${cn}\` | ${mdEscape(classes[cn] || '')} |`);
      lines.push('');
    }

    const u = usagePath(c);
    if (fs.existsSync(u)) {
      lines.push(`**用法**：见 [usage.md](${path.relative(outDir, u).replace(/\\/g, '/')})`);
      lines.push('');
    }
  }

  fs.writeFileSync(path.join(outDir, `${cat}.md`), lines.join('\n'), 'utf8');
  console.log(`生成 commands/${cat}.md（${list.length} 个组件）`);
}

if (missing.length) {
  console.log('缺少契约文件：');
  for (const m of missing) console.log(`  ${m}`);
  process.exitCode = 1;
}
