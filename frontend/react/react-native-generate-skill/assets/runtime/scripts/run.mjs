import {spawnSync} from 'node:child_process';
import {prepare} from './env.mjs';
import {mkdirSync} from 'node:fs';
const [action, env='dev'] = process.argv.slice(2);
function run(command,args=[]) {
 // Windows 的 npx.cmd 通过固定命令启动；不拼接用户输入。
 const winNpx = process.platform==='win32' && command==='npx';
 const result=spawnSync(winNpx?'cmd.exe':command,winNpx?['/d','/s','/c',`npx ${args.join(' ')}`]:args,{stdio:'inherit'});
 if(result.error) throw result.error;
 if(result.status!==0) process.exit(result.status || 1);
}
if(action==='check') {
 run('node',['--version']);run('java',['-version']);run('adb',['version']);run('adb',['devices']);
 console.log('还需核对 SDK、Gradle 与所选 RN 的兼容矩阵；发现设备不代表已装机。');
} else if(['start','android','ios'].includes(action)) {
 if(env!=='dev') throw new Error('交付包请使用 build 脚本');
 if(action==='ios' && process.platform!=='darwin') throw new Error('本地 iOS 需要 macOS');
 prepare(env);
 run('npx',['--no-install','react-native',action==='start'?'start':`run-${action}`]);
} else if(action==='e2e') {
 if(env!=='test' || !/^[A-Za-z][A-Za-z0-9_.]+$/.test(process.env.APP_ID||'')) throw new Error('E2E 需要 test 环境和合法的测试 APP_ID');
 mkdirSync('artifacts',{recursive:true});
 run('maestro',['test','-e',`APP_ID=${process.env.APP_ID}`,'--format','junit','--output','artifacts/e2e.xml','.maestro/flows']);
} else throw new Error('未知操作');
