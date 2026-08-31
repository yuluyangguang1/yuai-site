// 从 fortune/index.html 重新生成 SPA 深链兜底文件；重建 fortune/ 后必须跑一次。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTES = ['bazi', 'ziwei', 'almanac', 'tarot', 'iching', 'bone', 'daily', 'compat', 'crossref', 'knowledge', 'history', 'settings'];
const ANCHOR = '<meta charset="UTF-8" />';
const GUARD = '<script>(function(){var p=location.pathname;if(p!=="/fortune"&&p.indexOf("/fortune/")!==0){location.replace("/");}})();</script>';

const src = readFileSync(join(ROOT, 'fortune/index.html'), 'utf8');
if (!src.includes(ANCHOR)) {
  console.error('fortune/index.html 里找不到注入锚点，拒绝生成（请同步 ANCHOR）');
  process.exit(1);
}

writeFileSync(join(ROOT, '404.html'), src.replace(ANCHOR, ANCHOR + '\n    ' + GUARD));
for (const r of ROUTES) {
  mkdirSync(join(ROOT, 'fortune', r), { recursive: true });
  writeFileSync(join(ROOT, 'fortune', r, 'index.html'), src);
}
console.log(`已生成 404.html + ${ROUTES.length} 份 fortune/<route>/index.html`);
