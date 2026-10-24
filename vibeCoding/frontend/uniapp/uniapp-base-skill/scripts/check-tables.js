#!/usr/bin/env node
/**
 * base-skill 自检脚本：校验 commands/*.md 的 GFM 表格未被未转义的竖线打断
 *
 * 用法：node scripts/check-tables.js
 * 退出码：0 = 全部表格列数一致；1 = 有破表
 *
 * 背景：props 的类型列形如 `'primary' | 'ghost'`，竖线必须写成 \|，
 * 否则 Markdown 表格会被截断（AGENTS.md §六 表格用 GFM）。
 */
const fs = require('fs');
const path = require('path');

const CMD_DIR = path.resolve(__dirname, '../commands');
const ESCAPED_PIPE = '¦'; // 占位符，先摘掉转义竖线再数列

const errors = [];
let checked = 0;

for (const file of fs.readdirSync(CMD_DIR).filter((f) => f.endsWith('.md'))) {
  const lines = fs.readFileSync(path.join(CMD_DIR, file), 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (!line.trim().startsWith('|')) return;
    checked++;
    const normalized = line.replace(/\\\|/g, ESCAPED_PIPE);
    const cells = normalized.split('|').length - 1;
    // 合法列数：2 列表格（名称+说明）或 4 列表格（名称+类型+默认值+说明）
    if (cells !== 3 && cells !== 5) {
      errors.push(`[table] commands/${file}:${index + 1} 列数=${cells}，表格被打断 -> ${line.slice(0, 90)}`);
    }
  });
}

if (errors.length > 0) {
  console.error(`命令文档表格自检未通过，共 ${errors.length} 处：\n`);
  errors.forEach((e) => console.error('  ' + e));
  process.exit(1);
}

console.log(`命令文档表格自检通过：${checked} 行表格列数一致。`);
