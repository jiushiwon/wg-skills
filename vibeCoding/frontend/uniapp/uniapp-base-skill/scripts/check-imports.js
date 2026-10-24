#!/usr/bin/env node
/**
 * base-skill 自检脚本：校验相对 import 与注册表路径真实存在
 *
 * 用法：node scripts/check-imports.js
 * 退出码：0 = 全通过；1 = 有错误
 *
 * 背景：内容型组件必须基于根容器（AGENTS.md §三 容器原则），
 * 容器 import 路径写错会导致编译期直接失败，且不易被肉眼发现。
 */
const fs = require('fs');
const path = require('path');

const SKILL = path.resolve(__dirname, '..');
const SCAN_DIRS = ['containers', 'components'];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.vue')) out.push(full);
  }
  return out;
}

const errors = [];

// 1) 相对 import 必须能解析到真实文件
const importRe = /from\s+['"](\.[^'"]+)['"]/g;
for (const dir of SCAN_DIRS) {
  for (const file of walk(path.join(SKILL, dir))) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(importRe)) {
      const target = path.resolve(path.dirname(file), match[1]);
      if (!fs.existsSync(target)) {
        errors.push(
          `[import] ${path.relative(SKILL, file)} -> ${match[1]}\n` +
          `         解析到 ${path.relative(SKILL, target)}，该文件不存在`
        );
      }
    }
  }
}

// 2) 注册表每条 path 必须真实存在
const registry = JSON.parse(
  fs.readFileSync(path.join(SKILL, 'components/_registry.json'), 'utf8')
);
const repoRoot = path.resolve(SKILL, '../../../..');
for (const item of registry.components) {
  const abs = path.resolve(repoRoot, item.path);
  if (!fs.existsSync(abs)) {
    errors.push(`[registry] ${item.name} 的 path 不存在：${item.path}`);
  }
}

// 3) 注册表登记的组件目录必须含 index.vue 与 props.json
for (const item of registry.components) {
  if (item.kind === 'style') continue;
  const abs = path.resolve(repoRoot, item.path);
  if (!fs.existsSync(abs)) continue;
  const entries = fs.readdirSync(abs);
  if (!entries.includes('index.vue')) {
    errors.push(`[registry] ${item.name} 缺 index.vue：${item.path}`);
  }
  if (!entries.includes('props.json')) {
    errors.push(`[registry] ${item.name} 缺 props.json：${item.path}`);
  }
}

if (errors.length > 0) {
  console.error(`base-skill 自检未通过，共 ${errors.length} 项：\n`);
  errors.forEach((e) => console.error('  ' + e));
  process.exit(1);
}

console.log('base-skill 自检通过：相对 import 全部可解析，注册表路径与组件契约文件齐全。');
