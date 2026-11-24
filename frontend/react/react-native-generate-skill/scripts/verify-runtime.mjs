import {mkdtempSync,cpSync,readFileSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const temp=mkdtempSync(resolve(tmpdir(),'rn-runtime-'));
let count=0;
try {
 cpSync(resolve(root,'assets/runtime'),temp,{recursive:true});
 for(const env of ['dev','test','prod']) {
  const p=spawnSync(process.execPath,['-e',`import('./scripts/env.mjs').then(m=>m.prepare('${env}'))`],{cwd:temp});
  assert.equal(p.status,0,p.stderr.toString());
  assert.match(readFileSync(resolve(temp,'src/config/env.generated.ts'),'utf8'),new RegExp(`"environment": "${env}"`));count++;
 }
 for(const [env,content] of [['test','APP_ENV=test\nAPI_BASE_URL=http://bad.example.com'],['prod','APP_ENV=dev\nAPI_BASE_URL=https://api.example.com'],['dev','APP_ENV=dev\nAPI_BASE_URL=https://u:p@example.com'],['dev','APP_ENV=dev\nAPP_ENV=dev\nAPI_BASE_URL=https://a.com']]) {
  writeFileSync(resolve(temp,`.env.${env}`),content);
  assert.notEqual(spawnSync(process.execPath,['-e',`import('./scripts/env.mjs').then(m=>m.prepare('${env}'))`],{cwd:temp}).status,0);count++;
 }
 for(const args of [['scripts/run.mjs','unknown'],['scripts/run.mjs','start','prod'],['scripts/e2e.mjs','prod']]) {
  assert.notEqual(spawnSync(process.execPath,args,{cwd:temp}).status,0);count++;
 }
 const scripts=JSON.parse(readFileSync(resolve(temp,'package.scripts.json'),'utf8'));
 for(const value of Object.values(scripts)) {
  const file=value.match(/scripts\/[\w.-]+/)[0];assert.ok(existsSync(resolve(temp,file)),file);count++;
 }
 console.log(`${count} runtime checks passed`);
} finally {rmSync(temp,{recursive:true,force:true});}
