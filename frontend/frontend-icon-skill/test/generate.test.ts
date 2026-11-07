import { generateIcon, listTemplates, resolveTemplateName } from '../src/index.ts'
import { writeFile, rm, mkdir } from 'node:fs/promises'

const OUT = './test-output'

async function main() {
  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })
  const names = listTemplates()
  if (names.length !== 18) {
    throw new Error(`[generate.test] 期望 18 个模板，实际 ${names.length}`)
  }

  // 智能匹配：别名解析（BaseIcon / png 共用）
  const aliasCases: [string, string][] = [
    ['layout-dashboard', 'dashboard'],
    ['users', 'user'],
    ['shield-check', 'role'],
    ['link-2', 'tree'],
    ['alert-triangle', 'warning'],
    ['circle-check', 'success'],
  ]
  for (const [alias, expect] of aliasCases) {
    const got = resolveTemplateName(alias)
    if (got !== expect) throw new Error(`❌ 别名 ${alias} → 期望 ${expect}，实际 ${got}`)
  }
  if (resolveTemplateName('not-exist-icon') !== null) {
    throw new Error('❌ 未登记名应返回 null')
  }
  console.log(`  ✅ 别名解析 ${aliasCases.length} 组 + 未登记兜底`)

  // 注入防御：color 注入不应含原始引号
  const evil = generateIcon('menu', { color: '" onload="evil()' })
  if (evil.includes('" onload="')) throw new Error('❌ color 注入未转义')
  console.log('  ✅ color 注入防御（escapeXml）')

  for (const name of names) {
    const svg = generateIcon(name, { size: 24, color: '#4f46e5', strokeWidth: 2 })
    if (!svg.includes('width="24"') || !svg.includes('stroke="#4f46e5"')) {
      throw new Error(`❌ ${name}: 占位符替换失败`)
    }
    if (svg.includes('{{')) {
      throw new Error(`❌ ${name}: 仍有未替换占位符`)
    }
    await writeFile(`${OUT}/${name}.svg`, svg)
    console.log(`  ✅ ${name}`)
  }
  console.log(`\n${names.length} 模板生成到 ${OUT}/`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
