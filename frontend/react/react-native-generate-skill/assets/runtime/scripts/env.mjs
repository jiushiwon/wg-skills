import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
export function prepare(env) {
 if (!['dev','test','prod'].includes(env)) throw new Error('环境必须是 dev/test/prod');
 const values = {};
 for (const line of readFileSync(`.env.${env}`, 'utf8').split(/\r?\n/)) {
  if (!line.trim() || line.trim().startsWith('#')) continue;
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (!m) throw new Error('环境文件格式错误');
  if (Object.hasOwn(values,m[1])) throw new Error('环境变量重复');
  values[m[1]]=m[2].trim();
 }
 const url = new URL(values.API_BASE_URL);
 if (values.APP_ENV !== env || !['http:','https:'].includes(url.protocol) || url.username || url.password || (env !== 'dev' && url.protocol !== 'https:')) throw new Error('环境或接口地址无效');
 mkdirSync('src/config',{recursive:true});
 writeFileSync('src/config/env.generated.ts',`// 自动生成，请勿手动修改\nexport const appConfig = ${JSON.stringify({environment:env,baseURL:values.API_BASE_URL.replace(/\/$/,'')},null,2)} as const;\n`);
 return values;
}
