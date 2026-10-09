/* 每日天机：把顶屏那几行填成今天的黄历。
   引擎用站点线上那一份（engine-lunar.js，与 /fortune/almanac/ 页 import 的同一个 chunk），
   不是我自己另算一套 —— 样张上的数字必须和线上黄历页一字不差，否则评审时看不出的错会跟着上线。
   取法照抄 js_AlmanacPage：Solar.fromYmd(...).getLunar() 再拿各个 getter。
   HTML 里预置的是「写下这份样张那天」的真值（2026-10-03），脚本挂了也还是一页能看的黄历；
   脚本到位后逐格覆写。模块脚本天生 defer，不必等 load。 */
import { S } from './engines/engine-lunar-Dw0xM7Kz.js';

(function () {
  var box = document.getElementById('sky');
  if (!box) return;
  var now = new Date();
  var solar = S.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate());
  var l = solar.getLunar();
  var out = {
    solar: now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 星期' + solar.getWeekInChinese(),
    lunar: '农历' + l.getMonthInChinese() + '月' + l.getDayInChinese(),
    yg: l.getYearGan() + l.getYearZhi(),
    mg: l.getMonthGan() + l.getMonthZhi(),
    dg: l.getDayGan() + l.getDayZhi(),
    yi: l.getDayYi().join(' '),
    ji: l.getDayJi().join(' '),
    jishen: l.getDayJiShen().join(' '),
    xiong: l.getDayXiongSha().join(' '),
    /* 引擎给的是「(甲辰)龙」这种带括号的写法，界面上念不顺，去掉括号 */
    chong: '冲' + l.getDayChongDesc().replace(/[()（）]/g, ''),
    sha: '煞' + l.getDaySha(),
    na: '纳音' + l.getDayNaYin(),
    /* 节气只在当天有；空串时 CSS 用 :empty 把这格收掉，不留一个孤点 */
    jieqi: l.getJieQi() ? '· 今日' + l.getJieQi() : ''
  };
  Object.keys(out).forEach(function (k) {
    var n = box.querySelector('[data-a=' + k + ']');
    if (n) n.textContent = out[k];
  });
  window.__almanac = out;
})();
