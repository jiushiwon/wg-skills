import { writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateIcon as _generateIcon } from './generator.ts'
import type { IconOptions } from './generator.ts'
import { listTemplates as _listTemplates, resolveTemplateName as _resolveTemplateName } from './registry.ts'

export type { IconOptions }
export { _listTemplates as listTemplates }
export { _generateIcon as generateIcon }
export { _resolveTemplateName as resolveTemplateName }

export async function generateIconToFile(
  name: string,
  options: IconOptions,
  outDir: string
): Promise<string> {
  await mkdir(outDir, { recursive: true })
  const svg = _generateIcon(name, options)
  const filePath = resolve(outDir, `${name}.svg`)
  await writeFile(filePath, svg, 'utf-8')
  return filePath
}

export async function generateIconSet(
  names: string[],
  options: IconOptions,
  outDir: string
): Promise<string[]> {
  return Promise.all(names.map((n) => generateIconToFile(n, options, outDir)))
}
