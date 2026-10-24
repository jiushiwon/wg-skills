/**
 * 由 components/_registry.json 生成 easycom 注册块
 *
 * 用法：node scripts/gen-easycom.js
 * 产物：easycom.json（复制到项目的 pages.json 里即可用全局标签）
 *
 * 为什么需要它：
 *   uni-app easycom 默认规则是 `components/组件名/组件名.vue`，
 *   而本模块按三层规范分目录：
 *     - 容器层 `containers/<name>/index.vue`
 *     - 组件层 `components/<category>/<name>/index.vue`
 *   两种目录都**不满足**默认规则 → 页面里写 `<base-card>` / `<base-button>`
 *   扫不到组件，表现为「标签不报错但页面空白」。
 *   所以必须显式给出 custom 规则，规则由注册表生成，不手写、不漏项。
 */
const fs = require('fs');
const path = require('path');

const SKILL = path.resolve(__dirname, '..');
const registry = JSON.parse(
  fs.readFileSync(path.join(SKILL, 'components/_registry.json'), 'utf8')
);

/** 注册表 path 是仓库相对路径，取末两段还原为项目内路径 */
function toProjectPath(item) {
  const segments = item.path.replace(/\/$/, '').split('/');
  const name = segments[segments.length - 1];
  if (item.kind === 'container') return `@/containers/${name}/index.vue`;
  if (item.kind === 'style') return null; // 纯样式类不是组件，不参与 easycom
  return `@/components/${item.category}/${name}/index.vue`;
}

const custom = {};
const missing = [];

for (const item of registry.components) {
  const projectPath = toProjectPath(item);
  if (!projectPath) continue;

  // 注册表 path 落在本模块外时，说明登记与实现脱节
  const abs = path.join(SKILL, projectPath.replace(/^@\//, ''));
  if (!fs.existsSync(abs)) {
    missing.push(`${item.name} -> ${projectPath}`);
    continue;
  }
  custom[`^${item.name}$`] = projectPath;
}

if (missing.length > 0) {
  console.error('注册表与实现不一致，以下组件无法生成 easycom 规则：');
  missing.forEach((m) => console.error('  ' + m));
  process.exit(1);
}

const output = {
  easycom: {
    autoscan: true,
    custom,
  },
};

const target = path.join(SKILL, 'easycom.json');
fs.writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`生成 easycom.json：${Object.keys(custom).length} 条注册规则`);
console.log('用法：把 easycom 字段合并进项目 src/pages.json');
