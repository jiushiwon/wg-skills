import { loadTemplate } from './registry.ts'

export interface IconOptions {
  size?: number
  color?: string
  strokeWidth?: number
}

const DEFAULTS: Required<IconOptions> = {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
}

function escapeXml(s: string): string {
  return String(s).replace(/[<>&'"]/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c])
}

export function generateIcon(name: string, options?: IconOptions): string {
  const opts = { ...DEFAULTS, ...options }
  const template = loadTemplate(name)
  // ponytail: 占位符替换（颜色需要 XML 转义防御）
  return template
    .replace(/\{\{size\}\}/g, String(opts.size))
    .replace(/\{\{color\}\}/g, escapeXml(opts.color))
    .replace(/\{\{strokeWidth\}\}/g, String(opts.strokeWidth))
}
