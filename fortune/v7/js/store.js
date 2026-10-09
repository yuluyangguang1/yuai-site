/* 天机阁 V7 · 对接层（把老前端的三份「后端」原样接过来）
   现网没有服务端：AI 是浏览器直连 12 家（用户自带 key），历史是 IndexedDB（idb-keyval），设置是 zustand persist。
   这三份契约一律从现网 chunk 的逐字节副本 import，不另写一份实现 —— 换前端不搬数据，用户已有的 key 与命盘记录照旧能用。
   · client-Dh8qB39L.js → AI_PROVIDERS / streamChat(config, messages, signal) 异步生成器（temperature .7、max_tokens 4096 写死在里头）
   · charts-CoeuE4yD.js → 键 fortune-charts 的存/取/删/清空/导出（底层 vendor-db 的 IndexedDB "keyval-store"）
   · localStorage["fortune-settings"] → {"state":{theme,ai:{apiKey,baseUrl,model,format},ziweiSchool},"version":…}
   写设置只并自己动的那几项，其余字段与 version 原样留着 —— 老 SPA 读的是同一份。

   两条从现网读回来的规矩，别自己发明：
   ① 老 SPA 从不写 ai.provider：「当前用哪家」是拿 baseUrl 反查表得出的（SettingsPage 里那句 find）。
      所以这里也只认 baseUrl，多存一个 provider 字段只会造出两个真相互相打脸。
   ② 发给 streamChat 的就是存下来的那个 ai 对象本身，不补默认值。
      没填 Key 时它自己抛「API Key 未配置，请在设置中填写」—— 那是现网的真话，不是要兜的错。 */
import { AI_PROVIDERS, streamChat } from './engines/client-Dh8qB39L.js';
import { s as saveChart, g as listCharts, d as dropChart,
  c as clearCharts, e as dumpCharts, a as downloadCharts } from './engines/charts-CoeuE4yD.js';

const KEY = 'fortune-settings';
/* 分组与顺序照抄现网 SettingsPage 那个 y —— 用户在两版皮里看到的该是同一份清单 */
const GROUPS = [
  { label: '国内模型', items: ['deepseek', 'qwen', 'zhipu', 'moonshot', 'minimax', 'baichuan', 'mimo', 'siliconflow'] },
  { label: '海外模型', items: ['openai', 'claude', 'openrouter'] },
  { label: '自定义', items: ['custom'] }
];

function load() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null');
    return p && typeof p === 'object' && !Array.isArray(p) ? p : { state: {}, version: 0 };
  } catch (e) { return { state: {}, version: 0 } }
}
function state() { const p = load(); return p.state && typeof p.state === 'object' ? p.state : {} }
function patch(next) {
  const p = load();
  p.state = Object.assign({}, p.state, next);
  localStorage.setItem(KEY, JSON.stringify(p));
  return p.state;
}

export const PROVIDERS = AI_PROVIDERS;
export const GROUP_ORDER = GROUPS;

/* 存下来的那份 ai（老用户只存过 key 也照样读得到；不补默认值，理由见开头） */
export function aiState() { const a = state().ai; return a && typeof a === 'object' ? a : {} }
export const setAI = next => patch({ ai: Object.assign({}, aiState(), next) }).ai;
export const hasKey = () => !!aiState().apiKey;

/* baseUrl 反查表：[键, 那一家] 或 null（自定义地址就查不出） */
export function matched() {
  const url = aiState().baseUrl;
  return Object.entries(AI_PROVIDERS).filter(function (e) { return e[1].baseUrl === url })[0] || null;
}

/* 换一家 = 把它那三项覆写过去（现网 p(t) 就是这个动作），Key 由用户自己留着 */
export function pick(key) {
  const p = AI_PROVIDERS[key];
  if (!p) return aiState();
  return setAI({ baseUrl: p.baseUrl, model: p.model, format: p.format });
}

/* 一次流式问答：messages 就是 [{role,content}]，onToken 拿增量，signal 用来「停下来」 */
export async function ask(messages, onToken, signal) {
  let text = '';
  for await (const d of streamChat(aiState(), messages, signal)) {
    text += d;
    if (onToken) onToken(d);
  }
  return text;
}

export const history = {
  save: saveChart, list: listCharts, drop: dropChart,
  clear: clearCharts, dump: dumpCharts, download: downloadCharts
};
