/* 天机阁 V7 · 门内（room）
   推开门之后要有东西可填、填完要有真盘可看。这一份是 schema 驱动的：
   每个模块声明「要哪几个字段 + 用哪个引擎算 + 怎么摆」，渲染与校验只有一套代码 —— 一套皮。
   引擎就是现网那几份 chunk（engines/ 下按 hash 名原样放着，Node 与浏览器同一字节）：
   · calculator 的 hour 是**时辰地支序号 0-11**（0=子…11=亥），与老页面 select 同一个口径；
     本地那份已修两处线上缺陷（时辰取到末边界、年柱按正月初一），见任务 #132 与 v7_engine_bazi.mjs。
   · engine-lunar 就是线上 /fortune/almanac/ 用的那一份，黄历字段取法照抄 js_AlmanacPage 的 x()。
   还没接引擎的门（紫微/互参/起名/六爻/塔罗/總論）不摆假书：给一条明确的退路，
   链回现成页面 —— 那些页面本来就在跑，且算的是同一套引擎。 */
import { c as bazi } from './engines/calculator-DFDjMkV1.js';
import { S } from './engines/engine-lunar-Dw0xM7Kz.js';
import { weigh, qianText } from './bone.js';
import { match } from './compat.js';
import { a as ziweiChart, g as ziweiNature, d as ziweiPatterns } from './engines/patterns-D65IVYSo.js';
import { c as shensha } from './engines/shensha-xsIBYm4f.js';
import { cast } from './iching.js';
import { draw as tarotDraw, SPREADS } from './tarot.js';
import { history, hasKey, ask } from './store.js';
import { ASK } from './prompts.js';

(async function () {
  /* 起名用的字库（康熙笔画 + 释义，约 290KB）在现网 NamingPage 那一包里，只有走到这道门才动态取 */
  var room = document.getElementById('room');
  var art = document.getElementById('art');
  if (!room || !art) return;

  var ZHI = '子丑寅卯辰巳午未申酉戌亥';
  var GAN = '甲乙丙丁戊己庚辛壬癸';
  var SHI = ['23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00', '07:00-09:00', '09:00-11:00',
    '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'];
  var WX = ['木', '火', '土', '金', '水'];
  /* 紫微十二宫的读盘顺序（不是地支顺序）；亮度与格局等级都按现网字段的枚举翻成汉字 */
  var PALACE_ORDER = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'];
  var BRIGHT = { bright: '庙旺', normal: '平', dim: '陷' };
  var LEVEL = { excellent: '上', good: '吉', neutral: '平', caution: '慎' };
  /* 爻位自下而上：初、二、三、四、五、上（阳称九、阴称六） */
  var YAO_POS = ['初', '二', '三', '四', '五', '上'];
  var ZOO = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
  var NAM = null;
  var HOME = '/fortune/';   /* 门页自己就是这一术的页面，站内唯一还能往外去的地方是阁楼 */
  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n }
  function pad(n) { return n < 10 ? '0' + n : '' + n }
  function today() { var d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate()] }

  /* 黄历一格：与线上 js_AlmanacPage 的 x() 同一套 getter，字段名也不自创 */
  function almanac(y, m, d) {
    var s = S.fromYmd(y, m, d), l = s.getLunar();
    return {
      solar: y + '年' + m + '月' + d + '日 星期' + s.getWeekInChinese(),
      lunar: '农历' + l.getMonthInChinese() + '月' + l.getDayInChinese(),
      pillars: [l.getYearGan() + l.getYearZhi() + '年', l.getMonthGan() + l.getMonthZhi() + '月',
        l.getDayGan() + l.getDayZhi() + '日'],
      yi: l.getDayYi(), ji: l.getDayJi(),
      jishen: l.getDayJiShen(), xiong: l.getDayXiongSha(),
      chong: '冲' + l.getDayChongDesc().replace(/[()（）]/g, ''), sha: '煞' + l.getDaySha(),
      na: '纳音' + l.getDayNaYin(), jq: l.getJieQi()
    };
  }
  function drawAlmanac(box, a) {
    box.textContent = '';
    var head = el('div', 'tt-room__when');
    head.appendChild(el('span', 'tt-room__big', a.pillars[2].slice(0, 2)));
    head.appendChild(el('span', 'tt-room__sub', a.solar + ' · ' + a.lunar + (a.jq ? ' · 今日' + a.jq : '')));
    box.appendChild(head);
    [['宜', a.yi, 'yi'], ['忌', a.ji, 'ji']].forEach(function (row) {
      var r = el('div', 'tt-room__row');
      r.appendChild(el('span', 'tt-room__mark tt-room__mark--' + row[2], row[0]));
      r.appendChild(el('span', 'tt-room__list', row[1].join(' ')));
      box.appendChild(r);
    });
    var meta = el('p', 'tt-room__meta');
    [a.chong, a.sha, a.na].forEach(function (t, i) {
      if (i) meta.appendChild(el('span', 'tt-room__sep', '·'));
      meta.appendChild(el('span', null, t));
    });
    box.appendChild(meta);
    var gods = el('p', 'tt-room__meta');
    gods.appendChild(el('span', 'tt-room__gk', '吉神'));
    gods.appendChild(el('span', 'tt-room__gv', a.jishen.join(' ')));
    gods.appendChild(el('span', 'tt-room__gk', '凶煞'));
    gods.appendChild(el('span', 'tt-room__gv', a.xiong.join(' ')));
    box.appendChild(gods);
  }
  /* 日期合法性必须回读校验：new Date(2026,1,30) 会自己滚成 3 月 2 日，悄悄给一张错盘 */
  function valid(y, m, d) {
    return y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31
      && new Date(y, m - 1, d).getDate() === d;
  }
  /* 四柱格与五行条是八字门与互参门共用的两块版面 —— 一处写，两处摆 */
  function drawPillars(box, r, notes) {
    var cols = [['年柱', r.yearPillar], ['月柱', r.monthPillar], ['日柱', r.dayPillar], ['时柱', r.hourPillar]];
    var grid = el('div', 'tt-room__pillars');
    cols.forEach(function (c, i) {
      var cell = el('div', 'tt-room__pillar');
      cell.appendChild(el('span', 'tt-room__pk', c[0]));
      cell.appendChild(el('span', 'tt-room__pz', c[1].stem + c[1].branch));
      cell.appendChild(el('span', 'tt-room__pw', c[1].stemWuxing + '·' + c[1].branchWuxing));
      cell.appendChild(el('span', 'tt-room__pn', notes ? notes[i] : c[1].nayin));
      grid.appendChild(cell);
    });
    box.appendChild(grid);
  }
  /* iztro 给的宫位是按地支排的，读盘要按十二宫的顺序 —— 两处（紫微门、互参门）共用这一份排序 */
  function palaces(z) {
    return PALACE_ORDER.map(function (n) {
      return z.palaces.filter(function (p) { return p.name === n })[0];
    }).filter(Boolean);
  }
  function drawWuxing(box, counts) {
    var bars = el('div', 'tt-room__wx'), max = 1;
    WX.forEach(function (w) { max = Math.max(max, counts[w] || 0) });
    WX.forEach(function (w) {
      var v = counts[w] || 0, row = el('div', 'tt-room__wxrow');
      row.appendChild(el('span', 'tt-room__wxk', w));
      var bar = el('span', 'tt-room__wxbar');
      /* 条宽走行内 0-1，色与形制都在 CSS 里 —— 组件层零色值也零实数宽度 */
      bar.style.setProperty('--tt-wx-n', (v / max).toFixed(3));
      bar.setAttribute('aria-hidden', 'true');
      row.appendChild(bar);
      row.appendChild(el('span', 'tt-room__wxv', v ? v + ' 见' : '不现'));
      bars.appendChild(row);
    });
    box.appendChild(bars);
  }

  /* ── schema：一门一条 ─────────────────────────────────── */
  var SCHEMA = {
    bazi: {
      title: '四柱八字', hint: '填生时贴，门内就地排盘',
      fields: function (t) {
        return [
          { k: 'year', label: '年', type: 'number', v: t[0] - 25, min: 1900, max: 2100 },
          { k: 'month', label: '月', type: 'number', v: 6, min: 1, max: 12 },
          { k: 'day', label: '日', type: 'number', v: 15, min: 1, max: 31 },
          { k: 'hour', label: '时辰', opts: ZHI.split('').map(function (z, i) { return { v: i, t: z + '时（' + SHI[i] + '）' } }) },
          { k: 'gender', label: '性别', opts: [{ v: 'male', t: '男' }, { v: 'female', t: '女' }] }
        ];
      },
      read: function (g) {
        var y = +g('year'), m = +g('month'), d = +g('day'), h = +g('hour');
        if (!valid(y, m, d) || h < 0 || h > 11) return { err: '年月日时先填全（1900-2100，时辰 0-11）' };
        return { ok: bazi({ year: y, month: m, day: d, hour: h }), gender: g('gender') };
      },
      draw: function (box, r, gender) {
        drawPillars(box, r, ['祖上/少年', '父母/青年', '自身/中年', '子女/晚年']);
        var god = el('p', 'tt-room__row2');
        god.appendChild(el('span', 'tt-room__gk', '日主'));
        god.appendChild(el('span', 'tt-room__gv', r.dayMaster + r.dayMasterWuxing + (r.dayMasterYinYang || '')
          + ' · ' + (gender === 'female' ? '女' : '男')));
        (r.shishen || []).forEach(function (s) {
          var chip = el('span', 'tt-room__chip');
          chip.appendChild(el('b', null, s.name));
          chip.appendChild(el('i', null, s.stem + s.type));
          god.appendChild(chip);
        });
        box.appendChild(god);
        drawWuxing(box, r.wuxingCount);
        var ny = el('p', 'tt-room__row2');
        ny.appendChild(el('span', 'tt-room__gk', '纳音'));
        (r.nayin || []).forEach(function (n) { ny.appendChild(el('span', 'tt-room__nv', n)) });
        box.appendChild(ny);
      }
    },
    daily: {
      title: '每日天机', hint: '今日宜忌 · 往后七日一览', go: '查今日',
      fields: function (t) {
        return [{ k: 'year', label: '年', type: 'number', v: t[0], min: 1900, max: 2100 },
          { k: 'month', label: '月', type: 'number', v: t[1], min: 1, max: 12 },
          { k: 'day', label: '日', type: 'number', v: t[2], min: 1, max: 31 }];
      },
      read: function (g) {
        var y = +g('year'), m = +g('month'), d = +g('day');
        if (!valid(y, m, d)) return { err: '日期不在 1900-2100 之内' };
        return { ok: almanac(y, m, d) };
      },
      draw: function (box, a) {
        drawAlmanac(box, a);
        var t = today(), list = el('div', 'tt-room__days');
        for (var i = 1; i <= 7; i++) {
          var nd = new Date(t[0], t[1] - 1, t[2] + i);
          var r = almanac(nd.getFullYear(), nd.getMonth() + 1, nd.getDate());
          var row = el('div', 'tt-room__day');
          row.appendChild(el('span', 'tt-room__dayk', (nd.getMonth() + 1) + '/' + nd.getDate()));
          row.appendChild(el('span', 'tt-room__dayz', r.pillars[2].slice(0, 2)));
          row.appendChild(el('span', 'tt-room__dayy', '宜 ' + r.yi.slice(0, 3).join(' ')));
          row.appendChild(el('span', 'tt-room__dayj', '忌 ' + r.ji.slice(0, 3).join(' ')));
          list.appendChild(row);
        }
        box.appendChild(el('p', 'tt-room__gk', '往后七日'));
        box.appendChild(list);
      }
    },
    almanac: {
      title: '择日', hint: '择其一事 · 往后三十日里挑', go: '择日',
      fields: function (t) {
        return [{ k: 'year', label: '年', type: 'number', v: t[0], min: 1900, max: 2100 },
          { k: 'month', label: '月', type: 'number', v: t[1], min: 1, max: 12 },
          { k: 'day', label: '日', type: 'number', v: t[2], min: 1, max: 31 },
          { k: 'event', label: '事由', opts: ['嫁娶', '入宅', '动土', '出行', '祭祀', '开业', '安葬']
            .map(function (x) { return { v: x, t: x } }) }];
      },
      read: function (g) {
        var y = +g('year'), m = +g('month'), d = +g('day');
        if (!valid(y, m, d)) return { err: '日期不在 1900-2100 之内' };
        return { ok: { a: almanac(y, m, d), ev: g('event') } };
      },
      draw: function (box, o) {
        drawAlmanac(box, o.a);
        var hit = [], t = new Date(o.a.solar.match(/^\d+/) * 1, 0, 1);
        var base = today();
        t = new Date(base[0], base[1] - 1, base[2]);
        for (var i = 0; i < 30; i++) {
          var nd = new Date(t.getFullYear(), t.getMonth(), t.getDate() + i);
          var r = almanac(nd.getFullYear(), nd.getMonth() + 1, nd.getDate());
          if (r.yi.indexOf(o.ev) >= 0 && r.ji.indexOf(o.ev) < 0) {
            hit.push((nd.getMonth() + 1) + '月' + nd.getDate() + '日 ' + r.pillars[2].slice(0, 2) + '日 ' + r.chong);
          }
        }
        box.appendChild(el('p', 'tt-room__gk', '「' + o.ev + '」往后三十日内可选'));
        var list = el('div', 'tt-room__hits');
        if (!hit.length) list.appendChild(el('p', 'tt-room__none', '这三十日里没有相宜的日子 · 换一事或往后再接着看'));
        hit.slice(0, 8).forEach(function (h) { list.appendChild(el('p', 'tt-room__hit', h)) });
        box.appendChild(list);
      }
    },
    bone: {
      title: '称骨歌', hint: '填生辰 · 四表称骨，批语全文', go: '称骨',
      fields: function (t) {
        return [
          { k: 'year', label: '年', type: 'number', v: t[0] - 25, min: 1900, max: 2100 },
          { k: 'month', label: '月', type: 'number', v: 6, min: 1, max: 12 },
          { k: 'day', label: '日', type: 'number', v: 15, min: 1, max: 31 },
          { k: 'hour', label: '时辰', opts: ZHI.split('').map(function (z, i) { return { v: i, t: z + '时（' + SHI[i] + '）' } }) }
        ];
      },
      read: function (g) {
        var y = +g('year'), m = +g('month'), d = +g('day'), h = +g('hour');
        if (!valid(y, m, d) || h < 0 || h > 11) return { err: '年月日时先填全（1900-2100）' };
        var l = S.fromYmd(y, m, d).getLunar();
        var gz = l.getYearGan() + l.getYearZhi();
        var r = weigh(gz, l.getMonth(), l.getDay(), h);
        if (!r) return { err: '这一刻称不出骨重，换一个时辰试试' };
        return {
          ok: {
            r: r, gz: gz, lm: l.getMonthInChinese(), ld: l.getDayInChinese(),
            solar: y + '年' + m + '月' + d + '日', hour: ZHI.charAt(h) + '时', rng: SHI[h]
          }
        };
      },
      draw: function (box, o) {
        var r = o.r;
        var head = el('div', 'tt-room__when');
        head.appendChild(el('span', 'tt-room__big', r.text));
        head.appendChild(el('span', 'tt-room__sub',
          '共' + qianText(r.total) + '钱 · ' + o.gz + '年' + o.lm + '月' + o.ld + '日' + o.hour + '（' + o.solar + '）'));
        box.appendChild(head);
        var grid = el('div', 'tt-room__pillars');
        [['年', o.gz, r.y, '干支'], ['月', o.lm + '月', r.m, '农历'],
          ['日', o.ld, r.d, '农历'], ['时', o.hour, r.h, o.rng]].forEach(function (c) {
            var cell = el('div', 'tt-room__pillar');
            cell.appendChild(el('span', 'tt-room__pk', c[0]));
            cell.appendChild(el('span', 'tt-room__pz', c[1]));
            cell.appendChild(el('span', 'tt-room__pw', qianText(c[2]) + '钱'));
            cell.appendChild(el('span', 'tt-room__pn', c[3]));
            grid.appendChild(cell);
          });
        box.appendChild(grid);
        var verse = el('div', 'tt-room__verse');
        r.poem.forEach(function (p) { verse.appendChild(el('p', 'tt-room__poem', p)) });
        r.prose.forEach(function (p) { verse.appendChild(el('p', 'tt-room__prose', p)) });
        box.appendChild(verse);
        box.appendChild(el('p', 'tt-room__meta',
          '骨重明细：年' + r.y + ' + 月' + r.m + ' + 日' + r.d + ' + 时' + r.h + ' = ' + r.total + '钱'));
        box.appendChild(el('p', 'tt-room__foot',
          '骨重按年柱（农历正月初一）· 农历月 · 农历日 · 时辰四表相加；闰月并本月。批语取袁天罡称骨歌全文。'));
      }
    },
    compat: {
      title: '合婚', hint: '两张生时贴 · 五关系评分', go: '合婚',
      fields: function (t) {
        var hour = ZHI.split('').map(function (z, i) { return { v: i, t: z + '时（' + SHI[i] + '）' } });
        var one = function (p, head) {
          return [
            { k: p + 'year', head: head, label: '年', type: 'number', v: t[0] - 25, min: 1900, max: 2100 },
            { k: p + 'month', label: '月', type: 'number', v: 6, min: 1, max: 12 },
            { k: p + 'day', label: '日', type: 'number', v: 15, min: 1, max: 31 },
            { k: p + 'hour', label: '时辰', opts: hour }
          ];
        };
        return one('a', '甲方').concat(one('b', '乙方'));
      },
      read: function (g) {
        var one = function (p) {
          var y = +g(p + 'year'), m = +g(p + 'month'), d = +g(p + 'day'), h = +g(p + 'hour');
          if (!valid(y, m, d) || h < 0 || h > 11) return null;
          return bazi({ year: y, month: m, day: d, hour: h });
        };
        var a = one('a'), b = one('b');
        if (!a || !b) return { err: '两人的年、月、日、时都要填全（1900-2100）' };
        return { ok: { a: a, b: b, m: match(a, b) } };
      },
      draw: function (box, o) {
        var m = o.m;
        var head = el('div', 'tt-room__when');
        /* 分数是数字，不跟着匾额走 .18em 字距 —— 「7 4 分」会读成两个数 */
        head.appendChild(el('span', 'tt-room__big tt-room__big--num', m.score + ' 分'));
        head.appendChild(el('span', 'tt-room__sub', m.level));
        box.appendChild(head);
        var list = el('div', 'tt-room__rels');
        m.rel.forEach(function (r) {
          var row = el('div', 'tt-room__rel');
          row.appendChild(el('span', 'tt-room__rk', r[0]));
          row.appendChild(el('span', 'tt-room__rv', r[1].desc));
          row.appendChild(el('span', 'tt-room__rs', r[1].score + ' 分'));
          list.appendChild(row);
        });
        box.appendChild(list);
        [['甲', o.a], ['乙', o.b]].forEach(function (p) {
          var line = el('p', 'tt-room__meta');
          line.appendChild(el('span', 'tt-room__gk', p[0] + '方四柱'));
          [p[1].yearPillar, p[1].monthPillar, p[1].dayPillar, p[1].hourPillar].forEach(function (x) {
            line.appendChild(el('span', 'tt-room__nv', x.stem + x.branch));
          });
          box.appendChild(line);
        });
        box.appendChild(el('p', 'tt-room__foot',
          '评分看五件事：日干五合生克、日支六合三合六冲、五行互补、日柱关系、年命相生相克。同一套算法与现网合婚页一致。'));
      }
    },
    ziwei: {
      title: '紫微斗数', hint: '填生时贴 · 十二宫就地排盘', go: '起盘',
      fields: function (t) {
        return [
          { k: 'year', label: '年', type: 'number', v: t[0] - 25, min: 1900, max: 2100 },
          { k: 'month', label: '月', type: 'number', v: 6, min: 1, max: 12 },
          { k: 'day', label: '日', type: 'number', v: 15, min: 1, max: 31 },
          { k: 'hour', label: '时辰', opts: ZHI.split('').map(function (z, i) { return { v: i, t: z + '时（' + SHI[i] + '）' } }) },
          { k: 'gender', label: '性别', opts: [{ v: 'male', t: '男' }, { v: 'female', t: '女' }] }
        ];
      },
      read: function (g) {
        var y = +g('year'), m = +g('month'), d = +g('day'), h = +g('hour');
        if (!valid(y, m, d) || h < 0 || h > 11) return { err: '年月日时先填全（1900-2100）' };
        var c = ziweiChart({ year: y, month: m, day: d, hour: h, gender: g('gender') });
        if (!c || !c.palaces || c.palaces.length !== 12) return { err: '这一刻排不出盘，换一个时辰试试' };
        return { ok: { c: c, t: ziweiNature(c), p: ziweiPatterns(c) } };
      },
      draw: function (box, o, gender) {
        var c = o.c, ming = null, shen = null;
        var gz = function (p) { return GAN.charAt(p.stem) + ZHI.charAt(p.branch) };
        c.palaces.forEach(function (p) { if (p.name === '命宫') ming = p; if (p.isShenGong) shen = p });
        var head = el('div', 'tt-room__when');
        head.appendChild(el('span', 'tt-room__big', c.wuxingJuName));
        head.appendChild(el('span', 'tt-room__sub', '命宫' + gz(ming) + (shen ? ' · 身宫' + ZHI.charAt(shen.branch) : '')
          + ' · 紫微在' + ZHI.charAt(c.ziweiPos) + ' · ' + (gender === 'female' ? '女' : '男') + '命 · 虚岁' + c.currentAge));
        box.appendChild(head);
        var list = el('div', 'tt-room__rels');
        palaces(c).forEach(function (p) {
          var majors = p.stars.filter(function (s) { return s.type === 'major' });
          var txt = majors.length
            ? majors.map(function (s) { return s.name + '（' + BRIGHT[s.brightness] + (s.siHua ? '·化' + s.siHua : '') + '）' }).join(' ')
            : '空宫 · 借对宫' + ((p.borrowedStars || []).length ? (p.borrowedStars || []).join('、') : '亦无主星');
          var rest = p.stars.length - majors.length;
          if (rest > 0) txt += ' · 辅煞' + qianText(rest) + '曜';
          var row = el('div', 'tt-room__rel');
          row.appendChild(el('span', 'tt-room__rk', p.name));
          row.appendChild(el('span', 'tt-room__rv', txt));
          row.appendChild(el('span', 'tt-room__rs', gz(p) + (p.daXianAge ? ' ' + p.daXianAge[0] + '–' + p.daXianAge[1] : '')
            + (p.isCurrentDaXian ? ' 行限' : '')));
          list.appendChild(row);
        });
        box.appendChild(list);
        var kw = el('p', 'tt-room__row2');
        kw.appendChild(el('span', 'tt-room__gk', '命宫'));
        if (o.t.keywords.length) o.t.keywords.forEach(function (k) { kw.appendChild(el('span', 'tt-room__chip', k)) });
        else kw.appendChild(el('span', 'tt-room__gv', o.t.nature || '空宫'));
        box.appendChild(kw);
        if (o.p.length) {
          box.appendChild(el('p', 'tt-room__gk', '格局' + qianText(o.p.length) + '条'));
          var pl = el('div', 'tt-room__rels');
          o.p.forEach(function (f) {
            var row = el('div', 'tt-room__rel');
            row.appendChild(el('span', 'tt-room__rk', '格'));
            row.appendChild(el('span', 'tt-room__rv', f.name + '：' + f.description));
            row.appendChild(el('span', 'tt-room__rs', LEVEL[f.level] || f.level));
            pl.appendChild(row);
          });
          box.appendChild(pl);
        }
        box.appendChild(el('p', 'tt-room__foot',
          '星曜、四化与大限由现网同一份 iztro + patterns 起盘；命宫、身宫按「寅起正月」口诀复核，五行局取命宫干支纳音。'));
      }
    },
    iching: {
      title: '起卦断易', hint: '一掷成卦 · 本卦、动爻、变卦', go: '起卦',
      fields: function () {
        return [
          { k: 'method', label: '方式', opts: [{ v: 'coin', t: '三枚铜钱' }, { v: 'yarrow', t: '蓍草十八变' },
            { v: 'quick', t: '快速一掷' }, { v: 'number', t: '两数报卦' }] },
          { k: 'n1', label: '数一', type: 'number', v: 3, min: 1, max: 999 },
          { k: 'n2', label: '数二', type: 'number', v: 5, min: 1, max: 999 }
        ];
      },
      read: function (g) {
        var m = g('method'), a = +g('n1'), b = +g('n2');
        if (m === 'number' && (!(a >= 1) || !(b >= 1))) return { err: '两数报卦要先填两个正整数' };
        var r = cast(m, a, b);
        if (!r || !r.hexagram || !r.lines || r.lines.length !== 6) return { err: '这一卦起不出来，换一种方式再试' };
        return { ok: r };
      },
      draw: function (box, r) {
        var hx = r.hexagram, mv = r.movingLines || [], lines = r.lines;
        var head = el('div', 'tt-room__when');
        head.appendChild(el('span', 'tt-room__big', hx.name));
        head.appendChild(el('span', 'tt-room__sub', hx.symbol + ' 上' + hx.upper + ' 下' + hx.lower
          + ' · ' + r.method + (mv.length ? ' · 动爻' + qianText(mv.length) : ' · 六爻安静')));
        box.appendChild(head);
        var list = el('div', 'tt-room__rels');
        for (var i = 5; i >= 0; i--) {
          var yang = lines[i] === 'young_yang' || lines[i] === 'old_yang';
          var move = mv.indexOf(i + 1) >= 0;
          /* 爻位名：初与上在前（初九、上六），二三四五在后（九二、六五） */
          var yao = yang ? '九' : '六';
          var row = el('div', 'tt-room__rel');
          row.appendChild(el('span', 'tt-room__rk',
            i === 0 ? '初' + yao : i === 5 ? '上' + yao : yao + YAO_POS[i]));
          var cell = el('span', 'tt-room__rv');
          var bar = el('span', 'tt-room__yao' + (yang ? '' : ' tt-room__yao--yin'));
          bar.setAttribute('aria-hidden', 'true');
          cell.appendChild(bar);
          cell.appendChild(document.createTextNode(hx.lines[i]));
          row.appendChild(cell);
          row.appendChild(el('span', 'tt-room__rs' + (move ? ' tt-room__rs--move' : ''), move ? '动' : ''));
          list.appendChild(row);
        }
        box.appendChild(list);
        var ju = el('p', 'tt-room__row2');
        ju.appendChild(el('span', 'tt-room__gk', '卦辞'));
        ju.appendChild(el('span', 'tt-room__gv', hx.judgment));
        box.appendChild(ju);
        box.appendChild(el('p', 'tt-room__prose', hx.image));
        var kw = el('p', 'tt-room__row2');
        kw.appendChild(el('span', 'tt-room__gk', '象义'));
        hx.keywords.forEach(function (x) { kw.appendChild(el('span', 'tt-room__chip', x)) });
        box.appendChild(kw);
        if (r.changedHexagram) {
          var ch = el('p', 'tt-room__row2');
          ch.appendChild(el('span', 'tt-room__gk', '变卦'));
          ch.appendChild(el('span', 'tt-room__gv', r.changedHexagram.symbol + ' ' + r.changedHexagram.name
            + ' · ' + r.changedHexagram.judgment));
          box.appendChild(ch);
        }
        box.appendChild(el('p', 'tt-room__foot',
          '卦名、卦辞、象辞与六爻爻辞用现网同一份六十四卦表，起卦概率与现网一致。这一门只断本卦、动爻与变卦，六亲、世应、纳甲未装。'));
      }
    },
    tarot: {
      title: '塔罗', hint: '选一副牌阵 · 抽牌即断', go: '抽牌',
      fields: function () {
        return [
          { k: 'spread', label: '牌阵', opts: SPREADS.map(function (s) { return { v: s.id, t: s.nameCn + ' · ' + qianText(s.positions.length) + '张' } }) },
          { k: 'rev', label: '逆位', opts: [{ v: '1', t: '允许逆位' }, { v: '0', t: '只用正位' }] }
        ];
      },
      read: function (g) {
        var r = tarotDraw(g('spread'), g('rev') !== '0');
        if (!r || !r.cards || !r.cards.length) return { err: '这一副牌没抽出来，换一副牌阵再试' };
        return { ok: r };
      },
      draw: function (box, r) {
        var rev = r.cards.filter(function (c) { return c.reversed }).length;
        var head = el('div', 'tt-room__when');
        head.appendChild(el('span', 'tt-room__big', r.spread.nameCn));
        head.appendChild(el('span', 'tt-room__sub', qianText(r.cards.length) + '张 · '
          + (rev ? '逆位' + qianText(rev) + '张' : '全部正位')));
        box.appendChild(head);
        var list = el('div', 'tt-room__rels');
        r.cards.forEach(function (c) {
          var kws = (c.reversed ? c.card.reversedKeywords : c.card.keywords) || [];
          var row = el('div', 'tt-room__rel');
          row.appendChild(el('span', 'tt-room__rk', c.position));
          row.appendChild(el('span', 'tt-room__rv',
            c.card.nameCn + '（' + (c.reversed ? '逆' : '正') + '）· ' + kws.join('、')));
          row.appendChild(el('span', 'tt-room__rs', c.card.element));
          list.appendChild(row);
        });
        box.appendChild(list);
        box.appendChild(el('p', 'tt-room__foot',
          '七十八张牌、牌阵与位置名沿用现网塔罗页同一份表；整副洗牌后按位取牌，逆位概率二分之一。'));
      }
    },
    naming: {
      title: '起名', hint: '姓氏与生时贴 · 按喜用拟名', go: '拟名',
      fields: function (t) {
        return [
          { k: 'surname', head: '姓名', label: '姓', type: 'text', v: '李' },
          { k: 'len', label: '名字数', opts: [{ v: '1', t: '单字名' }, { v: '2', t: '双字名' }] },
          { k: 'year', head: '生时贴', label: '年', type: 'number', v: t[0] - 26, min: 1900, max: 2100 },
          { k: 'month', label: '月', type: 'number', v: 6, min: 1, max: 12 },
          { k: 'day', label: '日', type: 'number', v: 15, min: 1, max: 31 },
          { k: 'hour', label: '时辰', opts: ZHI.split('').map(function (z, i) { return { v: i, t: z + '时（' + SHI[i] + '）' } }) },
          { k: 'gender', label: '性别', opts: [{ v: 'male', t: '男' }, { v: 'female', t: '女' }] }
        ];
      },
      read: function (g) {
        if (!NAM) return { err: '字库还在路上，稍等一下再按' };
        var sn = (g('surname') || '').trim(), sc = Array.from(sn);
        if (!sc.length || sc.length > 2) return { err: '姓氏请输一到两个字' };
        var y = +g('year'), m = +g('month'), d = +g('day'), h = +g('hour'), len = +g('len');
        if (!valid(y, m, d) || h < 0 || h > 11) return { err: '年月日时先填全（1900-2100）' };
        var b = bazi({ year: y, month: m, day: d, hour: h });
        var xi = NAM.pickXiYong(b.wuxingCount);
        /* 生肖按农历年支（与称骨同一口径）；现网起名页用的是 (公元年-4)%12 */
        var zoo = ZOO[ZHI.indexOf(S.fromYmd(y, m, d).getLunar().getYearZhi())];
        var r = NAM.genNames(sc, len, g('gender'), zoo, xi.set, []), relaxed = false;
        if (!r.items.length) { relaxed = true; r = NAM.genNames(sc, len, g('gender'), zoo, null, []) }
        if (!r.items.length) return { err: '这个姓氏在五格约束下拟不出名字，换单字名或双字名再试' };
        return { ok: { b: b, xi: xi, zoo: zoo, r: r, relaxed: relaxed, sn: sn, len: len, gender: g('gender') } };
      },
      draw: function (box, o) {
        var head = el('div', 'tt-room__when');
        head.appendChild(el('span', 'tt-room__big', o.xi.set.join('、')));
        head.appendChild(el('span', 'tt-room__sub', '喜用神 · 四柱 '
          + [o.b.yearPillar, o.b.monthPillar, o.b.dayPillar, o.b.hourPillar].map(function (p) { return p.stem + p.branch }).join(' ')
          + ' · 属' + o.zoo + ' · ' + (o.gender === 'female' ? '女' : '男')));
        box.appendChild(head);
        box.appendChild(el('p', 'tt-room__meta', '拟' + qianText(o.len) + '字名 · 候选' + qianText(o.r.items.length)
          + '个 · 可用字池 ' + o.r.poolSize + ' 个（按五格吉凶、三才、生肖宜忌与音韵排序）'));
        var list = el('div', 'tt-room__rels');
        o.r.items.forEach(function (it) {
          var row = el('div', 'tt-room__rel');
          row.appendChild(el('span', 'tt-room__rk', o.sn + it.name));
          row.appendChild(el('span', 'tt-room__rv',
            it.py.replace(/\d+/g, '') + ' · ' + it.sk + ' 画 · 三才' + it.sancai.l + ' · 人格' + it.ge.人格.luck + ' 地格' + it.ge.地格.luck));
          row.appendChild(el('span', 'tt-room__rs', it.parts.map(function (p) { return p.wx }).join('')));
          list.appendChild(row);
        });
        box.appendChild(list);
        var defs = el('div', 'tt-room__verse');
        o.r.items.slice(0, 3).forEach(function (it) {
          defs.appendChild(el('p', 'tt-room__prose', o.sn + it.name + '：'
            + it.parts.map(function (p) { return p.ch + '——' + p.def }).join('，')));
        });
        box.appendChild(defs);
        ['喜用神取「五行最弱则补之」，为民间补缺法；子平扶抑、调候等流派结论可能不同，仅供参考',
          '候选名按五格吉凶（人·地权重最高）、三才配置、生肖宜忌与音韵（声母不撞、声调起伏）综合排序，取前十'
        ].forEach(function (n) { box.appendChild(el('p', 'tt-room__meta', '· ' + n)) });
        if (o.relaxed) box.appendChild(el('p', 'tt-room__meta', '· 喜用五行内无可用字，已放开喜用限制重拟'));
        box.appendChild(el('p', 'tt-room__foot',
          '字库为康熙笔画与通用规范汉字表（与现网起名页同包分发）。这一门只拟名：测名、避讳与出生地真太阳时校正暂未接进新皮。'));
      }
    },
    crossref: {
      title: '八字 × 紫微', hint: '一张生时贴 · 两套体系并列', go: '合参',
      fields: function (t) {
        return [
          { k: 'year', head: '生时贴', label: '年', type: 'number', v: t[0] - 26, min: 1900, max: 2100 },
          { k: 'month', label: '月', type: 'number', v: 6, min: 1, max: 12 },
          { k: 'day', label: '日', type: 'number', v: 15, min: 1, max: 31 },
          { k: 'hour', label: '时辰', opts: ZHI.split('').map(function (z, i) { return { v: i, t: z + '时（' + SHI[i] + '）' } }) },
          { k: 'gender', label: '性别', opts: [{ v: 'male', t: '男' }, { v: 'female', t: '女' }] }
        ];
      },
      read: function (g) {
        var y = +g('year'), m = +g('month'), d = +g('day'), h = +g('hour'), gd = g('gender');
        if (!valid(y, m, d) || h < 0 || h > 11) return { err: '年月日时先填全（1900-2100）' };
        var b = bazi({ year: y, month: m, day: d, hour: h });
        var z = ziweiChart({ year: y, month: m, day: d, hour: h, gender: gd });
        if (!z || !z.palaces || z.palaces.length !== 12) return { err: '这一时刻紫微排不出来，换一个时辰试试' };
        return { ok: { b: b, z: z, sh: shensha(b), p: ziweiPatterns(z), t: ziweiNature(z), gender: gd } };
      },
      draw: function (box, o) {
        var ming = o.z.palaces.filter(function (p) { return p.name === '命宫' })[0] || { stars: [] };
        var majors = ming.stars.filter(function (s) { return s.type === 'major' });
        var head = el('div', 'tt-room__when');
        head.appendChild(el('span', 'tt-room__big', o.b.dayMaster + o.b.dayMasterWuxing));
        head.appendChild(el('span', 'tt-room__sub', '日主 · 紫微' + o.z.wuxingJuName + ' · 命宫'
          + (majors.length ? majors.map(function (s) { return s.name }).join('、') : '空宫')
          + ' · ' + (o.gender === 'female' ? '女' : '男')));
        box.appendChild(head);
        box.appendChild(el('p', 'tt-room__gk', '八字四柱'));
        drawPillars(box, o.b, null);
        drawWuxing(box, o.b.wuxingCount);
        var sh = el('p', 'tt-room__row2');
        sh.appendChild(el('span', 'tt-room__gk', '神煞' + qianText(o.sh.length) + '位'));
        o.sh.forEach(function (x) {
          var chip = el('span', 'tt-room__chip');
          chip.appendChild(el('b', null, x.name));
          chip.appendChild(el('i', null, x.type + ' · ' + x.position));
          sh.appendChild(chip);
        });
        box.appendChild(sh);
        box.appendChild(el('p', 'tt-room__gk', '紫微十二宫'));
        var list = el('div', 'tt-room__rels');
        palaces(o.z).forEach(function (p) {
          var ms = p.stars.filter(function (s) { return s.type === 'major' });
          var row = el('div', 'tt-room__rel');
          row.appendChild(el('span', 'tt-room__rk', p.name));
          row.appendChild(el('span', 'tt-room__rv', ms.length
            ? ms.map(function (s) { return s.name + '（' + BRIGHT[s.brightness] + (s.siHua ? '·化' + s.siHua : '') + '）' }).join(' ')
            : '空宫 · 借对宫' + ((p.borrowedStars || []).join('、') || '亦无主星')));
          row.appendChild(el('span', 'tt-room__rs', GAN.charAt(p.stem) + ZHI.charAt(p.branch)));
          list.appendChild(row);
        });
        box.appendChild(list);
        var pt = el('p', 'tt-room__row2');
        pt.appendChild(el('span', 'tt-room__gk', '紫微格局' + qianText(o.p.length) + '条'));
        o.p.forEach(function (f) { pt.appendChild(el('span', 'tt-room__chip', f.name + '·' + (LEVEL[f.level] || f.level))) });
        box.appendChild(pt);
        box.appendChild(el('p', 'tt-room__foot',
          '两套盘同出一张生时贴：八字用现网 calculator（年柱按立春）+ 神煞表，紫微用现网 iztro + patterns。'
            + '交叉对账就在本页下方「问一问」里问 —— 双盘数据会自动带进提示词。'));
      }
    },
    tianji: {
      title: '总论', hint: '一张生时贴 · 两盘合参的总览', go: '总览',
      fields: function (t) {
        return [
          { k: 'year', head: '生时贴', label: '年', type: 'number', v: t[0] - 26, min: 1900, max: 2100 },
          { k: 'month', label: '月', type: 'number', v: 6, min: 1, max: 12 },
          { k: 'day', label: '日', type: 'number', v: 15, min: 1, max: 31 },
          { k: 'hour', label: '时辰', opts: ZHI.split('').map(function (z, i) { return { v: i, t: z + '时（' + SHI[i] + '）' } }) },
          { k: 'gender', label: '性别', opts: [{ v: 'male', t: '男' }, { v: 'female', t: '女' }] }
        ];
      },
      read: function (g) {
        var y = +g('year'), m = +g('month'), d = +g('day'), h = +g('hour'), gd = g('gender');
        if (!valid(y, m, d) || h < 0 || h > 11) return { err: '年月日时先填全（1900-2100）' };
        var b = bazi({ year: y, month: m, day: d, hour: h });
        var z = ziweiChart({ year: y, month: m, day: d, hour: h, gender: gd });
        if (!z || !z.palaces || z.palaces.length !== 12) return { err: '这一时刻紫微排不出来，换一个时辰试试' };
        var l = S.fromYmd(y, m, d).getLunar();
        /* 与现网 pickXiYong 同一句「最弱则补之」，这里就地算，不为这一门再拉 311KB 的字库包 */
        var weak = '', min = 99;
        WX.forEach(function (w) { var v = b.wuxingCount[w] || 0; if (v < min) { min = v; weak = w } });
        var ming = z.palaces.filter(function (p) { return p.name === '命宫' })[0] || { stars: [] };
        return {
          ok: {
            b: b, z: z, sh: shensha(b), p: ziweiPatterns(z), weak: weak, min: min,
            ming: ming.stars.filter(function (s) { return s.type === 'major' }).map(function (s) { return s.name }),
            when: y + '年' + m + '月' + d + '日' + ZHI.charAt(h) + '时 · 农历' + l.getMonthInChinese() + '月' + l.getDayInChinese(),
            zoo: ZOO[ZHI.indexOf(l.getYearZhi())], gender: gd
          }
        };
      },
      draw: function (box, o) {
        var head = el('div', 'tt-room__when');
        head.appendChild(el('span', 'tt-room__big', o.b.dayMaster + o.b.dayMasterWuxing));
        head.appendChild(el('span', 'tt-room__sub', o.when + ' · 属' + o.zoo + ' · ' + (o.gender === 'female' ? '女' : '男')));
        box.appendChild(head);
        var dx = o.z.daXians[o.z.currentDaXianIndex];
        var rows = [
          ['四柱', [o.b.yearPillar, o.b.monthPillar, o.b.dayPillar, o.b.hourPillar].map(function (p) { return p.stem + p.branch }).join(' '), '八字'],
          ['五行', WX.map(function (w) { return w + (o.b.wuxingCount[w] || 0) }).join(' ') + ' · 最弱' + o.weak, '八字'],
          ['神煞', qianText(o.sh.length) + '位 · ' + o.sh.slice(0, 4).map(function (x) { return x.name }).join(' ')
            + (o.sh.length > 4 ? ' …' : ''), '八字'],
          ['命宫', (o.ming.length ? o.ming.join('、') : '空宫') + ' · ' + o.z.wuxingJuName, '紫微'],
          ['格局', qianText(o.p.length) + '条 · ' + o.p.slice(0, 3).map(function (f) { return f.name }).join(' ')
            + (o.p.length > 3 ? ' …' : ''), '紫微'],
          ['行限', dx ? dx.palaceName + ' ' + dx.startAge + '–' + dx.endAge + ' 岁（虚岁' + o.z.currentAge + '）' : '大限未起', '紫微']
        ];
        var list = el('div', 'tt-room__rels');
        rows.forEach(function (r) {
          var row = el('div', 'tt-room__rel');
          row.appendChild(el('span', 'tt-room__rk', r[0]));
          row.appendChild(el('span', 'tt-room__rv', r[1]));
          row.appendChild(el('span', 'tt-room__rs', r[2]));
          list.appendChild(row);
        });
        box.appendChild(list);
        box.appendChild(el('p', 'tt-room__gk', '这一阁十道门'));
        var idx = el('div', 'tt-room__hits');
        (window.TT_MODS || []).forEach(function (m) {
          if (m.key === 'tianji' || m.sky) return;
          var a = el('a', 'tt-room__hit', m.slot + ' · ' + m.name);
          a.href = '?mod=' + m.key;
          idx.appendChild(a);
        });
        box.appendChild(idx);
        box.appendChild(el('p', 'tt-room__foot',
          '总览只摆两套盘互相能对上的部分；断语与交叉对账要问 AI，请用天机阁首页上的各术页面。'));
        var a = el('a', 'tt-room__go', '回阁楼挑一门能问的');
        a.href = HOME;
        box.appendChild(a);
      }
    }
  };

  /* ── 入卷（写进现网那份 IndexedDB：fortune-charts）──────────
     只对「填的是一张生时贴」的门开这一颗。每日/择日填的是要查的那一天，六爻/塔罗没有生日，
     合婚是两张帖而现网那份记录只有一个 birth 字段 —— 不自创第三种形状。 */
  var SAVE_KEYS = { bazi: 1, bone: 1, ziwei: 1, naming: 1, crossref: 1, tianji: 1 };
  function saveRow(key, g, ok) {
    if (!SAVE_KEYS[key]) return null;
    var y = +g('year'), m = +g('month'), d = +g('day'), h = +g('hour');
    if (!valid(y, m, d)) return null;
    var birth = { year: y, month: m, day: d, hour: h };
    if (g('gender')) birth.gender = g('gender');
    var rec = { type: key, birth: birth, resultJson: JSON.stringify(ok) };
    /* 现网 HistoryPage 会读 patterns 那三个 chips，字段名与形状都跟着它 */
    if (ok.p && ok.p.length) rec.patterns = ok.p.map(function (f) { return f.name });
    var acts = el('div', 'tt-room__acts');
    var btn = el('button', 'tt-room__save', '入卷');
    btn.type = 'button';
    var said = el('span', 'tt-room__saved');
    btn.addEventListener('click', function () {
      btn.disabled = true;
      said.textContent = '正放进柜里…';
      history.save(rec).then(function () {
        said.textContent = '已入卷';
        /* 门页的标头不钉住：滑到这里就够不着「记录」，所以回执自己给一个开柜的口 */
        var go = el('button', 'tt-room__open', '开柜看');
        go.type = 'button';
        go.addEventListener('click', function () { if (window.ttHouseOpen) window.ttHouseOpen('log') });
        acts.appendChild(go);
        if (window.ttHouseDirty) window.ttHouseDirty();
      }).catch(function (e) {
        btn.disabled = false;
        said.textContent = '没放进去 · ' + (e && e.message ? e.message : '这台设备不许网页存东西');
      });
    });
    acts.appendChild(btn);
    acts.appendChild(said);
    return acts;
  }

  /* ── 问一问（照现网 useAI hook 那四条规矩：每轮带上历史、发新一轮先 abort 上一轮、
        没 Key 不请求、AbortError 不算错只留半句）。提示词与 buildUserMessage 都取自 prompts.js
        （逐字切自现网各页 chunk），只有现网本来就配了 AI 的七门有这一节。 */
  function askRow(key, raw) {
    var sc = ASK[key];
    if (!sc) return null;
    var msgs = [], ctrl = null, live = null;
    var wrap = el('div', 'tt-room__ask');
    wrap.appendChild(el('p', 'tt-room__gk', '问一问'));
    var thread = el('div', 'tt-room__thread');
    var inp = el('input', 'tt-room__input');
    inp.type = 'text'; inp.id = 'f-ask'; inp.autocomplete = 'off';
    inp.placeholder = '想问什么 · 例如：今年事业运如何';
    var send = el('button', 'tt-room__mini tt-room__mini--go', '发问');
    var stop = el('button', 'tt-room__mini', '停下来');
    var clr = el('button', 'tt-room__mini', '清空');
    var set = el('button', 'tt-room__mini', '去设置');
    [stop, clr, set].forEach(function (b) { b.hidden = true });
    [send, stop, clr, set].forEach(function (b) { b.type = 'button' });
    var wait = el('p', 'tt-room__wait', '正在写…');
    wait.hidden = true;
    var err = el('p', 'tt-room__err');
    err.setAttribute('aria-live', 'polite');
    var row = el('div', 'tt-room__askrow');
    [inp, send, stop, clr, set].forEach(function (n) { row.appendChild(n) });
    wrap.appendChild(thread); wrap.appendChild(row); wrap.appendChild(wait); wrap.appendChild(err);

    function render() {
      thread.textContent = '';
      msgs.forEach(function (m) {
        var p = el('p', 'tt-room__msg' + (m.role === 'user' ? ' tt-room__msg--me' : ''));
        p.appendChild(el('span', 'tt-room__gk', m.role === 'user' ? '问' : '答'));
        p.appendChild(document.createTextNode(m.role === 'user' ? (m.display || m.content) : m.content));
        thread.appendChild(p);
      });
      clr.hidden = !msgs.length;
      live = thread.lastChild ? thread.lastChild.lastChild : null;
    }
    function busy(on) {
      send.disabled = on; stop.hidden = !on; wait.hidden = !on;
    }
    function go() {
      var q = (inp.value || '').trim();
      if (!q) { err.textContent = '先写一句要问的话。'; return }
      if (!hasKey()) {
        err.textContent = '请先在设置中配置 API Key';
        set.hidden = false; inp.focus();
        return;
      }
      err.textContent = ''; set.hidden = true;
      if (ctrl) ctrl.abort();
      ctrl = new AbortController();
      var mine = ctrl;
      var ai = { role: 'assistant', content: '' };
      msgs.push({ role: 'user', content: sc.user(raw, q), display: q });
      msgs.push(ai);
      render(); busy(true); inp.value = ''; inp.focus();
      var wire = [{ role: 'system', content: sc.system }].concat(
        msgs.slice(0, -1).map(function (m) { return { role: m.role, content: m.content } }));
      ask(wire, function (d) {
        if (mine !== ctrl) return;
        ai.content += d;
        /* 只改那一个文本节点：整段重画会让选字与滚动一起抖 */
        if (live && live.parentNode) live.textContent = ai.content;
        else render();
      }, mine.signal).then(function () {
        if (mine !== ctrl) return;
        ctrl = null; busy(false);
        if (!ai.content) { msgs.pop(); render(); err.textContent = '没收到内容 · 换个模型或再问一次' }
      }).catch(function (e) {
        if (mine !== ctrl) return;
        ctrl = null; busy(false);
        /* 停下来不算错：留下已经收到的半句（现网同一条处理） */
        if (e && e.name === 'AbortError') return;
        if (!ai.content) { msgs.pop(); render() }
        err.textContent = (e && e.message) ? e.message : 'AI 调用失败';
      });
    }
    send.addEventListener('click', go);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go() } });
    stop.addEventListener('click', function () { if (ctrl) ctrl.abort() });
    clr.addEventListener('click', function () {
      if (ctrl) ctrl.abort();
      msgs = []; err.textContent = ''; render();
    });
    set.addEventListener('click', function () { if (window.ttHouseOpen) window.ttHouseOpen('ai') });
    return wrap;
  }

  /* ── 门前石案（an）：先填帖，再推门 ───────────────────────
     用户定的顺序 —— 表单在门外、压在台基上，「推门而入」就是提交那颗钮；点门扇等同于按它
     （art.js 里那道口叫 window.ttDoorGate，返回假值就不开）。
     结果仍旧交给 #room：门开 → 书飞出 → 盘摆在眼前。 */
  var an = document.getElementById('an');

  function buildAn(key, sc) {
    var t = today();
    var wrap = el('div', 'tt-room__card');
    var head = el('div', 'tt-room__head');
    head.appendChild(el('p', 'tt-room__title', sc.title));
    head.appendChild(el('p', 'tt-room__hint', sc.hint));
    wrap.appendChild(head);
    var form = el('form', 'tt-room__form');
    form.setAttribute('novalidate', '');
    var fs = sc.fields(t);
    fs.forEach(function (f) {
      /* 合婚这种一人一段的，用整行小标题分组，别把「年」写两遍分不清是谁的 */
      if (f.head) form.appendChild(el('p', 'tt-room__fhead', f.head));
      var lab = el('label', 'tt-room__field');
      lab.appendChild(el('span', 'tt-room__k', f.label));
      var inp;
      if (f.opts) {
        inp = el('select', 'tt-room__input');
        f.opts.forEach(function (o) {
          var op = el('option', null, o.t == null ? o.v : o.t);
          op.value = o.v == null ? o : o.v;
          inp.appendChild(op);
        });
      } else {
        inp = el('input', 'tt-room__input');
        inp.type = f.type; inp.value = f.v;
        if (f.min != null) inp.min = f.min;
        if (f.max != null) inp.max = f.max;
        inp.setAttribute('inputmode', f.type === 'number' ? 'numeric' : 'text');
      }
      inp.name = inp.id = 'f-' + f.k;
      lab.appendChild(inp);
      form.appendChild(lab);
    });
    var go = el('button', 'tt-room__go', '推门而入');
    go.type = 'submit';
    form.appendChild(go);
    var err = el('p', 'tt-room__err');
    err.setAttribute('aria-live', 'polite');
    form.appendChild(err);
    wrap.appendChild(form);

    function g(n) { var x = document.getElementById('f-' + n); return x ? x.value : '' }
    /* 验帖 + 起盘。返回 true 才许推门；错就落在案上，门不动 */
    function push() {
      /* 首开才要等那一拍：册子 460ms 起飞、1440ms 落定、封面 1400→2020ms 翻开。
         门已经开着再改数重推，没有这一拍可看，260ms 就走。
         reduce 下这一拍根本不演（书直接是开着的），那就没必要让人干等两秒。 */
      flyWait = (art.dataset.open === '1' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches))
        ? 260 : 2020;
      var r = sc.read(g);
      err.textContent = r.err || '';
      if (r.err) {
        an.dataset.nudge = '1';
        setTimeout(function () { an.removeAttribute('data-nudge') }, 640);
        var f0 = form.querySelector('.tt-room__input'); if (f0) f0.focus();
        return false;
      }
      room.textContent = '';
      var out = el('div', 'tt-room__chart');
      room.appendChild(out);
      sc.draw(out, r.ok, g('gender'));
      var sv = saveRow(key, g, r.ok);
      if (sv) out.appendChild(sv);
      /* 现网每次排盘都 clearMessages：换了一张盘就是换了一次上下文，所以问一问跟着盘一起重建 */
      var ak = askRow(key, r.ok);
      if (ak) out.appendChild(ak);
      room.hidden = false;
      room.dataset.mod = key;
      window.__roomChart = { mod: key, raw: r.ok };
      /* 书开，并把卷端与「此盘所据」填上：飞出来的那一册没有字（它只有三秒），
         字落在这本翻开的书上。 */
      if (book) book.dataset.on = '1';
      if (bookH) bookH.textContent = '卷一 · ' + sc.title;
      if (bookSub) bookSub.textContent = fs.map(function (f) {
        var v = g(f.k), o = f.opts && f.opts.filter(function (x) { return String(x.v == null ? x : x.v) === String(v) })[0];
        return f.label + ' ' + (o ? (o.t == null ? o.v : o.t) : v);
      }).join(' · ');
      /* 案不折：门推开之后帖子还摊在案上，改一个数再按一次「推门而入」就是再起一盘。
         折行会让案变矮、取景窗的第一行跟着长大，门会在推开的瞬间跳一下尺寸。 */
      an.dataset.state = 'done';
      return true;
    }
    /* 滚到书而不是滚到盘：整副跨页（左盘右符）才是一屏的事，滚到盘那里符在屏外。
       延时由 push() 按「这一拍有没有得看」定：首开等册子飞完并翻开，重推不等。 */
    var flyWait = 260;
    function reveal() {
      var t = book || room;
      setTimeout(function () { t.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, flyWait);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!push()) return;
      art.dataset.open = '1';
      reveal();
    });
    /* 点门扇 = 按「推门而入」：帖子没过就不开 */
    window.ttDoorGate = function () {
      if (an.dataset.state === 'done') return true;
      if (!push()) return false;
      reveal();
      return true;
    };
    return wrap;
  }

  function fallback(key, name) {
    var wrap = el('div', 'tt-room__card');
    var head = el('div', 'tt-room__head');
    head.appendChild(el('p', 'tt-room__title', name));
    head.appendChild(el('p', 'tt-room__hint', '这一门还没接进新皮'));
    wrap.appendChild(head);
    wrap.appendChild(el('p', 'tt-room__none', '这一门还没接进新皮 —— 回阁楼挑一门已经能用的。'));
    var a = el('a', 'tt-room__go', '回阁楼');
    a.href = HOME;
    wrap.appendChild(a);
    return wrap;
  }

  var mod = (window.ttMod ? window.ttMod(art.dataset.mod) : null) || { key: 'bazi', name: '八字' };
  if (mod.key === 'naming') {
    try { NAM = await import('./engines/NamingPage-fArufmUn.js') }
    catch (e) { /* 字库没到位也不空着一张卡：下面 naming.read 会给出「稍后再按」的提示 */ }
  }
  var sc = SCHEMA[mod.key];
  room.dataset.mod = mod.key;
  room.textContent = ''; room.hidden = true;
  /* ── 门内那一页书：左页是这一门的盘，右页是这一门的符 ─────────
     书在盘没起之前整块收着（data-on='0' → display:none），所以「推门 → 书飞出来 → 翻开」
     这一串只在起盘那一刻演一次。符从挂载就在，不等盘。 */
  var book = document.getElementById('book'), leafR = document.getElementById('leafR'),
    fu = document.getElementById('fu'), fuFig = document.getElementById('fuFig'),
    fuSay = document.getElementById('fuSay'), bookH = document.getElementById('bookH'),
    bookSub = document.getElementById('bookSub');
  if (fu && fuFig && window.ttFuSvg) {
    /* 一模块一符：骨架与两个槽（符胆二字 / 主象）都在 fu.js 的 ttFuSvg() 里，这一页只挂上去。
       图走 aria-hidden，可访问名挂在按钮上 —— 读屏不该把符面那两个字当正文念两遍。 */
    fuFig.innerHTML = window.ttFuSvg(mod.key, null);
    fu.hidden = false;
    fu.setAttribute('aria-label', (window.ttFuMeta ? window.ttFuMeta(mod.key).name : mod.name)
      + '符 · 点一下求一句符语');
    var fuCtrl = null;
    fu.addEventListener('click', function () {
      var a = ASK[mod.key];
      /* 先落这一笔：有没有 AI 都得不点不动 —— 符应了一声，话在后头。 */
      fu.dataset.tap = '1';
      setTimeout(function () { fu.removeAttribute('data-tap') }, 1400);
      leafR.dataset.said = '1';
      var drop = document.getElementById('fu-set');
      if (!a) { fuSay.textContent = '这一门在现网就没有配 AI，符只落一笔，不替你编一句。'; return }
      var raw = (window.__roomChart && window.__roomChart.mod === mod.key) ? window.__roomChart.raw : null;
      if (!raw) { fuSay.textContent = '先在案上推门：盘没起，符没得解。'; return }
      if (!hasKey()) {
        fuSay.textContent = '此符无笔 —— 在「设置」里配一把 API Key，符语才落得下来。';
        if (!drop) {
          var act = el('p', 'tt-fu-act'), b = el('button', 'tt-room__mini tt-room__mini--go', '去设置');
          b.type = 'button'; b.id = 'fu-set';
          b.addEventListener('click', function () { if (window.ttHouseOpen) window.ttHouseOpen('ai') });
          act.appendChild(b);
          fuSay.after(act);
        }
        return;
      }
      if (drop && drop.parentNode) drop.parentNode.remove();
      if (fuCtrl) fuCtrl.abort();
      fuCtrl = new AbortController();
      var mine = fuCtrl, got = false;
      fuSay.textContent = '符正在落笔…';
      fuSay.dataset.wait = '1';
      /* 系统那一份是现网这一页原封不动的提示词（prompts.js 逐字切的），
         问题这一句是新前端自己的话术 —— 不假称现网有「符语」这个功能。 */
      ask([{ role: 'system', content: a.system },
        { role: 'user', content: a.user(raw, '请只给一句符语：不超过二十字，要落在这张盘上，不要解释、不要分点。') }],
        function (d) {
          if (mine !== fuCtrl) return;
          if (!got) { got = true; delete fuSay.dataset.wait; fuSay.textContent = '' }
          fuSay.textContent += d;
        }, fuCtrl.signal).then(function (t) {
          if (mine !== fuCtrl) return;
          delete fuSay.dataset.wait;
          if (!t) fuSay.textContent = '这一笔没落下来：模型空着回去了。';
        }, function (e) {
          if (mine !== fuCtrl) return;
          delete fuSay.dataset.wait;
          if (e && e.name === 'AbortError') return;
          fuSay.textContent = (e && e.message) || '符语没落下来。';
        });
    });
  }
  /* 帖子摆在门外：这一案就是这道门的入口，不是推开门之后的第二步 */
  an.dataset.mod = mod.key;
  an.dataset.state = 'edit';
  an.textContent = '';
  an.appendChild(sc ? buildAn(mod.key, sc) : fallback(mod.key, mod.name));
  /* 案下那一行是本门的指引位：静态 HTML 里先写着通用的一句（图读不出来时它是唯一的话筒，
     art.js 的 fail() 会覆盖这里），接上 schema 之后换成本门自己的说法。
     案上的题款只留名目——同一句话在案上案下各说一遍是啰嗦。 */
  var hint = document.querySelector('.tt-art__hint');
  if (hint && sc && sc.hint) hint.textContent = sc.hint;
})();
