/* 天机阁 V7 · 从一张母版切出「门框板 + 两扇门叶」
   为什么切而不换图：生成模型两次出图不可能同构图（实测闭合版主体 y 88 起、高 1370，
   敞开版 y 140 起、高 1300，中心还差 5px），整张互淡会让门框跳一下。
   所以只用闭合版：把门场挖空当背板，门内光用 CSS 渐变自己铺，两扇叶按中缝切开自己转。

   门场是量出来的，不是写死的：中缝 = 中心附近最暗的一列；上下界 = 缝旁那条竖线上最长的
   一段「红」；左右界 = 从中缝往两边推，容忍金钉造成的小断口（>22px 连续非红才算到边）。
   量歪了用 ?rect=左,上,宽,高（百分比）临时压过，或开 ?guides=1 把矩形画出来看。 */
(function () {
  var root = document.documentElement;
  var q = new URLSearchParams(location.search);
  var art = document.getElementById('art');
  if (!art) return;
  /* 母版三份来源，优先级从高到低：?src= 现场试图 → 这道门在 mods.js 里标的 src → 八字那张。
     以前只认 ?src=，所以逐道门接线时还得再改这里；现在标注写在 mods.js 一处就够。 */
  var SRC = q.get('src') || art.dataset.src || '/fortune/v7/art/door-master.webp';

  var img = new Image();
  /* 出图失败与"解不了像素"要分开说：file:// 下画布被判跨源，getImageData 直接抛 SecurityError，
     不接住的话这一页永远停在 loading，而且除了控制台没有任何提示。 */
  function fail(e) {
    art.dataset.state = 'imgfail';
    var h = document.querySelector('.tt-art__hint');
    if (h) h.textContent = e ? '这道门的图读不出来（' + e.name + '）· 请用 http 打开'
      : '这道门的母版没到位 · 换 ?src= 试试';
  }
  img.onload = function () { try { boot(img) } catch (e) { fail(e) } };
  img.onerror = function () { fail() };
  img.src = SRC;

  function boot(im) {
    var W = im.naturalWidth, H = im.naturalHeight;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var g = cv.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0);
    var d = g.getImageData(0, 0, W, H).data;
    var px = function (x, y) { var i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; };
    var red = function (x, y) { var p = px(x, y); return p[3] > 16 && p[0] > 70 && p[0] - p[1] > 25 && p[0] - p[2] > 25; };

    /* 1) 不透明包围盒（图里真实画到的范围），中心取整盒中点 */
    var x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (var y = 0; y < H; y += 2) for (var x = 0; x < W; x += 2) {
      var p = px(x, y); if (p[3] < 16) continue;
      if (p[0] > 245 && p[1] > 245 && p[2] > 245) continue;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    var cx = Math.round((x0 + x1) / 2);

    /* 2) 中缝：中心 ±120 里最暗的一列，取门场中段那条横线 */
    var yProbe = Math.round(y0 + (y1 - y0) * 0.62), best = 1e9, seam = cx;
    for (var sx = cx - 120; sx <= cx + 120; sx++) {
      var sp = px(sx, yProbe), lum = sp[0] * 0.3 + sp[1] * 0.6 + sp[2] * 0.1;
      if (lum < best) { best = lum; seam = sx; }
    }

    /* 3) 上下界：缝旁 40px 那条竖线上最长的连续红段。
       必须带断口容忍——金钉、铺首、刻线都会把红打断十几行，零容忍会在门场中段就收工
       （第一版量出来 332 高，真实约 690，就是这个原因）。 */
    var col = seam - 40 < x0 ? seam + 40 : seam - 40;
    var bestTop = 0, bestBot = 0, bestLen = 0, cur = -1, gap = 0, VGAP = 40;
    for (var yy = y0; yy <= y1; yy++) {
      if (red(col, yy)) { if (cur < 0) cur = yy; gap = 0; }
      else if (cur >= 0 && ++gap > VGAP) {
        if (yy - gap - cur > bestLen) { bestLen = yy - gap - cur; bestTop = cur; bestBot = yy - gap; }
        cur = -1; gap = 0;
      }
    }
    if (cur >= 0 && y1 - cur > bestLen) { bestTop = cur; bestBot = y1; }
    var runTop = bestTop, runBot = bestBot;

    /* 4) 左右界：从缝往两边推，容忍 ≤22px 的非红断口（金钉、铺首都会打断红） */
    var yMid = Math.round((runTop + runBot) / 2);
    var edge = function (dir) {
      var x = seam, gap = 0, last = seam;
      while (x > x0 + 2 && x < x1 - 2) {
        x += dir;
        if (red(x, yMid)) { gap = 0; last = x; }
        else if (++gap > 22) break;
      }
      return last;
    };
    var L = edge(-1), R = edge(1);

    var rect = { x: L, y: runTop, w: R - L, h: runBot - runTop };
    /* 门场优先用**页面标注**的那一份（data-rect="左,上,宽,高"，百分比）。
       上面那套启发式只是兜底：整座门楼从头到尾都是红的，匾、门簪带、柱子连成一片，
       自动量必然把上下界各撑开一截（第一版量到 y 378 起，真实门场 y 733 起）。
       十一道门的构图各不相同，「切在哪儿」是美术判断不是算法判断，所以逐道标注、
       自动值只用来给新图起个手。?rect= 再高一级，便于当场试 ——
       上一版把顺序写反了（data-rect 在前），结果注释里承诺的 ?rect= 永远压不过页面标注，
       当场试标只能去改 HTML。 */
    var src = (q.get('rect') || art.dataset.rect || '').split(',').map(Number);
    if (src.length === 4 && src.every(isFinite)) {
      rect = { x: W * src[0] / 100, y: H * src[1] / 100, w: W * src[2] / 100, h: H * src[3] / 100 };
    }

    /* 5) 背板：整张画上去，再把门场挖空 */
    var plate = art.querySelector('.tt-art__plate');
    plate.width = W; plate.height = H;
    var pg = plate.getContext('2d');
    pg.drawImage(im, 0, 0);
    pg.globalCompositeOperation = 'destination-out';
    pg.fillRect(rect.x, rect.y, rect.w, rect.h);

    /* 6b) 太极盘：data-disc="cx,cy,r"（母版图像素），圆心落在中缝上。
       挖洞、填槽、画盘三处共用同一组数——差 1px 闭合态就会露出一圈白边。
       盘绕自己的圆心转，所以它的轮廓始终不变、永远正好盖住那个洞：
       转的过程中不露底，转到左门上之后跟着左门做 3D 变换也依然贴合。 */
    var dd = (art.dataset.disc || '').split(',').map(Number);
    var D = (dd.length === 3 && dd.every(isFinite)) ? { x: dd[0], y: dd[1], r: dd[2] } : null;

    var half = rect.w / 2;
    var leaves = {};
    [['l', rect.x], ['r', rect.x + half]].forEach(function (s) {
      var c = art.querySelector('.tt-art__leaf--' + s[0]);
      c.width = Math.round(half); c.height = Math.round(rect.h);
      var lg = c.getContext('2d');
      lg.drawImage(im, Math.round(s[1]), Math.round(rect.y), Math.round(half), Math.round(rect.h),
        0, 0, Math.round(half), Math.round(rect.h));
      leaves[s[0]] = { g: lg, ox: s[1] };
    });

    if (D) {
      /* 左叶挖空（盘在它上面） */
      var lgc = leaves.l.g;
      lgc.save(); lgc.globalCompositeOperation = 'destination-out';
      lgc.beginPath(); lgc.arc(D.x - rect.x, D.y - rect.y, D.r, 0, Math.PI * 2); lgc.fill(); lgc.restore();
      /* 右叶填成凹槽：取盘面正下方一点的门面色压暗当槽底。
         颜色从图里采，不写死——换一道门、换一个色板都不用改代码。
         不填就会在右门留一个透光的圆洞，看着像 bug 不像门。 */
      var sp = px(Math.round(D.x), Math.round(D.y + D.r + 10));
      var rlg = leaves.r.g;
      rlg.save(); rlg.beginPath();
      rlg.arc(D.x - (rect.x + half), D.y - rect.y, D.r, 0, Math.PI * 2);
      rlg.fillStyle = 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(sp[k] * 0.42) }).join(',') + ')';
      rlg.fill(); rlg.restore();
      /* 盘本体：裁成正圆，挂进左叶的包裹层 */
      var side = Math.round(D.r * 2);
      var dc = art.querySelector('.tt-art__disc');
      dc.width = side; dc.height = side;
      var dg = dc.getContext('2d');
      dg.save(); dg.beginPath(); dg.arc(D.r, D.r, D.r, 0, Math.PI * 2); dg.clip();
      dg.drawImage(im, Math.round(D.x - D.r), Math.round(D.y - D.r), side, side, 0, 0, side, side);
      dg.restore();
      art.style.setProperty('--tt-disc-l', ((D.x - D.r - rect.x) / rect.w * 100).toFixed(3) + '%');
      art.style.setProperty('--tt-disc-t', ((D.y - D.r - rect.y) / rect.h * 100).toFixed(3) + '%');
      art.style.setProperty('--tt-disc-w', (side / rect.w * 100).toFixed(3) + '%');
      art.style.setProperty('--tt-disc-h', (side / rect.h * 100).toFixed(3) + '%');
    }

    /* 7) 位置写回 CSS（百分比，跟着版面缩放自动跟着走） */
    var pct = function (v, total) { return (v / total * 100).toFixed(3) + '%'; };
    art.style.setProperty('--tt-art-l', pct(rect.x, W));
    art.style.setProperty('--tt-art-t', pct(rect.y, H));
    art.style.setProperty('--tt-art-w', pct(rect.w, W));
    art.style.setProperty('--tt-art-hh', pct(rect.h, H));
    art.style.setProperty('--tt-art-ar', W + ' / ' + H);

    /* 匾位同理；匾上的字是真实文本（图里匾面留空），可访问名字交给容器的 aria-label，
       字本身 aria-hidden，免得读屏把「八字 推门而入 八字」念两遍。 */
    var pl = (art.dataset.plaque || '').split(',').map(Number);
    if (pl.length === 4 && pl.every(isFinite)) {
      art.style.setProperty('--tt-art-px', pl[0] + '%');
      art.style.setProperty('--tt-art-py', pl[1] + '%');
      art.style.setProperty('--tt-art-pw', pl[2] + '%');
      art.style.setProperty('--tt-art-ph', pl[3] + '%');
    }
    var name = art.dataset.name || '';
    var nameEl = document.getElementById('artName');
    if (nameEl) nameEl.textContent = name;

    art.dataset.state = 'ready';
    art.setAttribute('role', 'button');
    art.setAttribute('tabindex', '0');
    art.setAttribute('aria-label', (name ? name + ' · ' : '') + '推门而入');
    var open = function (v) { art.dataset.open = v ? '1' : '0'; };
    art.addEventListener('click', function () { open(art.dataset.open !== '1'); });
    art.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(art.dataset.open !== '1'); }
    });

    /* 审计：量出来的数打在 window 上，探针脚本直接读，不用我肉眼猜 */
    window.__art = { size: [W, H], box: [x0, y0, x1, y1], seam: seam, seamLum: best,
      rect: [Math.round(rect.x), Math.round(rect.y), Math.round(rect.w), Math.round(rect.h)],
      pct: [pct(rect.x, W), pct(rect.y, H), pct(rect.w, W), pct(rect.h, H)] };
    console.log('ART', JSON.stringify(window.__art));
  }
})();
