// 从 fortune/index.html（阁楼）重生成根 404.html；重建 fortune/ 之后必须跑一次。
//
// 为什么只剩这一件事：旧 React 应用整个撤下之后，仓库里再没有「从一个壳派生一堆功能页」这回事 ——
// 十一道门与 knowledge / history / settings 都是各自独立的真文件，由 V7 构建脚本产出，
// 从这里派生只会把它们覆盖回旧壳（那正是 2026-10-09 之前这份脚本的写法）。
//
// 404.html 是站内深链兜底：/fortune/ 下任何不存在的路径都会拿到它，所以它跟着入口换皮，
// 但剥掉 canonical / og / twitter / JSON-LD —— 兜底页不参与索引，带着 /fortune/ 的 canonical 会跟正主抢。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANCHOR = '<meta charset="utf-8">';   /* 阁楼是 V7 产物，写的是这一种；旧壳那种 <meta charset="UTF-8" /> 已随前端一起撤下 */
const GUARD = '<script>(function(){var p=location.pathname;if(p!=="/fortune"&&p.indexOf("/fortune/")!==0){location.replace("/");}})();</script>';

let pav = readFileSync(join(ROOT, 'fortune/index.html'), 'utf8');
if (!pav.includes(ANCHOR)) {
  console.error('fortune/index.html 里找不到 ' + ANCHOR + '，拒绝生成 404.html');
  process.exit(1);
}
let out = pav
  .replace(/[ \t]*<link rel="canonical"[^>]*\/?>\n?/g, '')
  .replace(/[ \t]*<meta property="og:[^"]*"[^>]*\/?>\n?/g, '')
  .replace(/[ \t]*<meta name="twitter:[^"]*"[^>]*\/?>\n?/g, '')
  .replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '');
for (const leftover of ['rel="canonical"', 'property="og:', 'name="twitter:', 'application/ld+json']) {
  if (out.includes(leftover)) {
    console.error('404.html 里还剩 ' + leftover + '（兜底页不该带这份元数据），剔除规则没跟上页面形状');
    process.exit(1);
  }
}
out = out.replace(ANCHOR, ANCHOR + '\n    ' + GUARD);
if (!out.includes('location.replace("/")')) {
  console.error('404.html 的路径守卫没注入成功（锚点被改过？）');
  process.exit(1);
}
writeFileSync(join(ROOT, '404.html'), out);
console.log('已生成 404.html（取阁楼 + 路径守卫，剥掉 canonical/og/JSON-LD）');
