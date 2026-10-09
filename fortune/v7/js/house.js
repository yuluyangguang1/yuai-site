/* 天机阁 V7 · 阁务抽屉（house）
   标头右侧两枚钮（设置 / 记录）与那一只贴右沿的屉身都由这里生成，
   HTML 里只多一个 <script type="module" src="house.js"> —— 阁楼页与门页共用同一份，不各写一遍。
   字段与动作照抄现网 SettingsPage / HistoryPage 那一套（换一家＝覆写 baseUrl/model/format 三项、
   模型 chips、API Key、API 地址、模型名称、测试连接；案卷＝列表/删除/导出/清空），
   只是搬进本阁的形制，不新增现网没有的能力。
   读写全走 store.js —— 那份 import 的是现网 chunk 的逐字节副本：换皮之后用户已有的 Key 与案卷照旧能用。 */
import { PROVIDERS, GROUP_ORDER, aiState, setAI, pick, hasKey, matched, ask, history } from './store.js';

(function () {
  var mast = document.querySelector('.tt-mast');
  if (!mast) return;

  var ZHI = '子丑寅卯辰巳午未申酉戌亥';
  var NS = 'http://www.w3.org/2000/svg';
  var open = false, tab = 'ai', clearing = 0, busy = false, ctrl = null, timer = 0;

  function el(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n }
  /* 图标一律线描 + currentColor：粗细与色都不写在 JS 里，交给 house.css 的 .tt-house__ico */
  function ico(src) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', 'tt-house__ico');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('aria-hidden', 'true');
    src.split('|').forEach(function (p) {
      var head = p.charAt(0), body = p.slice(1).split(','), n;
      n = document.createElementNS(NS, head === 'r' ? 'rect' : head === 'c' ? 'circle' : 'path');
      if (head === 'r') {
        n.setAttribute('x', body[0]); n.setAttribute('y', body[1]);
        n.setAttribute('width', body[2]); n.setAttribute('height', body[3]);
      } else if (head === 'c') {
        n.setAttribute('cx', body[0]); n.setAttribute('cy', body[1]); n.setAttribute('r', body[2]);
      } else n.setAttribute('d', p.slice(1));
      s.appendChild(n);
    });
    return s;
  }
  /* 钥＝把模型接进来；册＝四片竹简两道编绳；× 是关闭 */
  var ICO = {
    key: 'c8,11,3.4|M11.4 11L20 11|M16.4 11L16.4 14.4|M19.2 11L19.2 13.4',
    book: 'M6 4L6 20|M10 4L10 20|M14 4L14 20|M18 4L18 20|M3.5 8L20.5 8|M3.5 16L20.5 16',
    x: 'M6 6L18 18|M18 6L6 18'
  };

  /* ── 标头那两枚 ───────────────────────────────────────── */
  var theme = mast.querySelector('.tt-theme');
  var tools = el('div', 'tt-mast__tools');
  if (theme) { mast.insertBefore(tools, theme); tools.appendChild(theme) } else mast.appendChild(tools);

  function keyBtn(kind, icon, text) {
    var b = el('button', 'tt-house__key');
    b.type = 'button';
    b.dataset.house = kind;
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', 'house-sheet');
    b.appendChild(ico(icon));
    b.appendChild(el('span', null, text));
    tools.appendChild(b);
    return b;
  }
  var btnAi = keyBtn('ai', ICO.key, '设置');
  var btnLog = keyBtn('log', ICO.book, '记录');

  /* ── 屉身 ─────────────────────────────────────────────── */
  var scrim = el('div', 'tt-house__scrim');
  scrim.hidden = true;
  var sheet = el('aside', 'tt-house__sheet');
  sheet.hidden = true;
  sheet.id = 'house-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-labelledby', 'house-title');
  sheet.tabIndex = -1;

  var head = el('div', 'tt-house__head');
  head.appendChild(el('p', 'tt-house__kick', '欽天監 · 阁务'));
  var title = el('h2', 'tt-house__title');
  title.id = 'house-title';
  head.appendChild(title);
  var close = el('button', 'tt-house__close');
  close.type = 'button';
  close.setAttribute('aria-label', '关闭');
  close.appendChild(ico(ICO.x));
  head.appendChild(close);

  var tabs = el('div', 'tt-house__tabs');
  tabs.setAttribute('role', 'tablist');
  var tAi = el('button', 'tt-house__tab', 'AI 接入');
  var tLog = el('button', 'tt-house__tab', '命盘记录');
  tAi.dataset.house = 'ai'; tLog.dataset.house = 'log';
  [tAi, tLog].forEach(function (b) { b.type = 'button'; b.setAttribute('role', 'tab'); tabs.appendChild(b) });

  var body = el('div', 'tt-house__body');
  var foot = el('p', 'tt-house__foot');
  [head, tabs, body, foot].forEach(function (n) { sheet.appendChild(n) });
  document.body.appendChild(scrim);
  document.body.appendChild(sheet);

  /* ── 开关 ─────────────────────────────────────────────── */
  var lastFocus = null, keepOverflow = '';
  function mark() {
    tAi.className = 'tt-house__tab' + (tab === 'ai' ? ' tt-house__tab--on' : '');
    tLog.className = 'tt-house__tab' + (tab === 'log' ? ' tt-house__tab--on' : '');
    tAi.setAttribute('aria-selected', String(tab === 'ai'));
    tLog.setAttribute('aria-selected', String(tab === 'log'));
    btnAi.className = 'tt-house__key' + (tab === 'ai' ? ' tt-house__key--on' : '');
    btnLog.className = 'tt-house__key' + (tab === 'log' ? ' tt-house__key--on' : '');
    btnAi.setAttribute('aria-expanded', String(open));
    btnLog.setAttribute('aria-expanded', String(open));
    title.textContent = tab === 'ai' ? '设置' : '案卷';
  }
  function show(kind) {
    lastFocus = document.activeElement;
    tab = kind; open = true; clearing = 0;
    scrim.hidden = false; sheet.hidden = false;
    keepOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    mark();
    if (kind === 'ai') renderAI(); else renderLog();
    /* 屉里换的是整块内容，滚动位置得跟着归零，不然第二次打开停在上一卷的下半截 */
    body.scrollTop = 0;
    sheet.focus();
  }
  function hide() {
    if (!open) return;
    open = false; busy = false;
    if (ctrl) { ctrl.abort(); ctrl = null }
    scrim.hidden = true; sheet.hidden = true;
    document.documentElement.style.overflow = keepOverflow;
    mark();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  btnAi.addEventListener('click', function () { open && tab === 'ai' ? hide() : show('ai') });
  btnLog.addEventListener('click', function () { open && tab === 'log' ? hide() : show('log') });
  close.addEventListener('click', hide);
  scrim.addEventListener('click', hide);
  tAi.addEventListener('click', function () { show('ai') });
  tLog.addEventListener('click', function () { show('log') });
  document.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') { hide(); return }
    /* 既然说好了 aria-modal，Tab 就不能真跑到底下那座塔上 */
    if (e.key !== 'Tab') return;
    var f = sheet.querySelectorAll('button, input, select, textarea, a[href]');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === sheet)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  /* ── 小构件 ───────────────────────────────────────────── */
  function row(label, ctrl) {
    var r = el('div', 'tt-house__row');
    var k = el('label', 'tt-house__k', label);
    k.htmlFor = ctrl.id;
    r.appendChild(k); r.appendChild(ctrl);
    return r;
  }
  function section(legend, nodes) {
    var s = el('div', 'tt-house__sec');
    s.appendChild(el('p', 'tt-house__legend', legend));
    nodes.forEach(function (n) { if (n) s.appendChild(n) });
    return s;
  }

  /* ── AI 接入 ──────────────────────────────────────────── */
  function renderAI() {
    var ai = aiState();
    foot.textContent = '这一阁没有服务端：模型由浏览器直连，Key 与案卷都只存在这台设备上。';

    var sel = el('select', 'tt-house__inp');
    sel.id = 'h-provider';
    var none = el('option', null, '自定义地址');
    none.value = ''; none.disabled = true;
    sel.appendChild(none);
    GROUP_ORDER.forEach(function (g) {
      var og = document.createElement('optgroup');
      og.label = g.label;
      g.items.forEach(function (k) {
        var op = el('option', null, PROVIDERS[k].labelCn);
        op.value = k; og.appendChild(op);
      });
      sel.appendChild(og);
    });
    var m0 = matched();
    sel.value = m0 ? m0[0] : '';
    sel.addEventListener('change', function () {
      /* 换一家只覆写那三项（现网也是这三项）—— Key 是用户自己的，不清 */
      if (sel.value) { pick(sel.value); renderAI() }
    });

    var chips = null;
    if (m0 && m0[1].models.length) {
      chips = el('div', 'tt-house__chips');
      m0[1].models.forEach(function (mo) {
        var b = el('button', 'tt-house__chip' + (ai.model === mo ? ' tt-house__chip--on' : ''), mo);
        b.type = 'button';
        b.addEventListener('click', function () { setAI({ model: mo }); renderAI() });
        chips.appendChild(b);
      });
    }

    var keyIn = el('input', 'tt-house__inp tt-house__inp--key');
    keyIn.id = 'h-key'; keyIn.type = 'password'; keyIn.autocomplete = 'off'; keyIn.spellcheck = false;
    keyIn.value = ai.apiKey || '';
    keyIn.placeholder = (m0 && m0[1].keyPlaceholder) || 'sk-...';
    keyIn.addEventListener('input', function () { setAI({ apiKey: keyIn.value.trim() }); sync() });

    var urlIn = el('input', 'tt-house__inp');
    urlIn.id = 'h-url'; urlIn.type = 'text'; urlIn.autocomplete = 'off'; urlIn.spellcheck = false;
    urlIn.value = ai.baseUrl || '';
    urlIn.placeholder = 'https://…/v1';
    urlIn.addEventListener('input', function () { setAI({ baseUrl: urlIn.value.trim() }); sync() });

    var modelIn = el('input', 'tt-house__inp');
    modelIn.id = 'h-model'; modelIn.type = 'text'; modelIn.autocomplete = 'off'; modelIn.spellcheck = false;
    modelIn.value = ai.model || '';
    modelIn.placeholder = 'deepseek-chat';
    modelIn.addEventListener('input', function () { setAI({ model: modelIn.value.trim() }); sync() });

    var getKey = null;
    if (m0 && m0[1].keyUrl) {
      getKey = el('a', 'tt-house__link', '获取 ' + m0[1].labelCn + ' 的 Key');
      getKey.href = m0[1].keyUrl;
      getKey.target = '_blank';
      getKey.rel = 'noopener';
    }

    var line = el('p', 'tt-house__stat');
    line.id = 'h-stat';
    var dot = el('span', 'tt-house__dot');
    var lineText = el('span');
    line.appendChild(dot); line.appendChild(lineText);
    function sync() {
      var mm = matched();
      line.className = 'tt-house__stat ' + (hasKey() ? 'tt-house__stat--on' : 'tt-house__stat--off');
      lineText.textContent = hasKey()
        ? '已接入 · ' + (mm ? mm[1].labelCn : '自定义地址') + ' · ' + (aiState().model || '未填模型名')
        : '未填 API Key · AI 解读发不出去，盘面照旧能算';
    }
    sync();

    var out = el('p', 'tt-house__note');
    out.id = 'h-out';
    out.setAttribute('aria-live', 'polite');
    var test = el('button', 'tt-house__btn tt-house__btn--go', '测试连接');
    test.type = 'button';
    test.addEventListener('click', function () {
      if (busy) { if (ctrl) ctrl.abort(); return }
      if (!hasKey()) { out.textContent = '先把 API Key 填上。'; return }
      busy = true; test.textContent = '正在断开';
      out.textContent = '…';
      /* 与现网那颗同一条请求：发一句「请回复连接成功」，收到 50 字就停 */
      ctrl = new AbortController();
      var mine = ctrl, got = '';
      ask([{ role: 'user', content: '你好，请回复"连接成功"' }], function (d) {
        got += d;
        if (!open || mine !== ctrl) return;
        out.textContent = got;
        if (got.length > 50) ctrl.abort();
      }, mine.signal).then(function () {
        if (!open || mine !== ctrl) return;
        out.textContent = '已接通 · ' + (got || '（无内容返回）');
      }).catch(function (e) {
        if (!open || mine !== ctrl) return;
        out.textContent = '没接通 · ' + (e && e.message ? e.message : String(e));
      }).finally(function () {
        if (mine === ctrl) { busy = false; ctrl = null; test.textContent = '测试连接' }
      });
    });
    var acts = el('div', 'tt-house__acts');
    acts.appendChild(test);

    body.textContent = '';
    body.appendChild(section('接入', [
      el('p', 'tt-house__note', 'API Key 仅存储在您的浏览器中，不会上传到任何服务器。'),
      row('模型来源', sel), chips,
      row('API Key', keyIn), getKey,
      row('API 地址', urlIn), row('模型名称', modelIn),
      line, acts, out
    ]));
  }

  /* ── 案卷 ─────────────────────────────────────────────── */
  function ago(ts) {
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return '方才';
    if (s < 3600) return Math.floor(s / 60) + ' 分钟前';
    if (s < 86400) return Math.floor(s / 3600) + ' 小时前';
    if (s < 2592000) return Math.floor(s / 86400) + ' 天前';
    var d = new Date(ts);
    return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
  }
  /* 门类名取 mods.js 那一份（匾上那两个字），八字/紫微沿用现网案卷里的「×命盘」 */
  function typeName(t) {
    var mm = window.ttMod ? window.ttMod(t) : null;
    if (mm && mm.key === t) return (t === 'bazi' || t === 'ziwei') ? mm.name + '命盘' : mm.name;
    return t === 'bazi' ? '八字命盘' : t === 'ziwei' ? '紫微命盘' : (t || '命盘');
  }
  function birthText(b) {
    if (!b || !b.year) return '';
    var x = b.year + '年' + b.month + '月' + b.day + '日';
    if (+b.hour >= 0 && +b.hour <= 11) x += ' ' + ZHI.charAt(+b.hour) + '时';
    if (b.gender) x += ' · ' + (b.gender === 'female' ? '坤' : '乾');
    return x;
  }

  function renderLog() {
    foot.textContent = '案卷存在这台设备的浏览器（IndexedDB）里，换设备请先导出。';
    body.textContent = '';
    var sec = el('div', 'tt-house__sec');
    sec.appendChild(el('p', 'tt-house__legend', '案卷'));
    var list = el('div', 'tt-house__recs');
    list.appendChild(el('p', 'tt-house__hint', '正在开柜…'));

    var exp = el('button', 'tt-house__btn', '导出 JSON');
    exp.type = 'button';
    var del = el('button', 'tt-house__btn', '清空全部');
    del.type = 'button';
    var note = el('p', 'tt-house__hint');
    var acts = el('div', 'tt-house__acts');
    acts.appendChild(exp); acts.appendChild(del);
    exp.addEventListener('click', function () {
      history.dump().then(function (j) { history.download(j) }).catch(function (e) {
        note.textContent = '导不出来 · ' + (e && e.message ? e.message : String(e));
      });
    });
    del.addEventListener('click', function () {
      /* 清空不可逆，所以不给弹窗、也不给一键：同一颗按第二下才真清 */
      if (!clearing) {
        clearing = 1; del.textContent = '再按一次确认清空';
        note.textContent = '清空会删掉这台设备上的全部案卷；导出的 JSON 不在其内。';
        clearTimeout(timer);
        timer = setTimeout(function () {
          if (clearing !== 1) return;
          clearing = 0; del.textContent = '清空全部'; note.textContent = '';
        }, 6000);
        return;
      }
      clearTimeout(timer);
      clearing = 0; del.textContent = '清空全部'; note.textContent = '';
      history.clear().then(refresh);
    });
    body.appendChild(sec);
    sec.appendChild(list); sec.appendChild(acts); sec.appendChild(note);

    function refresh() {
      return history.list().then(function (rows) {
        if (!open || tab !== 'log') return;
        list.textContent = '';
        if (!rows.length) {
          list.appendChild(el('p', 'tt-house__none', '柜里还空着 · 在门里起一盘，按「入卷」就记在这里'));
          return;
        }
        rows.forEach(function (r) {
          var nm = typeName(r.type);
          var rec = el('div', 'tt-house__rec');
          rec.appendChild(el('span', 'tt-house__reclip', nm.charAt(0)));
          var main = el('div', 'tt-house__recmain');
          main.appendChild(el('p', 'tt-house__recname', r.label || nm));
          main.appendChild(el('p', 'tt-house__recmeta',
            [birthText(r.birth), ago(r.createdAt)].filter(Boolean).join(' · ')));
          var x = el('button', 'tt-house__recx', '删');
          x.type = 'button';
          x.setAttribute('aria-label', '删除这一卷');
          x.addEventListener('click', function () { history.drop(r.id).then(refresh) });
          rec.appendChild(main); rec.appendChild(x);
          list.appendChild(rec);
        });
      }).catch(function (e) {
        list.textContent = '';
        list.appendChild(el('p', 'tt-house__err', '开柜失败 · ' + (e && e.message ? e.message : String(e))));
      });
    }
    refresh();
  }

  /* room.js 起盘入卷后喊一声：抽屉正开着就立刻重开柜 */
  window.ttHouseDirty = function () { if (open && tab === 'log') renderLog() };
  /* 门页的标头不钉住：滑到盘那里就够不着「记录」了，所以给门里一个直接开柜的口 */
  window.ttHouseOpen = function (kind) { show(kind === 'ai' ? 'ai' : 'log') };
})();
