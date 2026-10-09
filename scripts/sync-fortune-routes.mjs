// 天机阁的两类派生页从这里重生成；重建 fortune/ 之后必须跑一次。
//
//   404.html                        —— 深链兜底：/fortune/ 下任何不存在的路径都会拿到它。
//                                      V7 之后 fortune/index.html 就是阁楼，所以兜底页跟着换成阁楼（只加一条路径守卫、剥掉不该在 404 上的元数据）。
//   knowledge / history / settings  —— 这三页仍是旧 React 应用（V7 没有对应屏幕），从 scripts/fortune-app-shell.html 派生，
//                                      每页注入独立 title / description / canonical / og / JSON-LD。
//
// ⚠ 十一道门（bazi / ziwei / crossref / tarot / bone / compat / almanac / naming / iching / daily / tianji）
//   现在是真文件，由 V7 构建脚本产出。它们绝不能再出现在下面的 ROUTES 里 —— 那会把门页覆盖回旧壳。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTES = ['knowledge', 'history', 'settings'];
const ANCHOR = '<meta charset="UTF-8" />';
const GUARD = '<script>(function(){var p=location.pathname;if(p!=="/fortune"&&p.indexOf("/fortune/")!==0){location.replace("/");}})();</script>';
const TITLE_ANCHOR = '<title>YUAI · 天机阁</title>';
const DESC_ANCHOR = '<meta name="description" content="融合八字、紫微斗数、易经、塔罗与 AI 智能解读的命理平台" />';
const SHELL = join(ROOT, 'scripts/fortune-app-shell.html');

const META = {
  knowledge: ['命理知识库｜星曜神煞基础词条 · YUAI天机阁', '天机阁内置命理知识词条：星曜、神煞与基础概念速查。'],
  history: ['历史记录｜本地保存的排盘记录 · YUAI天机阁', '查看在本机保存过的排盘与测算记录，数据只留在你的浏览器里。'],
  settings: ['设置｜主题与偏好 · YUAI天机阁', '调整天机阁的主题与使用偏好，设置保存在本机浏览器。'],
};

/* 功能清单与简称：只写页面上真实存在的功能，不写评分/评论等无来源字段。 */
const APP = {
  knowledge: ['命理知识库', 'Encyclopedia', ['星曜', '神煞', '基础术语速查']],
  history: ['历史记录', 'History', ['本机排盘记录', '数据不出浏览器']],
  settings: ['设置', 'Settings', ['主题切换', '偏好保存在本机']],
};

/* 深链页首次上线于 2026-08-31（sync 脚本重生成），应用壳最后一次改动见下。 */
const ROUTE_PUBLISHED = '2026-08-31';
const ROUTE_MODIFIED = '2026-09-20';
const ORG_ID = 'https://yuai-r.cn/fortune/#organization';
const SITE_ID = 'https://yuai-r.cn/fortune/#website';
const FORTUNE_URL = 'https://yuai-r.cn/fortune/';
const JSON_LD = (graph) =>
  `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;

const ldFor = (r) => {
  const [title, desc] = META[r];
  const [name, alternateName, featureList] = APP[r];
  const url = `${FORTUNE_URL}${r}/`;
  return JSON_LD([
    {
      '@type': 'Organization', '@id': ORG_ID, name: 'YUAI 天机阁', url: FORTUNE_URL,
      logo: { '@type': 'ImageObject', url: 'https://yuai-r.cn/fortune/icons/fortune-512.png' },
    },
    { '@type': 'WebSite', '@id': SITE_ID, url: FORTUNE_URL, name: 'YUAI 天机阁', inLanguage: 'zh-CN', publisher: { '@id': ORG_ID } },
    {
      '@type': 'WebPage', '@id': url + '#webpage', url, name: title, description: desc, inLanguage: 'zh-CN',
      datePublished: ROUTE_PUBLISHED, dateModified: ROUTE_MODIFIED,
      isPartOf: { '@id': SITE_ID }, breadcrumb: { '@id': url + '#breadcrumb' }, mainEntity: { '@id': url + '#app' },
    },
    {
      '@type': 'BreadcrumbList', '@id': url + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '天机阁', item: FORTUNE_URL },
        { '@type': 'ListItem', position: 2, name, item: url },
      ],
    },
    {
      '@type': 'WebApplication', '@id': url + '#app', name, alternateName, url, description: desc,
      applicationCategory: 'LifestyleApplication', operatingSystem: 'Web browser', inLanguage: 'zh-CN',
      isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      featureList, publisher: { '@id': ORG_ID },
    },
  ]);
};

/* ── 404.html：从阁楼取皮 ───────────────────────────────── */
/* 兜底页不参与索引，也不该带 canonical/og/JSON-LD（旧版靠 site-og / site-ld 注释块剔除，
   阁楼那份是散着注入的，所以改成按标签逐类剔除，并在剔完后断言真剔干净了）。
   注意锚点差异：阁楼是 V7 构建产物，写的是 <meta charset="utf-8">；旧壳写的是 <meta charset="UTF-8" />。 */
const PAV_ANCHOR = '<meta charset="utf-8">';
let pav = readFileSync(join(ROOT, 'fortune/index.html'), 'utf8');
if (!pav.includes(PAV_ANCHOR)) {
  console.error('fortune/index.html 里找不到 ' + PAV_ANCHOR + '，拒绝生成 404.html');
  process.exit(1);
}
let fallback = pav
  .replace(/[ \t]*<link rel="canonical"[^>]*\/?>\n?/g, '')
  .replace(/[ \t]*<meta property="og:[^"]*"[^>]*\/?>\n?/g, '')
  .replace(/[ \t]*<meta name="twitter:[^"]*"[^>]*\/?>\n?/g, '')
  .replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '');
for (const leftover of ['rel="canonical"', 'property="og:', 'name="twitter:', 'application/ld+json']) {
  if (fallback.includes(leftover)) {
    console.error('404.html 里还剩 ' + leftover + '（兜底页不该带这份元数据），剔除规则没跟上页面形状');
    process.exit(1);
  }
}
fallback = fallback.replace(PAV_ANCHOR, PAV_ANCHOR + '\n    ' + GUARD);
if (!fallback.includes('location.replace("/")')) {
  console.error('404.html 的路径守卫没注入成功（锚点被改过？）');
  process.exit(1);
}
writeFileSync(join(ROOT, '404.html'), fallback);

/* ── knowledge / history / settings：从应用壳快照取皮 ─────── */
let src = readFileSync(SHELL, 'utf8');
for (const a of [ANCHOR, TITLE_ANCHOR, DESC_ANCHOR]) {
  if (!src.includes(a)) {
    console.error('scripts/fortune-app-shell.html 里找不到注入锚点，拒绝生成（请同步锚点）: ' + a);
    process.exit(1);
  }
}

// 壳里自带站内通用 og 块与 JSON-LD 块（注释包裹）；
// 派生页必须整块剔除，否则会与路由专属的重复。
const SOCIAL_RE = /\n?<!-- site-og:start -->[\s\S]*?<!-- site-og:end -->\n/;
const LD_RE = /\n {4}<!-- site-ld:start -->[\s\S]*?<!-- site-ld:end -->/;
for (const [name, re] of [['site-og', SOCIAL_RE], ['site-ld', LD_RE]]) {
  if (!re.test(src)) {
    console.error(`scripts/fortune-app-shell.html 里找不到 ${name} 块（壳需含该块，见 2026-09 版本）`);
    process.exit(1);
  }
}
src = src.replace(SOCIAL_RE, '\n').replace(LD_RE, '');

for (const r of ROUTES) {
  const [title, desc] = META[r];
  const url = `https://yuai-r.cn/fortune/${r}/`;
  const og = `\n    <link rel="canonical" href="${url}" />` +
    `\n    <meta property="og:type" content="website" />` +
    `\n    <meta property="og:title" content="${title}" />` +
    `\n    <meta property="og:description" content="${desc}" />` +
    `\n    <meta property="og:url" content="${url}" />` +
    `\n    <meta property="og:image" content="https://yuai-r.cn/fortune/og-tianji.webp" />` +
    `\n    <meta property="og:locale" content="zh_CN" />` +
    `\n    <meta name="twitter:card" content="summary_large_image" />` +
    `\n    <meta name="twitter:image" content="https://yuai-r.cn/fortune/og-tianji.webp" />` +
    `\n    ${ldFor(r)}`;
  const html = src
    .replace(TITLE_ANCHOR, `<title>${title}</title>`)
    .replace(DESC_ANCHOR, `<meta name="description" content="${desc}" />` + og);
  if (!html.includes(`<title>${title}</title>`)) {
    console.error('title 注入失败: ' + r);
    process.exit(1);
  }
  mkdirSync(join(ROOT, 'fortune', r), { recursive: true });
  writeFileSync(join(ROOT, 'fortune', r, 'index.html'), html);
}
console.log(`已生成 404.html（取阁楼）+ ${ROUTES.length} 份 fortune/<route>/index.html（${ROUTES.join('/')}，取应用壳快照）`);
