#!/usr/bin/env node
/**
 * image-forge — 配置驱动的图片处理 + 图标生成工具（基于 sharp）
 *
 * 用法：
 *   node image-forge.js spec.json
 *   echo '{...}' | node image-forge.js -
 *
 * 两种配置模式（二选一）：
 *
 * ① icons 模式 —— 图标生成：把 SVG path（或完整 SVG）批量渲染成 PNG
 * {
 *   "outDir": "D:/项目/src/static/icons",   // 必填，输出目录（自动创建）
 *   "size": 72,                              // 可选，输出像素，默认 72
 *   "color": "#059669",                      // 可选，描边色，默认 #059669
 *   "strokeWidth": 2,                        // 可选，描边宽度，默认 2
 *   "icons": [
 *     { "name": "a.png", "path": "M9 12h6..." },    // heroicons 风格 path
 *     { "name": "b.png", "svg": "<svg>...</svg>" }  // 或直接给完整 svg
 *   ]
 * }
 *
 * ② jobs 模式 —— 图片处理：压缩/转格式/改尺寸/裁剪/base64/水印/遮罩/多图合成
 * {
 *   "outDir": "./dist",
 *   "defaults": { "format": "webp", "quality": 85, "fit": "cover", "background": "#ffffff" },
 *   "jobs": [
 *     { "type": "image", "input": "src/a.jpg", "format": "webp", "quality": 85,
 *       "resize": { "width": 800, "height": 600, "fit": "cover" } },
 *     { "type": "composite", "output": "banner.jpg", "width": 1200, "height": 600,
 *       "background": "#eeeeee",
 *       "layers": [
 *         { "type": "image", "input": "src/bg.jpg", "fit": "cover", "width": 1200, "height": 600 },
 *         { "type": "color", "color": "#000000", "opacity": 0.3 },
 *         { "type": "text", "text": "标题", "x": 600, "y": 300, "fontSize": 72, "color": "#ffffff", "align": "center" }
 *       ] }
 *   ]
 * }
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function readSpec() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('用法: node image-forge.js <spec.json | ->');
    process.exit(1);
  }
  const raw = arg === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(arg, 'utf8');
  return JSON.parse(raw);
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  })[c]);
}

function buildIconSvg(icon, size, color, strokeWidth) {
  if (icon.svg) return icon.svg;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
  <path d="${icon.path}" />
</svg>`;
}

/**
 * 生成文字图层 SVG。文本定位基于画布尺寸（composite 已知；image 任务在读图后知道）。
 * align: left → x 为起点(text-anchor=start)；center → x 为中线(middle)；right → x 为终点(end)。
 */
function buildTextSvg(layer, canvasWidth, canvasHeight) {
  const fontSize = layer.fontSize || 32;
  const color = layer.color || '#ffffff';
  const font = layer.font || 'Microsoft YaHei, PingFang SC, sans-serif';
  const fontWeight = layer.fontWeight || 'normal';
  const align = layer.align || 'left';
  const opacity = typeof layer.opacity === 'number' ? layer.opacity : 1;
  const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
  const x = typeof layer.x === 'number' ? layer.x : align === 'center' ? canvasWidth / 2 : align === 'right' ? canvasWidth : 0;
  const y = typeof layer.y === 'number' ? layer.y : canvasHeight / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
  <text x="${x}" y="${y}" font-size="${fontSize}" font-family="${font}" font-weight="${fontWeight}"
        fill="${color}" fill-opacity="${opacity}" text-anchor="${anchor}" dominant-baseline="middle">${escapeXml(layer.text)}</text>
</svg>`;
}

/** 把单个图层转成 sharp 可用的 composite 输入 */
async function layerToInput(layer, canvasWidth, canvasHeight) {
  let buffer;
  switch (layer.type) {
    case 'color': {
      const color = layer.color || '#000000';
      const opacity = typeof layer.opacity === 'number' ? layer.opacity : 1;
      const hex = color.startsWith('#') && color.length === 4
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color;
      const alpha = Math.max(0, Math.min(1, opacity)).toString(16).padStart(2, '0');
      buffer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
  <rect width="100%" height="100%" fill="${hex}${alpha}"/></svg>`);
      break;
    }
    case 'text':
      buffer = Buffer.from(buildTextSvg(layer, canvasWidth, canvasHeight));
      break;
    case 'image':
    default: {
      let img = sharp(layer.input);
      const w = layer.width, h = layer.height;
      if (w || h) img = img.resize(w || null, h || null, {
        fit: layer.fit || 'contain',
        position: layer.position || 'center',
      });
      buffer = await img.png().toBuffer();
    }
  }
  return {
    input: buffer,
    left: layer.x || 0,
    top: layer.y || 0,
    blend: layer.blend || 'over',
  };
}

async function renderOverlays(img, overlays, canvasWidth, canvasHeight) {
  if (!Array.isArray(overlays) || overlays.length === 0) return img;
  const inputs = [];
  for (const layer of overlays) {
    inputs.push(await layerToInput(layer, canvasWidth, canvasHeight));
  }
  return img.composite(inputs);
}

/** jobs 模式：image 任务（压缩/转格式/裁剪 + 可选叠加层） */
async function processImageJob(job, defaults, outDir) {
  const input = job.input;
  if (!input) throw new Error('image 任务缺少 input');
  const src = sharp(input);
  const meta = await src.metadata();

  if (job.resize) {
    src.resize(job.resize.width || null, job.resize.height || null, {
      fit: job.resize.fit || defaults.fit || 'cover',
      position: job.resize.position || defaults.position || 'center',
      withoutEnlargement: job.resize.withoutEnlargement !== false,
    });
  }

  const canvasWidth = job.resize && job.resize.width ? job.resize.width : (meta.width || 0);
  const canvasHeight = job.resize && job.resize.height ? job.resize.height : (meta.height || 0);
  const withOverlays = await renderOverlays(src, job.overlays, canvasWidth, canvasHeight);

  const format = job.format || defaults.format || 'jpeg';
  let out = withOverlays;
  switch (format) {
    case 'webp': out = out.webp({ quality: job.quality || defaults.quality || 80 }); break;
    case 'png': out = out.png(); break;
    case 'jpeg': case 'jpg': out = out.jpeg({ quality: job.quality || defaults.quality || 80 }); break;
    default: throw new Error(`不支持的格式: ${format}`);
  }

  const extMap = { webp: '.webp', png: '.png', jpeg: '.jpg', jpg: '.jpg' };
  const output = job.output || (path.basename(input, path.extname(input)) + (extMap[format] || extMap[jpeg]));
  const outPath = path.resolve(outDir, output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const info = await out.toFile(outPath);
  return {
    type: 'image', input, file: outPath,
    width: info.width, height: info.height, format, bytes: info.size,
    base64: job.base64 ? `data:${format === 'webp' ? 'image/webp' : format === 'png' ? 'image/png' : 'image/jpeg'};base64,${fs.readFileSync(outPath).toString('base64')}` : undefined,
  };
}

/** jobs 模式：composite 任务（画布 + 多图层合成） */
async function processCompositeJob(job, defaults, outDir) {
  const width = job.width, height = job.height;
  if (!width || !height) throw new Error('composite 任务缺少 width/height');
  const background = job.background || defaults.background || '#ffffff';
  const bgOpacity = typeof job.backgroundOpacity === 'number' ? job.backgroundOpacity : 1;
  const format = job.format || defaults.format || 'jpeg';

  const bgHex = background.startsWith('#') && background.length === 4
    ? `#${background[1]}${background[1]}${background[2]}${background[2]}${background[3]}${background[3]}`
    : background;
  const alpha = Math.max(0, Math.min(1, bgOpacity)).toString(16).padStart(2, '0');
  const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="${bgHex}${alpha}"/></svg>`);

  const inputs = [];
  for (const layer of job.layers || []) {
    inputs.push(await layerToInput(layer, width, height));
  }

  let out = sharp(base).composite(inputs);
  switch (format) {
    case 'webp': out = out.webp({ quality: job.quality || defaults.quality || 80 }); break;
    case 'png': out = out.png(); break;
    case 'jpeg': case 'jpg': out = out.jpeg({ quality: job.quality || defaults.quality || 80 }); break;
    default: throw new Error(`不支持的格式: ${format}`);
  }

  const extMap = { webp: '.webp', png: '.png', jpeg: '.jpg', jpg: '.jpg' };
  const output = job.output || `banner${extMap[format] || '.jpg'}`;
  const outPath = path.resolve(outDir, output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const info = await out.toFile(outPath);
  return {
    type: 'composite', file: outPath,
    width, height, format, bytes: info.size,
    base64: job.base64 ? `data:${format === 'webp' ? 'image/webp' : format === 'png' ? 'image/png' : 'image/jpeg'};base64,${fs.readFileSync(outPath).toString('base64')}` : undefined,
  };
}

/** jobs 模式主流程 */
async function runJobs(spec) {
  const outDir = spec.outDir || '.';
  const defaults = spec.defaults || {};
  fs.mkdirSync(outDir, { recursive: true });
  const results = [];
  for (const job of spec.jobs || []) {
    try {
      const result = job.type === 'composite'
        ? await processCompositeJob(job, defaults, outDir)
        : await processImageJob(job, defaults, outDir);
      results.push(result);
      console.log('[OK]', result.file);
    } catch (e) {
      results.push({ type: job.type || 'image', input: job.input, error: e.message });
      console.error('[ERR]', job.input || job.type, e.message);
    }
  }
  console.log(`Done! ${results.length} jobs -> ${outDir}`);
  return { jobs: results };
}

/** icons 模式主流程（原 icon-forge） */
async function runIcons(spec) {
  const { outDir, size = 72, color = '#059669', strokeWidth = 2, icons } = spec;
  if (!outDir) throw new Error('配置缺少 outDir');
  if (!Array.isArray(icons) || icons.length === 0) throw new Error('配置缺少 icons 数组');

  fs.mkdirSync(outDir, { recursive: true });
  for (const icon of icons) {
    if (!icon.name) throw new Error('每个图标必须有 name');
    if (!icon.path && !icon.svg) throw new Error(`图标 ${icon.name} 缺少 path 或 svg`);
    const svg = buildIconSvg(icon, size, color, strokeWidth);
    const outPath = path.join(outDir, icon.name);
    await sharp(Buffer.from(svg)).resize(size, size, { fit: 'contain' }).png().toFile(outPath);
    console.log('[OK]', outPath);
  }
  console.log(`Done! ${icons.length} icons -> ${outDir}`);
}

async function main() {
  const spec = readSpec();
  if (spec.icons) {
    await runIcons(spec);
  } else if (spec.jobs) {
    const report = await runJobs(spec);
    if (process.env.FORGE_OUTPUT_JSON === '1') console.log(JSON.stringify(report));
  } else {
    throw new Error('配置需要包含 icons（图标生成）或 jobs（图片处理）');
  }
}

main().catch((e) => { console.error('[ERR]', e.message); process.exit(1); });
