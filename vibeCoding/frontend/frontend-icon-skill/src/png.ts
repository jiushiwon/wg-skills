/**
 * PNG 导出 API（Node 环境专用，不要从浏览器侧 import 此模块）。
 *
 * 实现：把模板 SVG 交给同包的 image-forge.cjs（sharp）渲染成 PNG。
 * 独立成子路径 `frontend-icon-skill/png`，避免 node:child_process 混进
 * 浏览器入口 src/index.ts（BaseIcon 依赖零 Node 内置 API）。
 */
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { generateIcon } from './generator.ts'
import { resolveTemplateName } from './registry.ts'
import type { IconOptions } from './generator.ts'

export type { IconOptions }

export interface PngOptions extends IconOptions {
  /** PNG 输出像素（正方形），默认 72 */
  size?: number
}

interface ForgeIcon {
  name: string
  svg: string
}

const FORGE_PATH = fileURLToPath(new URL('../image-forge.cjs', import.meta.url))

async function runForge(spec: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      process.execPath,
      [FORGE_PATH, '-'],
      { encoding: 'utf8' },
      (err, _stdout, stderr) => {
        if (err) reject(new Error(stderr || err.message))
        else resolve()
      },
    )
    child.stdin?.write(JSON.stringify(spec))
    child.stdin?.end()
  })
}

/** 解析出模板名（别名/直传模板名都支持），未登记返回 null */
function templateNameFor(name: string): string | null {
  return resolveTemplateName(name)
}

/** 单个图标导出 PNG，返回输出文件完整路径 */
export async function generatePngIcon(
  name: string,
  options?: PngOptions,
  outDir = '.',
): Promise<string> {
  const templateName = templateNameFor(name)
  if (!templateName) {
    throw new Error(`[frontend-icon-skill] icon "${name}" 未登记（见 src/registry.ts TEMPLATE_ALIASES）`)
  }
  const size = options?.size ?? 72
  const color = options?.color ?? '#059669'
  const strokeWidth = options?.strokeWidth ?? 2
  const svg = generateIcon(templateName, { size: 24, color, strokeWidth })
  await runForge({
    outDir,
    size,
    icons: [{ name: `${name}.png`, svg } satisfies ForgeIcon],
  })
  return `${outDir}/${name}.png`
}

/** 批量图标导出 PNG，返回全部输出文件路径 */
export async function generatePngSet(
  names: string[],
  options?: PngOptions,
  outDir = '.',
): Promise<string[]> {
  const size = options?.size ?? 72
  const color = options?.color ?? '#059669'
  const strokeWidth = options?.strokeWidth ?? 2
  const icons: ForgeIcon[] = names.map((name) => {
    const templateName = templateNameFor(name)
    if (!templateName) {
      throw new Error(`[frontend-icon-skill] icon "${name}" 未登记（见 src/registry.ts TEMPLATE_ALIASES）`)
    }
    return {
      name: `${name}.png`,
      svg: generateIcon(templateName, { size: 24, color, strokeWidth }),
    }
  })
  await runForge({ outDir, size, icons })
  return names.map((name) => `${outDir}/${name}.png`)
}