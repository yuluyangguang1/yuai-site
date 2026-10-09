/* 天机阁 V7 · 阁楼首页行为
   四件事：按 mods.js 那一份表生成命中区与展签、指到哪层哪层出字、点层把这一层滑到屏心再交棒给门页、
   以及让「阁楼在动」与「开灯熄灯」跟着那颗昼/夜走。
   视频不循环：每支播一遍就停在末帧（灯亮到底 / 云漫到位）。换片走画面叠化 ——
   两块 video 交替当「当前」与「入场」，入场那块从 opacity 0 淡到 1 压在旧块上，
   旧块停在末帧当底，所以是重叠渐显而不是硬切；淡完才收旧的，中途收会露出一帧空白。
   交棒给门页是必须的：满幅之后一层连檐带身也只有约 250×200 源像素，要「门满屏」
   得靠 doorart.html 那张 1024×1536 的门脸。
   ?mod=x 只把那一层滑到屏心、不跳转；?nosail=1 只滑不交棒；?clip=day|night 锁死片子不跟昼夜走。 */
(function () {
  var root = document.documentElement;
  var pav = document.getElementById('pav');
  var frame = document.getElementById('frame');
  var scroll = document.getElementById('scroll');
  if (!pav || !frame || !scroll || !window.TT_MODS) return;
  var q = new URLSearchParams(location.search);
  var v = /^[a-d]$/.test(q.get('v') || '') ? q.get('v') : 'd';
  var theme = q.get('theme');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqLight = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : null;

  /* ── 昼/夜就是开关灯；灯亮完不再重复 ─────────────────── */
  /* 实测夜那支的灯在 1→2 秒之间亮完（暖亮像素 0.54→1.11→2.34%，2 秒见顶），
     之后 8 秒是「夜变深 + 云上涨」，楼身平均亮度从 88 掉到 38。
     所以整段重叠重播会把差 2.3 倍亮度的两帧叠在一起闪一下 —— 就是用户说的突兀。
     做法：正放段与倒放段来回摆渡；倒放走完时正放不回 0，而是回到 from 秒，
     于是亮灯那一段只在第一次经过。昼那支 from=0，整段摆渡（用户说白天直接重叠播就好）。
     接缝天然闭合：倒放的第 0 帧就是正放的末帧，反之亦然。
     缓冲不绑死「A=正放、B=倒放」，谁拿哪段按 phase 走，叠化一律进「另一块」。
     上一版切主题时永远往 A 叠，而 A 恰好是当前那块的话，收尾就把刚要播的元素自己藏了 ——
     实测点「昼」之后两块全 hidden、画面空掉。 */
  var CLIPS = {
    day: { fwd: 'tower-day', back: 'tower-day-back', from: 0 },
    night: { fwd: 'tower-night', back: 'tower-night-back', from: 3 }
  };
  var tvA = document.getElementById('tvA');
  var tvB = document.getElementById('tvB');
  var forced = q.get('clip') === 'day' || q.get('clip') === 'night' ? q.get('clip') : '';
  var buf = [tvA, tvB], front = 0, cur = '', phase = 'fwd', fresh = 1;

  function clipFor(t) { return t === 'light' ? 'day' : 'night' }
  function themeNow() {
    var t = root.dataset.ttTheme;
    if (t === 'light' || t === 'dark') return t;
    return mqLight && mqLight.matches ? 'light' : 'dark';
  }
  function fileOf(p) { var c = CLIPS[cur]; return p === 'fwd' ? c.fwd : c.back }
  /* 每个主题的第一遍从 0 起（要看见灯亮），之后只在 from↔末 之间摆 */
  function atOf(p) { var c = CLIPS[cur]; return p === 'fwd' && !fresh ? c.from : 0 }
  function start(el) {
    if (!el) return;
    var p = el.play();
    if (p && p.catch) p.catch(function () {})
  }
  function play(el) {
    /* 只用于「继续播」：停在末帧的元素再 play() 会从头重放，那不是继续 */
    if (reduce || !el || el.ended) return;
    start(el);
  }
  /* 换段必须真的 seek 一次（哪怕拨到 0）：拨 currentTime 才会解除 ended 状态。
     上一版 at=0 时跳过 seek，于是上面那个守卫把第二次倒放也拦了，
     实测 B 卡在 7.0 整整 18 秒不动 —— 正是用户要治的「十秒后画面死了」。 */
  function seek(el, at) {
    if (!el) return;
    var go = function () { el.currentTime = at || 0 };
    if (el.readyState >= 1) go();
    else el.addEventListener('loadedmetadata', go, { once: true });
  }
  function file(el, name) {
    if (el.dataset.file !== name) {
      el.dataset.file = name;
      el.src = '/fortune/v7/art/' + name + '.mp4';
      el.load();
    }
  }
  /* 每次换段发一个号：连点两次昼夜时，第一拍那份收尾如果还执行，
     就会把第二拍刚推上前台的那块藏掉 —— 实测两块一起 hidden、画面空白，
     和「点昼变空白」是同一类竞态，只是这次是我自己写出来的。 */
  var gen = 0;
  function advance() {
    var g = ++gen;
    var old = buf[front], el = buf[1 - front], at = atOf(phase);
    fresh = 0;
    if (reduce) {
      /* 不摆渡也不播，但切了主题总得换个脸：把当前这块换成新主题的第一帧停住。
         另一块在这条路上根本不加载，省一半流量。 */
      file(old, CLIPS[cur].fwd);
      seek(old, 0);
      return;
    }
    file(el, fileOf(phase));
    var fired = 0;
    var done = function () {
      if (fired || g !== gen) return;
      fired = 1;
      el.removeAttribute('data-in');
      old.dataset.out = '1';
      old.pause();
    };
    el.removeAttribute('data-out');
    el.dataset.in = '1';
    seek(el, at);
    start(el);
    el.addEventListener('animationend', done, { once: true });
    /* 中途把系统「减少动效」打开的话，CSS 的 animation:none 会让 animationend 永远不来，
       两块就一直叠着、旧的也永远不暂停 —— 补一个比淡入更长的兜底。 */
    setTimeout(done, 1500);
    front = 1 - front;
  }
  function turn() { phase = phase === 'fwd' ? 'back' : 'fwd'; advance() }
  function onEnd(el) { if (el === buf[front]) turn() }
  function show(name) {
    if (!tvA || !tvB || !name || name === cur) return;
    cur = name; phase = 'fwd';
    if (!tvA.dataset.file && !tvB.dataset.file) {
      /* 第一次让带 poster 的 A 直接起播，不必先叠一层 */
      file(tvA, CLIPS[name].fwd);
      front = 0; fresh = 0;
      tvB.dataset.out = '1';
      play(tvA);
      return;
    }
    fresh = 1;
    advance();
  }
  if (tvA && tvB) {
    show(forced || clipFor(themeNow()));
    tvA.addEventListener('ended', function () { onEnd(tvA) });
    tvB.addEventListener('ended', function () { onEnd(tvB) });
    new MutationObserver(function () {
      if (!forced) show(clipFor(themeNow()));
    }).observe(root, { attributes: true, attributeFilter: ['data-tt-theme'] });
    if (mqLight && mqLight.addEventListener) {
      mqLight.addEventListener('change', function () {
        if (!forced && !root.dataset.ttTheme) show(clipFor(themeNow()));
      });
    }
    document.addEventListener('visibilitychange', function () {
      var el = buf[front];
      if (!el) return;
      if (document.hidden) el.pause(); else play(el);
    });
    /* 一块出错不该把另一块也拔掉：上一版 giveUp 把两块 src 全清、全暂停，
       一次网络抖动就永久白屏。现在只让坏的那块退场（两块都带 poster，露出来的是完整母版），
       并且 gen++ 让在跑的叠化收尾作废，免得它反手把好的那块藏掉。 */
    var onFail = function (el) {
      gen++;
      el.pause();
      if (el !== buf[front]) { el.dataset.out = '1'; return }
      var other = buf[1 - front];
      if (other.dataset.file) { other.removeAttribute('data-out'); front = 1 - front; play(other) }
    };
    tvA.addEventListener('error', function () { onFail(tvA) });
    tvB.addEventListener('error', function () { onFail(tvB) });
  }

  /* ── 十层命中区与展签 ─────────────────────────────────── */
  function bandStyle(m, i) {
    return '--tt-band-t:' + m.band[0] + '%;--tt-band-b:' + m.band[1]
      + '%;--tt-band-l:' + m.band[2] + '%;--tt-band-r:' + m.band[3] + '%;--tt-i:' + i;
  }
  /* 展签平时是 transparent 的字 + scaleX(0) 的刻度 + transparent 的底板，指到才现形。
     --tt-i 是入场扫描的错拍序号（自上而下），卡尺从九层一路量到臺基。
     sky=1 的那一门（每日）不在塔上：它在顶屏那片天里，所以塔身只有十层。 */
  var storeys = '', k2 = 0;
  for (var i = 0; i < window.TT_MODS.length; i++) {
    var m = window.TT_MODS[i];
    if (m.sky || !m.band) continue;
    storeys += '<button class="tt-pav__storey" data-mod="' + m.key + '" type="button"'
      + ' aria-label="' + m.slot + ' ' + m.name + '" style="' + bandStyle(m, k2) + '">'
      + '<span class="tt-pav__band" aria-hidden="true"></span>'
      + '<span class="tt-pav__tick" aria-hidden="true"></span>'
      + '<span class="tt-pav__tag" aria-hidden="true"><span class="tt-pav__slot">' + m.slot
      + '</span><span class="tt-pav__nm">' + m.name + '</span>'
      + '<span class="tt-pav__go">再点 · 推门</span></span></button>';
    k2++;
  }
  scroll.insertAdjacentHTML('beforeend', storeys);

  /* 选择器里的值必须带引号：?mod= 是用户能改的，值里一个空格或引号就让 querySelector 抛错 */
  function set(key, on) {
    var a = scroll.querySelector('.tt-pav__storey[data-mod="' + String(key).replace(/["\\]/g, '') + '"]');
    if (a) a.dataset.on = on ? '1' : '0';
    return a;
  }

  var nodes = pav.querySelectorAll('[data-mod]');
  /* 触屏没有 hover：展签原本只在指到时才出，手机用户根本不知道哪层是什么、
     点下去又直接跳走。所以粗指针改成两段式 —— 第一下走到那层门前（亮 + 出字 + 滑到屏心），
     第二下才推门进去。展签上那一行「再点 · 推门」只在 hover:none 下出现。 */
  var coarse = window.matchMedia && matchMedia('(hover: none)').matches;
  var armed = '';
  function disarm() { if (armed) { set(armed, 0); armed = '' } }
  for (var n = 0; n < nodes.length; n++) {
    (function (el) {
      var k = el.dataset.mod;
      el.addEventListener('pointerenter', function () { set(k, 1) });
      el.addEventListener('pointerleave', function () { if (armed !== k) set(k, 0) });
      el.addEventListener('focus', function () { set(k, 1) });
      el.addEventListener('blur', function () { if (armed !== k) set(k, 0) });
      el.addEventListener('click', function () {
        if (!coarse || armed === k) return rise(k, 1);
        disarm();
        armed = k;
        rise(k, 0);
      });
    })(nodes[n]);
  }
  /* 点别处就收回那盏灯：不然armed 的展签能一直挂在画上 */
  document.addEventListener('pointerdown', function (e) {
    if (e.target && e.target.closest && e.target.closest('.tt-pav__storey')) return;
    disarm();
  });

  /* 点层 = 登楼。把这一层滑到屏心（满幅之后放大只会糊，滑上去才是爬楼），压暗，再交棒给门页。 */
  function center(row) {
    var r = row.getBoundingClientRect();
    var max = document.documentElement.scrollHeight - innerHeight;
    var top = window.pageYOffset + r.top + r.height / 2 - innerHeight / 2;
    return Math.max(0, Math.min(top, max));
  }
  var busy = 0, undim = 0;
  function rise(key, go) {
    if (busy) return;
    var row = set(key, 1);
    if (!row) return;
    /* 点下去先举一下灯。reduce 下这条动画被 animation:none 掐了，animationend 永远不来，
       光冲会一直挂着、每点一次多一个监听器 —— 所以补一个定时器兜底。 */
    var off = function () { row.removeAttribute('data-lit') };
    row.dataset.lit = '1';
    row.addEventListener('animationend', off, { once: true });
    setTimeout(off, 1400);
    pav.dataset.rising = '1';
    window.scrollTo({ top: center(row), behavior: reduce ? 'auto' : 'smooth' });
    /* 只登楼不交棒（触屏第一段、或探针 ?nosail=1）：压暗要撤掉，也不许上锁 */
    if (!go || q.get('nosail')) {
      clearTimeout(undim);
      undim = setTimeout(function () { pav.dataset.rising = '0' }, reduce ? 0 : 1500);
      return;
    }
    busy = 1;
    setTimeout(function () {
      location.href = '/fortune/' + key + '/';
    }, reduce ? 0 : 1150);
  }
  /* 从门页按「返回」是走 bfcache 回来的：那时 busy 还锁着、压暗还挂着，
     实测回来之后点哪一层都没反应 —— 整页死了。 */
  window.addEventListener('pageshow', function () {
    busy = 0; disarm(); pav.dataset.rising = '0';
    play(buf[front]);
  });

  var pre = q.get('mod');
  if (pre) {
    var b2 = set(pre, 1);
    if (b2) {
      pav.dataset.rising = '1';
      window.scrollTo({ top: center(b2), behavior: 'auto' });
    } else if (window.ttMod(pre).sky) {
      /* 每日不在塔上，回到顶屏就是到它那扇门前 */
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  var one = function (el) {
    return el ? { src: (el.currentSrc || el.src || '').split('/').pop(), at: +el.currentTime.toFixed(2),
      dur: +(el.duration || 0).toFixed(2), ready: el.readyState, paused: el.paused, ended: el.ended,
      vis: getComputedStyle(el).visibility, op: (function(){var o=getComputedStyle(el).opacity;return +(+o).toFixed(2)})() } : null
  };
  /* __pav 是加载时算一次的快照；要看实时状态用 __pavSnap() */
  window.__pavSnap = function () {
    var sky = document.getElementById('sky');
    var frame0 = document.getElementById('frame');
    return { mods: window.TT_MODS.length, bands: scroll.querySelectorAll('.tt-pav__storey').length,
      day: (function () { var o = {}; ['solar', 'lunar', 'yg', 'mg', 'dg', 'yi', 'ji', 'chong', 'sha', 'na']
        .forEach(function (k) { var n = document.querySelector('[data-a=' + k + ']'); o[k] = n ? n.textContent : null }); return o })(),
      /* 暮色带的底边必须正好落在塔画容器的顶边上，差一像素就是一道横线 */
      seam: sky && frame0 ? { skyBottom: Math.round(sky.getBoundingClientRect().bottom + pageYOffset),
        frameTop: Math.round(frame0.getBoundingClientRect().top + pageYOffset) } : null,
      skyH: sky ? Math.round(sky.getBoundingClientRect().height) : 0,
      clip: cur, theme: themeNow(), phase: phase,
      front: front === 0 ? 'A' : 'B', scrollY: Math.round(window.pageYOffset),
      docH: document.documentElement.scrollHeight, viewH: innerHeight,
      a: one(tvA), b: one(tvB) };
  };
  window.__pav = window.__pavSnap();
})();
