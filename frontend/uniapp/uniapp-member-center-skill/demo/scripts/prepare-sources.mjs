import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const skill=fileURLToPath(new URL('../../',import.meta.url))
const uni=path.resolve(skill,'..')
const links=fileURLToPath(new URL('../src/skills',import.meta.url))
if(fs.existsSync(links)&&fs.lstatSync(links).isSymbolicLink()) {
 if(fs.realpathSync(links)!==fs.realpathSync(uni))throw new Error('Unexpected legacy link')
 fs.rmdirSync(links) // remove the verified junction itself, never its target
}
fs.mkdirSync(links,{recursive:true})
function link(name,target) {
 const dest=path.join(links,name)
 if(fs.existsSync(dest)) { if(fs.realpathSync(dest)!==fs.realpathSync(target))throw new Error('Unexpected source link: '+name);return }
 fs.mkdirSync(path.dirname(dest),{recursive:true})
 fs.symlinkSync(target,dest,process.platform==='win32'?'junction':'dir')
}
for(const name of ['uniapp-base-skill','uniapp-theme-skill','uniapp-page-components-skill'])link(name,path.join(uni,name))
link('uniapp-member-center-skill/templates',path.join(skill,'templates'))
console.log('Scoped source links ready; no copied component implementations.')
