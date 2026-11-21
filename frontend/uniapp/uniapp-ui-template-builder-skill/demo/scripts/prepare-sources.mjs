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
link('uniapp-ui-template-builder-skill/templates',path.join(skill,'templates'))
console.log('Scoped source links ready; no copied component implementations.')

// 背景素材唯一真源在技能 assets；构建时复制到各端 static。
const scenicAssets=path.join(skill,'assets/profile-scenic')
const scenicStatic=path.join(skill,'demo/src/static/profile-scenic')
fs.mkdirSync(scenicStatic,{recursive:true})
// 原图/预览只作为技能素材保存；运行时仅复制已核验的轻量派生图。
for(const id of ['glacier','coral','aurora','forest','cloud']) {
 const legacy=path.join(scenicStatic,id+'-background.png')
 if(fs.existsSync(legacy))fs.unlinkSync(legacy) // 仅删除本脚本先前生成的已知文件。
 const name=id+'-background.jpg'
 fs.copyFileSync(path.join(scenicAssets,'runtime',name),path.join(scenicStatic,name))
}

const commerceSrc=path.join(skill,"assets/commerce")
const commerceDest=path.join(skill,"demo/src/static/commerce")
fs.mkdirSync(commerceDest,{recursive:true})
for(const name of ["laptop.jpg","phone.jpg","headphones.jpg","watch.jpg","cart.svg","cart-white.svg","home.svg","wallet.svg","grid.svg"]) fs.copyFileSync(path.join(commerceSrc,name),path.join(commerceDest,name))
