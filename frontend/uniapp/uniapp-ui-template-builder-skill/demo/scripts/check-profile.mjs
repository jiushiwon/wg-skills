import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root=path.dirname(fileURLToPath(new URL('../package.json',import.meta.url)))
const view=path.resolve(root,'../templates/uniapp-vue3/profile-gallery/profile-gallery.vue')
const source=fs.readFileSync(view,'utf8')
for (const name of ['BaseCard','BaseAvatar','BaseNavbar','BaseTabbar','BaseButton','Empty']) {
 if (!source.includes(`<${name}`) || !source.includes(`import ${name} from`)) throw new Error(`Missing real dependency: ${name}`)
}
if(source.includes(':root')||/--[a-z-]+\s*:/.test(source))throw new Error('Business template may not define theme tokens')
if(/uni\.request/.test(source))throw new Error('Presentation template may not request data')
for(const match of source.matchAll(/var\((--[\w-]+)([^)]*)\)/g))if(!match[2].trim().startsWith(','))throw new Error('Token missing fallback: '+match[1])
const css=fs.readFileSync(path.resolve(root,'../../uniapp-theme-skill/templates/src/static/css/base.css'),'utf8')
for(const match of source.matchAll(/var\((--[\w-]+)/g))if(!css.includes(match[1]+':'))throw new Error('Unknown theme token: '+match[1])
const model=fs.readFileSync(path.resolve(root,'src/api/_mocks_/profiles.ts'),'utf8')
for(const scene of ['simple','service','commerce','enterprise','member'])if(!model.includes(`scenario: '${scene}'`)&&!model.includes(`scenario:'${scene}'`))throw new Error('Missing scene: '+scene)
console.log('Profile source checks passed: real base components, known tokens with fallbacks, separate five mock scenarios.')

const scenicRoot=path.resolve(root,'../templates/uniapp-vue3/profile-scenic')
const scenic=fs.readFileSync(path.join(scenicRoot,'profile-scenic.vue'),'utf8')
for(const name of ['BaseCard','BaseAvatar','BaseNavbar','BaseTabbar','BaseButton','Empty']){
 if(!scenic.includes(`<${name}`)||!scenic.includes(`import ${name} from`))throw new Error('Scenic missing real base dependency: '+name)
}
if(/--[a-z-]+\s*:/.test(scenic)||/uni\.request/.test(scenic))throw new Error('Scenic view cannot define theme tokens or request data')
for(const match of scenic.matchAll(/var\((--[\w-]+)/g)){if(!css.includes(match[1]+':'))throw new Error('Unknown scenic token: '+match[1])}
const presets=fs.readFileSync(path.join(scenicRoot,'mock.ts'),'utf8')
for(const id of ['glacier','coral','aurora','forest','cloud']){
 if(!presets.includes(`"id": "${id}"`))throw new Error('Missing scenic preset '+id)
 if(!fs.existsSync(path.resolve(root,'../assets/profile-scenic',id+'-background.png')))throw new Error('Missing scenic background '+id)
}
console.log('Scenic source checks passed: shared real components, known tokens, five independent presets and material sources.')

if(!presets.includes('"id": "solid"')||!presets.includes('"backgroundMode": "solid-rings"'))throw new Error('Missing solid circle configuration')
if(!scenic.includes('solid-decoration')||!scenic.includes('pointer-events:none'))throw new Error('Decorative circles must not block actions')

for(const id of ['glacier','coral','aurora','forest','cloud']) {
 const file=path.resolve(root,'../assets/profile-scenic/runtime',id+'-background.jpg')
 if(!fs.existsSync(file))throw new Error('Missing compressed runtime asset '+id)
}
