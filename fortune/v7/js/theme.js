/* 昼/夜那颗按钮 = 楼里的灯，不是整页色板（新前端只有夜，见 pavilion.css / art.css 开头）。
   做三件事：写 data-tt-theme（pavilion.js 靠它换片）、存一次偏好、把当前那一档标出来 ——
   两颗字都是奶金，不标就没人知道现在亮着的是哪一支。
   pavilion.html 与 doorart.html 共用这一份；以前两页各抄一遍十行，改一处漏一处。 */
(function () {
  var root = document.documentElement;
  var opts = [].slice.call(document.querySelectorAll('.tt-theme__opt'));
  if (!opts.length) return;
  function now() {
    return root.dataset.ttTheme ||
      (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }
  function mark() {
    var t = now();
    opts.forEach(function (b) { b.classList.toggle('tt-theme__opt--on', b.dataset.theme === t) });
  }
  opts.forEach(function (b) {
    b.addEventListener('click', function () {
      root.dataset.ttTheme = b.dataset.theme;
      try { localStorage.setItem('tt-theme', b.dataset.theme); } catch (e) {}
      mark();
    });
  });
  mark();
})();
