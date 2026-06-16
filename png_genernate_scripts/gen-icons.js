#!/usr/bin/env node
/**
 * 智能图标生成器 —— 一站式生成项目中所有需要的图标
 *
 * 用法:
 *     node scripts/gen-icons.js           # 全量生成
 *     node scripts/gen-icons.js --dry-run # 只扫描需求，不生成文件
 *     node scripts/gen-icons.js --clean   # 清理后重新生成
 *
 * 流程:
 *   1. 扫描项目需求（tabBar、分享图、页面引用）
 *   2. 根据语义自动匹配 SVG 路径
 *   3. 生成 SVG → 转 PNG（多尺寸、多颜色）
 *   4. 自动修复 pages.json 缺失的 iconPath
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BASE_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(BASE_DIR, 'src');
const STATIC_DIR = path.join(SRC_DIR, 'static');

// ========== 主题色配置（与项目一致）==========
const THEME = {
  primary: '#7BA59D',
  tabDefault: '#8C8C8C',
  tabSelected: '#7BA59D',
  bgPage: '#F5F7F4',
};

// ========== SVG 图标路径库 ==========
// 风格：现代线性图标，1.8px 描边，圆角端点
const ICON_PATHS = {
  home: {
    paths: [
      'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      'M9 22V12h6v10',
    ],
  },
  dashboard: {
    paths: [
      'M3 3v18h18',
      'M18 17V9',
      'M13 17V5',
      'M8 17v-3',
    ],
  },
  profile: {
    paths: [
      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
      'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    ],
  },
  chart: {
    paths: [
      'M18 20V10',
      'M12 20V4',
      'M6 20v-6',
    ],
  },
  person: {
    paths: [
      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
      'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    ],
  },
  settings: {
    paths: [
      'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
    ],
  },
  search: {
    paths: [
      'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
      'M21 21l-4.35-4.35',
    ],
  },
  bell: {
    paths: [
      'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9',
      'M13.73 21a2 2 0 0 1-3.46 0',
    ],
  },
  heart: {
    paths: [
      'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    ],
  },
  star: {
    paths: [
      'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    ],
  },
  check: {
    paths: [
      'M20 6L9 17l-5-5',
    ],
  },
  close: {
    paths: [
      'M18 6L6 18',
      'M6 6l12 12',
    ],
  },
  arrowRight: {
    paths: [
      'M5 12h14',
      'M12 5l7 7-7 7',
    ],
  },
  arrowLeft: {
    paths: [
      'M19 12H5',
      'M12 19l-7-7 7-7',
    ],
  },
  plus: {
    paths: [
      'M12 5v14',
      'M5 12h14',
    ],
  },
  trash: {
    paths: [
      'M3 6h18',
      'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    ],
  },
  edit: {
    paths: [
      'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
      'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    ],
  },
  eye: {
    paths: [
      'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z',
      'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    ],
  },
  calendar: {
    paths: [
      'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
      'M16 2v4',
      'M8 2v4',
      'M3 10h18',
    ],
  },
  trophy: {
    paths: [
      'M6 9H4.5a2.5 2.5 0 0 1 0-5H6',
      'M18 9h1.5a2.5 2.5 0 0 0 0-5H18',
      'M4 22h16',
      'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22',
      'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22',
      'M18 2H6v7a6 6 0 0 0 12 0V2z',
    ],
  },
  fire: {
    paths: [
      'M12 2c0 0-7 4-7 11v3l-2 2h18l-2-2v-3c0-7-7-11-7-11z',
      'M12 14a2 2 0 0 1-2-2c0-1.5 2-3 2-3s2 1.5 2 3a2 2 0 0 1-2 2z',
    ],
  },
  document: {
    paths: [
      'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
      'M14 2v6h6',
      'M16 13H8',
      'M16 17H8',
    ],
  },
  location: {
    paths: [
      'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
      'M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    ],
  },
  more: {
    paths: [
      'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
      'M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
      'M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
    ],
  },
  // 中文别名映射
  '首页': { alias: 'home' },
  '主页': { alias: 'home' },
  '房子': { alias: 'home' },
  '数据': { alias: 'dashboard' },
  '图表': { alias: 'dashboard' },
  '统计': { alias: 'dashboard' },
  '我的': { alias: 'profile' },
  '个人': { alias: 'profile' },
  '用户': { alias: 'person' },
  '人物': { alias: 'person' },
  '聊天': { alias: 'chat' },
  '消息': { alias: 'chat' },
  '时钟': { alias: 'clock' },
  '历史': { alias: 'clock' },
  '设置': { alias: 'settings' },
  '齿轮': { alias: 'settings' },
  '搜索': { alias: 'search' },
  '查找': { alias: 'search' },
  '铃铛': { alias: 'bell' },
  '通知': { alias: 'bell' },
  '心': { alias: 'heart' },
  '健康': { alias: 'heart' },
  '星星': { alias: 'star' },
  '收藏': { alias: 'star' },
  '对勾': { alias: 'check' },
  '完成': { alias: 'check' },
  '关闭': { alias: 'close' },
  '叉': { alias: 'close' },
  '添加': { alias: 'plus' },
  '加': { alias: 'plus' },
  '删除': { alias: 'trash' },
  '垃圾桶': { alias: 'trash' },
  '编辑': { alias: 'edit' },
  '修改': { alias: 'edit' },
  '眼睛': { alias: 'eye' },
  '查看': { alias: 'eye' },
  '日历': { alias: 'calendar' },
  '日期': { alias: 'calendar' },
  '奖杯': { alias: 'trophy' },
  '成就': { alias: 'trophy' },
  '火': { alias: 'fire' },
  '运动': { alias: 'fire' },
  '文件': { alias: 'document' },
  '文档': { alias: 'document' },
  '位置': { alias: 'location' },
  '地图': { alias: 'location' },
  '更多': { alias: 'more' },
};

// ========== 别名解析 ==========
function resolveIcon(name) {
  const key = name.trim();

  // 直接匹配
  if (ICON_PATHS[key]) {
    const info = ICON_PATHS[key];
    if (info.alias) {
      return resolveIcon(info.alias);
    }
    return { key, ...info };
  }

  // 小写匹配（英文）
  const lowerKey = key.toLowerCase();
  if (ICON_PATHS[lowerKey]) {
    const info = ICON_PATHS[lowerKey];
    if (info.alias) {
      return resolveIcon(info.alias);
    }
    return { key: lowerKey, ...info };
  }

  // 模糊匹配
  for (const [k, v] of Object.entries(ICON_PATHS)) {
    if (v.alias) continue;
    if (k.toLowerCase().includes(lowerKey) || lowerKey.includes(k.toLowerCase())) {
      return { key: k, ...v };
    }
  }

  return null;
}

// ========== SVG 生成 ==========
function buildSvg(paths, color, size = 48, strokeWidth = 1.8, filled = false) {
  const viewBox = '0 0 24 24';
  const pathEls = paths.map(d => {
    if (filled) {
      return `    <path d="${d}" fill="${color}" stroke="none"/>`;
    }
    return `    <path d="${d}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">
${pathEls}
</svg>`;
}

// ========== SVG → PNG 转换 ==========
async function svgToPng(svgContent, outPath, width, height) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svgContent))
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
}

// ========== 生成 tabBar 图标 ==========
async function genTabbarIcons(dryRun) {
  console.log('\n[SCAN] 扫描 tabBar 配置...');

  const pagesJson = JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'pages.json'), 'utf-8'));
  const tabBar = pagesJson.tabBar;
  if (!tabBar) {
    console.log('  [INFO] 未配置 tabBar');
    return { generated: 0, fixed: 0 };
  }

  let generated = 0;
  let fixed = 0;

  for (const item of tabBar.list) {
    const text = item.text;
    const iconInfo = resolveIcon(text);
    if (!iconInfo) {
      console.log(`  [WARN] 未找到 "${text}" 的图标定义`);
      continue;
    }

    // 自动修复缺失的 iconPath
    const needsFix = !item.iconPath || !item.selectedIconPath;
    if (needsFix) {
      const tabName = text === '首页' ? 'home' : text === '数据' ? 'dashboard' : text === '我的' ? 'profile' : iconInfo.key;
      item.iconPath = `static/tabbar/${tabName}.png`;
      item.selectedIconPath = `static/tabbar/${tabName}-active.png`;
      fixed++;
      if (!dryRun) {
        console.log(`  [FIX] ${text} -> iconPath: ${item.iconPath}`);
      }
    }

    // 提取文件名
    const iconFile = path.basename(item.iconPath, '.png');
    const activeFile = path.basename(item.selectedIconPath, '.png');

    const outDefault = path.join(STATIC_DIR, 'tabbar', `${iconFile}.png`);
    const outActive = path.join(STATIC_DIR, 'tabbar', `${activeFile}.png`);

    if (dryRun) {
      console.log(`  [NEED] ${text}: ${outDefault}, ${outActive}`);
      continue;
    }

    // 生成默认色（灰色）
    const svgDefault = buildSvg(iconInfo.paths, THEME.tabDefault, 81, 1.8, false);
    await svgToPng(svgDefault, outDefault, 81, 81);
    console.log(`  [OK] ${path.relative(BASE_DIR, outDefault)}`);

    // 生成选中色（主题色）
    const svgActive = buildSvg(iconInfo.paths, THEME.tabSelected, 81, 2.0, false);
    await svgToPng(svgActive, outActive, 81, 81);
    console.log(`  [OK] ${path.relative(BASE_DIR, outActive)}`);

    generated += 2;
  }

  // 写回 pages.json
  if (fixed > 0 && !dryRun) {
    fs.writeFileSync(path.join(SRC_DIR, 'pages.json'), JSON.stringify(pagesJson, null, 2) + '\n');
    console.log(`  [FIX] pages.json 已更新 (${fixed} 项)`);
  }

  return { generated, fixed };
}

// ========== 生成分享封面 ==========
async function genShareImage(dryRun) {
  console.log('\n[SCAN] 扫描分享图片引用...');

  // 扫描所有 .vue 文件中的 imageUrl 引用
  const vueFiles = [];
  function scanDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) scanDir(p);
      else if (entry.name.endsWith('.vue')) vueFiles.push(p);
    }
  }
  scanDir(SRC_DIR);

  const sharePaths = new Set();
  for (const f of vueFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const matches = content.matchAll(/imageUrl:\s*['"]([^'"]+)['"]/g);
    for (const m of matches) {
      sharePaths.add(m[1].replace(/^\//, ''));
    }
  }

  if (sharePaths.size === 0) {
    console.log('  [INFO] 未发现分享图片引用');
    return { generated: 0 };
  }

  let generated = 0;
  for (const sharePath of sharePaths) {
    const outPath = path.join(SRC_DIR, sharePath);
    if (dryRun) {
      console.log(`  [NEED] ${sharePath} -> ${outPath}`);
      continue;
    }

    if (fs.existsSync(outPath)) {
      console.log(`  [SKIP] 已存在: ${sharePath}`);
      continue;
    }

    // 用 sharp 直接创建分享封面（不依赖外部 SVG）
    await createShareCover(outPath);
    console.log(`  [OK] ${sharePath}`);
    generated++;
  }

  return { generated };
}

/**
 * 用 sharp 纯代码绘制分享封面
 * 不依赖任何外部 SVG 文件
 */
async function createShareCover(outPath) {
  const W = 500, H = 400;
  const primary = [123, 165, 157]; // #7BA59D
  const white = [255, 255, 255];

  // 1. 创建渐变背景
  const bgSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8F0EE"/>
      <stop offset="100%" stop-color="#D4E5E0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
</svg>`;

  let img = sharp(Buffer.from(bgSvg)).resize(W, H);

  // 2. 创建主卡片（圆角矩形）
  const cardW = 400, cardH = 260, cardR = 24;
  const cardX = (W - cardW) / 2;
  const cardY = 70;

  const cardSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${cardW}" height="${cardH}">
  <defs>
    <linearGradient id="c" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7BA59D"/>
      <stop offset="100%" stop-color="#6B968E"/>
    </linearGradient>
  </defs>
  <rect width="${cardW}" height="${cardH}" rx="${cardR}" fill="url(#c)"/>
</svg>`;

  const cardPng = await sharp(Buffer.from(cardSvg))
    .resize(cardW, cardH)
    .png()
    .toBuffer();

  // 3. 合成：背景 + 卡片
  img = img.composite([{
    input: cardPng,
    left: cardX,
    top: cardY,
  }]);

  // 4. 创建图标（房子图标，白色）
  const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <path d="M9 22V12h6v10"/>
</svg>`;

  const iconPng = await sharp(Buffer.from(iconSvg))
    .resize(48, 48)
    .png()
    .toBuffer();

  // 图标位置
  const iconX = cardX + 60;
  const iconY = cardY + 55;

  // 5. 创建标题文字
  const titleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="260" height="50">
  <text x="0" y="38" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="32" font-weight="bold" fill="white">久坐自救指南</text>
</svg>`;

  const titlePng = await sharp(Buffer.from(titleSvg))
    .resize(260, 50)
    .png()
    .toBuffer();

  // 6. 创建副标题
  const subSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="260" height="30">
  <text x="0" y="22" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="16" fill="white" opacity="0.85">每天3分钟，守护颈椎与眼睛</text>
</svg>`;

  const subPng = await sharp(Buffer.from(subSvg))
    .resize(260, 30)
    .png()
    .toBuffer();

  // 7. 创建标签
  const tags = ['健康评估', '每日打卡', '数据追踪'];
  const tagPngs = [];
  for (const tag of tags) {
    const tagSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="32">
  <rect width="100" height="32" rx="16" fill="white" opacity="0.2"/>
  <text x="50" y="22" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="13" fill="white" text-anchor="middle">${tag}</text>
</svg>`;
    const tp = await sharp(Buffer.from(tagSvg)).resize(100, 32).png().toBuffer();
    tagPngs.push(tp);
  }

  // 8. 创建底部文字
  const footerSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="24">
  <text x="200" y="18" font-family="Microsoft YaHei, PingFang SC, sans-serif" font-size="12" fill="#7BA59D" text-anchor="middle">给久坐屏幕族的健康生活方式小助手</text>
</svg>`;

  const footerPng = await sharp(Buffer.from(footerSvg))
    .resize(400, 24)
    .png()
    .toBuffer();

  // 9. 合成所有图层
  const composites = [
    { input: iconPng, left: iconX, top: iconY },
    { input: titlePng, left: iconX + 60, top: iconY - 5 },
    { input: subPng, left: iconX + 60, top: iconY + 32 },
    { input: tagPngs[0], left: cardX + 30, top: cardY + 155 },
    { input: tagPngs[1], left: cardX + 150, top: cardY + 155 },
    { input: tagPngs[2], left: cardX + 270, top: cardY + 155 },
    { input: footerPng, left: 50, top: 350 },
  ];

  img = img.composite(composites);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await img.png().toFile(outPath);
}

// ========== 清理旧文件 ==========
function cleanOutputs() {
  console.log('\n[CLEAN] 清理旧图标...');
  const dirs = [
    path.join(STATIC_DIR, 'tabbar'),
    path.join(STATIC_DIR, 'images'),
    path.join(STATIC_DIR, 'icons'),
  ];
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir)) {
        if (f.endsWith('.png')) {
          fs.unlinkSync(path.join(dir, f));
          console.log(`  [DEL] ${f}`);
        }
      }
    }
  }
}

// ========== 主入口 ==========
async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const clean = process.argv.includes('--clean');

  console.log('='.repeat(55));
  console.log(dryRun ? '智能图标生成器 [预览模式]' : '智能图标生成器');
  console.log('='.repeat(55));

  if (clean && !dryRun) {
    cleanOutputs();
  }

  const tabbar = await genTabbarIcons(dryRun);
  const share = await genShareImage(dryRun);

  const total = tabbar.generated + share.generated;

  console.log('\n' + '='.repeat(55));
  if (dryRun) {
    console.log(`[PREVIEW] 需生成 ${total} 个文件`);
    console.log('          去掉 --dry-run 执行实际生成');
  } else {
    console.log(`[DONE] 生成 ${total} 个文件`);
    if (tabbar.fixed > 0) {
      console.log(`       修复 ${tabbar.fixed} 项 pages.json 配置`);
    }
  }
  console.log('='.repeat(55));
}

main().catch(e => {
  console.error('[ERR]', e.message);
  process.exit(1);
});
