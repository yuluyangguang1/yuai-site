/* 天机阁 V7 · 合婚（两张八字盘配对评分）
   五个关系与总分是现网 CompatPage-8zh-ri1X.js 里那段**纯函数**（const C={…} 到 ;const U=）逐字搬过来的：
   五合/六合/三合/六冲/五行生克五张表、判词、分数、夹取区间都不自创，门禁 v7_room_compat.mjs
   会把现网那一段 eval 出来当参照实现，逐对比 score 与 desc 字符串。
   唯一改的是名字：现网那条叫 tenGodRelation（十神），实际算的是**年柱纳音五行**的生克，
   与十神无关 —— 界面上按它真正算的东西标「年命」，不跟着错。 */
import { b as GAN_WX, c as ZHI_WX } from './engines/calendar-5JiayZ9g.js';

const HE_GAN = { 甲: '己', 己: '甲', 乙: '庚', 庚: '乙', 丙: '辛', 辛: '丙', 丁: '壬', 壬: '丁', 戊: '癸', 癸: '戊' };
const HE_ZHI = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };
const SAN_HE = [['申', '子', '辰'], ['巳', '酉', '丑'], ['寅', '午', '戌'], ['亥', '卯', '未']];
const CHONG = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳' };
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
const WX = ['木', '火', '土', '金', '水'];

function isSanHe(a, b) { return SAN_HE.some(t => t.includes(a) && t.includes(b)) }

export function stemRel(a, b) {
  const t = a.dayPillar.stem, s = b.dayPillar.stem, w1 = GAN_WX[t], w2 = GAN_WX[s];
  return HE_GAN[t] === s
    ? { score: 25, desc: `日干${t}${s}天干五合，天生默契，互相吸引` }
    : SHENG[w1] === w2 ? { score: 20, desc: `${t}(${w1})生${s}(${w2})，一方付出较多，需相互体谅` }
      : SHENG[w2] === w1 ? { score: 20, desc: `${s}(${w2})生${t}(${w1})，一方付出较多，需相互体谅` }
        : w1 === w2 ? { score: 15, desc: `同属${w1}，志趣相投但可能争执` }
          : KE[w1] === w2 ? { score: 8, desc: `${t}(${w1})克${s}(${w2})，需注意控制欲` }
            : KE[w2] === w1 ? { score: 8, desc: `${s}(${w2})克${t}(${w1})，需注意控制欲` }
              : { score: 12, desc: '天干关系中性' };
}

export function branchRel(a, b) {
  const t = a.dayPillar.branch, s = b.dayPillar.branch;
  if (HE_ZHI[t] === s) return { score: 25, desc: `日支${t}${s}六合，感情融洽，相处和谐` };
  if (isSanHe(t, s)) return { score: 20, desc: `日支${t}${s}三合，志同道合，互相支持` };
  if (CHONG[t] === s) return { score: 5, desc: `日支${t}${s}六冲，容易冲突，需要磨合` };
  const w1 = ZHI_WX[t], w2 = ZHI_WX[s];
  return SHENG[w1] === w2 || SHENG[w2] === w1 ? { score: 18, desc: '日支五行相生，相处融洽' }
    : KE[w1] === w2 || KE[w2] === w1 ? { score: 8, desc: '日支五行相克，需注意沟通方式' }
      : { score: 13, desc: '地支关系中性' };
}

export function wuxingRel(a, b) {
  const t = a.wuxingCount, s = b.wuxingCount;
  let n = 0; const miss = [];
  for (const d of WX) {
    const x = t[d] || 0, y = s[d] || 0;
    if (x <= 1 && y >= 2) { n += 3; miss.push(d) }
    if (y <= 1 && x >= 2) n += 3;
  }
  return n >= 6 ? { score: 22, desc: `五行高度互补：一方${miss.join('')}弱而对方强，互相弥补` }
    : n >= 3 ? { score: 18, desc: '五行部分互补，有一定弥补作用' }
      : { score: 12, desc: '五行相似度高，互相理解但缺少互补' };
}

export function dayPillarRel(a, b) {
  const t = a.dayPillar, s = b.dayPillar;
  if (t.stem === s.stem && t.branch === s.branch) return { score: 18, desc: '日柱完全相同，心意相通但需保持独立' };
  if (HE_GAN[t.stem] === s.stem && HE_ZHI[t.branch] === s.branch) return { score: 25, desc: '日柱天合地合，绝佳婚配组合' };
  const w1 = GAN_WX[t.stem], w2 = GAN_WX[s.stem];
  return KE[w1] === w2 && CHONG[t.branch] === s.branch
    ? { score: 3, desc: '日柱天克地冲，矛盾较多，需要极大包容' }
    : { score: 12, desc: '日柱关系中性' };
}

/* 现网叫 tenGodRelation，算的其实是年柱天干五行 —— 界面标「年命」 */
export function yearRel(a, b) {
  let n = 10;
  const w1 = GAN_WX[a.yearPillar.stem], w2 = GAN_WX[b.yearPillar.stem];
  if (SHENG[w1] === w2 || SHENG[w2] === w1) n += 5;
  if (KE[w1] === w2 || KE[w2] === w1) n -= 3;
  return { score: Math.max(3, Math.min(20, n)), desc: n >= 13 ? '家庭背景相合' : '家庭背景有差异' };
}

export function match(a, b) {
  const g = stemRel(a, b), z = branchRel(a, b), w = wuxingRel(a, b), r = dayPillarRel(a, b), y = yearRel(a, b);
  const score = Math.max(10, Math.min(95, Math.round(g.score + z.score + w.score + r.score + y.score)));
  const level = score >= 85 ? '天作之合' : score >= 70 ? '良缘佳配' : score >= 55 ? '中等姻缘' : score >= 40 ? '需要磨合' : '慎重考虑';
  /* 现网把五条判词又拼了一遍叫 summary，界面上与逐行判词重复，这里不搬 —— 门禁只比五关系、总分与评级。 */
  return { score, level, rel: [['干', g], ['支', z], ['行', w], ['柱', r], ['命', y]] };
}
