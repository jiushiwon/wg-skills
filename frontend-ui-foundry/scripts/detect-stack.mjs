#!/usr/bin/env node
/**
 * detect-stack.mjs — 自动识别项目技术栈
 * 用法：node detect-stack.mjs [path]
 * 输出：{ stack, framework, version, ui, files, ... }
 */

import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();

function exists(p) {
  try { return fs.existsSync(p); } catch { return false; }
}

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function globFiles(dir, patterns, maxDepth = 3) {
  const results = [];
  function walk(d, depth) {
    if (depth > maxDepth) return;
    if (!exists(d)) return;
    const stat = fs.statSync(d);
    if (!stat.isDirectory()) return;
    for (const entry of fs.readdirSync(d)) {
      if (['node_modules', 'dist', 'build', '.git', '.next', 'unpackage', '.nuxt', '.svelte-kit', '.output'].includes(entry)) continue;
      const full = path.join(d, entry);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full, depth + 1);
      else if (patterns.some(re => re.test(entry))) results.push(full);
    }
  }
  walk(dir, 0);
  return results;
}

const result = {
  root,
  stack: 'unknown',
  framework: null,
  version: null,
  ui: null,
  language: null,
  bundler: null,
  features: {},
  files: {
    packageJson: exists(path.join(root, 'package.json')),
    manifest: exists(path.join(root, 'manifest.json')),
    pagesJson: exists(path.join(root, 'pages.json')),
    tsconfig: exists(path.join(root, 'tsconfig.json')),
    tailwindConfig: exists(path.join(root, 'tailwind.config.js')) || exists(path.join(root, 'tailwind.config.ts')),
    viteConfig: exists(path.join(root, 'vite.config.js')) || exists(path.join(root, 'vite.config.ts')),
  },
};

// === package.json 解析 ===
const pkg = readJSON(path.join(root, 'package.json'));
if (pkg) {
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  // 框架
  if (allDeps.next) {
    result.stack = 'react-nextjs';
    result.framework = 'Next.js';
    result.version = allDeps.next;
  } else if (allDeps.nuxt || allDeps['nuxt3']) {
    result.stack = 'vue-nuxt';
    result.framework = 'Nuxt';
    result.version = allDeps.nuxt || allDeps['nuxt3'];
  } else if (allDeps['@sveltejs/kit']) {
    result.stack = 'svelte';
    result.framework = 'SvelteKit';
    result.version = allDeps['@sveltejs/kit'];
  } else if (allDeps['react-native']) {
    result.stack = 'react-native';
    result.framework = 'React Native';
    result.version = allDeps['react-native'];
  } else if (allDeps.vue) {
    result.stack = 'vue';
    result.framework = 'Vue';
    result.version = allDeps.vue;
  } else if (allDeps.react) {
    result.stack = 'react';
    result.framework = 'React';
    result.version = allDeps.react;
  }

  // UI 库
  if (allDeps['antd']) result.ui = 'Ant Design';
  else if (allDeps['@mui/material']) result.ui = 'MUI';
  else if (allDeps['@chakra-ui/react']) result.ui = 'Chakra UI';
  else if (allDeps['element-plus']) result.ui = 'Element Plus';
  else if (allDeps['vant']) result.ui = 'Vant';
  else if (allDeps['@radix-ui/react-*']) result.ui = 'Radix UI';
  else if (allDeps['shadcn']) result.ui = 'shadcn/ui';
  else if (allDeps.tailwindcss) result.ui = 'Tailwind CSS';

  // 构建工具
  if (allDeps.vite) result.bundler = 'Vite';
  else if (allDeps.webpack) result.bundler = 'Webpack';
  else if (allDeps.parcel) result.bundler = 'Parcel';

  // 语言
  if (allDeps.typescript || exists(path.join(root, 'tsconfig.json'))) {
    result.language = 'TypeScript';
  } else {
    result.language = 'JavaScript';
  }

  // 特性
  result.features = {
    typescript: !!allDeps.typescript,
    tailwind: !!allDeps.tailwindcss,
    eslint: !!allDeps.eslint,
    prettier: !!allDeps.prettier,
    testing: !!(allDeps.vitest || allDeps.jest || allDeps['@playwright/test']),
    stateManagement: allDeps.pinia ? 'Pinia' : allDeps.zustand ? 'Zustand' : allDeps.redux ? 'Redux' : null,
  };
}

// === manifest.json (uniapp 小程序) ===
if (exists(path.join(root, 'manifest.json'))) {
  const m = readJSON(path.join(root, 'manifest.json'));
  if (m?.mp-weixin || m?.['app-plus']) {
    result.stack = 'uniapp';
    result.framework = 'uniapp';
    result.platform = Object.keys(m).filter(k => ['mp-weixin', 'mp-alipay', 'mp-baidu', 'app-plus', 'h5'].includes(k));
  }
}

// === pages.json (uniapp) ===
if (exists(path.join(root, 'pages.json'))) {
  result.stack = 'uniapp';
  result.framework = 'uniapp';
}

// === 纯静态 HTML ===
if (result.stack === 'unknown') {
  const htmlFiles = globFiles(root, [/\.html$/]);
  if (htmlFiles.length > 0) {
    result.stack = 'html-tailwind';
    result.framework = 'Static HTML';
    result.files.htmlCount = htmlFiles.length;
  }
}

// === 统计文件类型 ===
const allFiles = globFiles(root, [/\.(vue|tsx|jsx|svelte)$/]);
result.files.componentCount = allFiles.length;

const cssFiles = globFiles(root, [/\.(css|scss|sass|less)$/]);
result.files.styleCount = cssFiles.length;

// === 推断项目规模 ===
if (allFiles.length === 0) result.scale = 'empty';
else if (allFiles.length < 20) result.scale = 'small';
else if (allFiles.length < 100) result.scale = 'medium';
else result.scale = 'large';

console.log(JSON.stringify(result, null, 2));
