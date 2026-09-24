// 从 fortune/index.html 重新生成 SPA 深链兜底文件；重建 fortune/ 后必须跑一次。
// 每个功能页注入独立 title / description / canonical / og / JSON-LD，404.html 只加路径守卫。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTES = ['bazi', 'ziwei', 'almanac', 'tarot', 'iching', 'bone', 'daily', 'compat', 'crossref', 'knowledge', 'history', 'settings', 'naming'];
const ANCHOR = '<meta charset="UTF-8" />';
const GUARD = '<script>(function(){var p=location.pathname;if(p!=="/fortune"&&p.indexOf("/fortune/")!==0){location.replace("/");}})();</script>';
const TITLE_ANCHOR = '<title>YUAI · 天机阁</title>';
const DESC_ANCHOR = '<meta name="description" content="融合八字、紫微斗数、易经、塔罗与 AI 智能解读的命理平台" />';

const META = {
  bazi: ['八字排盘｜四柱五行十神大运免费在线排盘 · YUAI天机阁', '输入出生年月日时，免费排出四柱八字：干支、五行统计、十神、纳音与大运，浏览器本地计算，不上传任何数据。'],
  ziwei: ['紫微斗数排盘｜十二宫四化大限流年免费起盘 · YUAI天机阁', '依生辰免费起紫微斗数命盘：安星布宫、十二宫位、四化、大限与流年一览，浏览器本地计算，不留数据。'],
  almanac: ['黄历万年历｜每日宜忌吉神凶煞节气查询 · YUAI天机阁', '在线黄历万年历：查询每日宜忌、吉神凶煞与节气，免费使用。'],
  tarot: ['塔罗牌在线抽牌｜牌阵解读正逆位 · YUAI天机阁', '免费塔罗在线抽牌：多种牌阵任选，正位逆位解读，即问即答。'],
  iching: ['易经起卦｜铜钱摇卦六十四卦卦辞爻辞 · YUAI天机阁', '周易在线起卦：铜钱摇卦得本卦变卦，配六十四卦卦辞与爻辞，免费使用。'],
  bone: ['称骨算命｜袁天罡称骨免费测算 · YUAI天机阁', '依生辰称骨算命：按袁天罡称骨法计算骨重与批语，免费即算即得。'],
  daily: ['每日运势｜今日干支运程免费查看 · YUAI天机阁', '查看今日运势：当日干支与运程提示，免费开放。'],
  compat: ['八字合婚｜两人合盘配对免费测算 · YUAI天机阁', '输入双方生辰做八字合婚：合盘配对评分与要点提示，本地计算，免费使用。'],
  crossref: ['命理交叉对照｜八字紫微多术互参 · YUAI天机阁', '把八字与紫微斗数等结果交叉对照，多术互参，看同一命盘的不同侧面。'],
  knowledge: ['命理知识库｜星曜神煞基础词条 · YUAI天机阁', '天机阁内置命理知识词条：星曜、神煞与基础概念速查。'],
  history: ['历史记录｜本地保存的排盘记录 · YUAI天机阁', '查看在本机保存过的排盘与测算记录，数据只留在你的浏览器里。'],
  settings: ['设置｜主题与偏好 · YUAI天机阁', '调整天机阁的主题与使用偏好，设置保存在本机浏览器。'],
  naming: ['八字起名·姓名测评｜五行补缺智能生成吉名 · YUAI天机阁', '输入父姓与宝宝出生日期时辰，按八字五行补缺免费生成候选吉名，逐字带释义与五格三才评分；也可只做姓名测评。浏览器本地计算，不上传数据。'],
};

/* 功能清单与简称：只写页面上真实存在的功能，不写评分/评论等无来源字段。 */
const APP = {
  bazi: ['八字排盘', 'Bazi Chart', ['四柱干支', '五行统计', '十神', '纳音', '大运', '真太阳时校正', '命卡导出']],
  ziwei: ['紫微斗数排盘', 'Zi Wei Dou Shu', ['十二宫', '安星布宫', '生年四化', '大限', '流年', '真太阳时校正']],
  almanac: ['黄历万年历', 'Chinese Almanac', ['每日宜忌', '吉神凶煞', '节气查询']],
  tarot: ['塔罗在线抽牌', 'Tarot', ['多种牌阵', '正位逆位', '牌义解读']],
  iching: ['易经起卦', 'I Ching', ['铜钱摇卦', '本卦变卦', '六十四卦卦辞爻辞']],
  bone: ['称骨算命', 'Bone Weight', ['袁天罡称骨法', '骨重计算', '批语']],
  daily: ['每日运势', 'Daily Fortune', ['当日干支', '运程提示']],
  compat: ['八字合婚', 'Bazi Compatibility', ['双方生辰合盘', '配对评分', '要点提示']],
  crossref: ['命理交叉对照', 'Cross Reference', ['八字与紫微结果互参', '多术对照']],
  knowledge: ['命理知识库', 'Encyclopedia', ['星曜', '神煞', '基础术语速查']],
  history: ['历史记录', 'History', ['本机排盘记录', '数据不出浏览器']],
  settings: ['设置', 'Settings', ['主题切换', '偏好保存在本机']],
  naming: ['八字起名·姓名测评', 'Naming', ['八字五行补缺生成吉名', '逐字释义', '五格三才评分', '姓名测评', '真太阳时校正']],
};

/* 深链页首次上线于 2026-08-31（sync 脚本重生成），内容最近一次改版见下。 */
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
      logo: { '@type': 'ImageObject', url: 'https://yuai-r.cn/egret-ink.jpg' },
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

let src = readFileSync(join(ROOT, 'fortune/index.html'), 'utf8');
for (const a of [ANCHOR, TITLE_ANCHOR, DESC_ANCHOR]) {
  if (!src.includes(a)) {
    console.error('fortune/index.html 里找不到注入锚点，拒绝生成（请同步锚点）: ' + a);
    process.exit(1);
  }
}

// 根页 fortune/index.html 自带站内通用 og 块与 JSON-LD 块（注释包裹）；
// 派生页必须整块剔除，否则会与路由专属的重复。
const SOCIAL_RE = /\n?<!-- site-og:start -->[\s\S]*?<!-- site-og:end -->\n/;
const LD_RE = /\n {4}<!-- site-ld:start -->[\s\S]*?<!-- site-ld:end -->/;
for (const [name, re] of [['site-og', SOCIAL_RE], ['site-ld', LD_RE]]) {
  if (!re.test(src)) {
    console.error(`fortune/index.html 里找不到 ${name} 块（根页需含该块，见 2026-09 版本）`);
    process.exit(1);
  }
}
src = src.replace(SOCIAL_RE, '\n').replace(LD_RE, '');

writeFileSync(join(ROOT, '404.html'), src.replace(ANCHOR, ANCHOR + '\n    ' + GUARD));
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
console.log(`已生成 404.html + ${ROUTES.length} 份 fortune/<route>/index.html（含独立 title/description/og/JSON-LD）`);
