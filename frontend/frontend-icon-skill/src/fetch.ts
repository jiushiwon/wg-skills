import { listTemplates } from './registry.ts'

/**
 * 抓取不在模板库里的 icon。
 * ponytail: 这层是 fallback，主路径走 registry 模板。
 * 调用 icon-image-catch-skill/icon-catch-skill 的能力（按需 import）。
 */
export async function fetchFromIconCatch(name: string): Promise<string> {
  // 实际实现：dynamic import icon-image-catch-skill/icon-catch-skill
  // 这里只占位，避免在本 skill 里硬编码
  throw new Error(`[frontend-icon-skill] icon "${name}" not in template registry. Available: ${listTemplates().join(', ')}. Add via icon-image-catch-skill flow.`)
}
