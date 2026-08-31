// 从 fortune/index.html 重新生成 SPA 深链兜底文件；重建 fortune/ 后必须跑一次。
// 每个功能页注入独立 title / description / canonical / og，404.html 只加路径守卫。
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
  naming: ['起名分析｜五格三才生肖音韵免费在线测算 · YUAI天机阁', '输入姓氏与候选名字，免费做姓名分析：五格剖象、三才配置、生肖宜忌与音韵节奏，浏览器本地计算，不上传任何数据。'],
};

const src = readFileSync(join(ROOT, 'fortune/index.html'), 'utf8');
for (const a of [ANCHOR, TITLE_ANCHOR, DESC_ANCHOR]) {
  if (!src.includes(a)) {
    console.error('fortune/index.html 里找不到注入锚点，拒绝生成（请同步锚点）: ' + a);
    process.exit(1);
  }
}

writeFileSync(join(ROOT, '404.html'), src.replace(ANCHOR, ANCHOR + '\n    ' + GUARD));
for (const r of ROUTES) {
  const [title, desc] = META[r];
  const url = `https://yuai-r.cn/fortune/${r}/`;
  const og = `\n    <link rel="canonical" href="${url}" />` +
    `\n    <meta property="og:type" content="website" />` +
    `\n    <meta property="og:title" content="${title}" />` +
    `\n    <meta property="og:description" content="${desc}" />` +
    `\n    <meta property="og:url" content="${url}" />` +
    `\n    <meta property="og:image" content="https://yuai-r.cn/egret-ink.jpg" />` +
    `\n    <meta property="og:locale" content="zh_CN" />`;
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
console.log(`已生成 404.html + ${ROUTES.length} 份 fortune/<route>/index.html（含独立 title/description/og）`);
