// Tooling only: icon-catch (Lucide) -> frontend-icon-skill image-forge PNG pipeline.
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const outDir = fileURLToPath(new URL('../src/static/profile-icons/', import.meta.url))
const names = ['ticket','user','heart','eye','clock','bell','settings','calendar-days','layers','map-pin','receipt','edit','headset','circle-help','wallet','package','truck','message-square','clipboard-check','contact','megaphone','shield-check','gem','gift','circle-check','circle','building','house','layout-grid']
const icons = []
for (const name of names) {
  const path = `${outDir}${name}.source.svg`
  let svg
  try { svg = await fs.readFile(path, 'utf8') } catch {
    const response = await fetch(`https://api.iconify.design/lucide/${name}.svg?color=%23171717&width=24&height=24`)
    if (!response.ok) throw new Error(`${name}: ${response.status}`)
    svg = await response.text()
    if (!svg.includes('<svg')) throw new Error(`Invalid SVG: ${name}`)
    await fs.mkdir(outDir,{recursive:true});await fs.writeFile(path,svg)
  }
  icons.push({ name:`${name}.png`, svg })
}
icons.push({name:'user-active.png',svg:icons.find(item=>item.name==='user.png').svg.replaceAll('#171717','#0f766e')})
const forge=fileURLToPath(new URL('../../../../frontend-icon-skill/image-forge.cjs',import.meta.url))
execFileSync(process.execPath,[forge,'-'],{input:JSON.stringify({outDir,size:72,icons}),stdio:['pipe','inherit','inherit']})
await fs.writeFile(`${outDir}SOURCES.md`,'# Icons\n\nLucide line icons via Iconify API, ISC License. https://github.com/lucide-icons/lucide/blob/main/LICENSE\nGenerated PNGs using frontend-icon-skill/image-forge.cjs. No runtime icon-library dependency.\nNames: '+names.join(', ')+'\n')

await fs.mkdir(`${outDir}dark`,{recursive:true})
const darkIcons=icons.map(item=>({name:item.name,svg:item.svg.replaceAll('#171717','#e5e5e5')}))
execFileSync(process.execPath,[forge,'-'],{input:JSON.stringify({outDir:`${outDir}dark`,size:72,icons:darkIcons}),stdio:['pipe','inherit','inherit']})
