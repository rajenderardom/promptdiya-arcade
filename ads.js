/* Prompt Diya Arcade - extra Adsterra banner slots.
   Every slot renders inside its own same-origin iframe (srcdoc), so the global
   `atOptions` used by Adsterra iframe banners never clashes between slots or with
   the page's existing ad. Slots reserve their exact size in CSS (no layout shift)
   and load lazily after the page (and the game) has loaded.
   Markup: <div class="pd-slot" data-size="300x250"></div>
   Gutters (wide desktop only): <div class="pd-gutter" data-side="left|right" data-box="#app"></div> */
(function () {
  "use strict";
  if (window.PDAds) return;
  var KEYS = {
    "300x250": "6918cda0e4086caeb3835cd8087cc58d",
    "728x90": "356a282d5401e5b3f8c831ce9166f721",
    "320x50": "c72bd1564ffafa9ad131d599fce8c6fc",
    "160x600": "b5a7bc67dcbf04ec1fe5100d63eef570",
    "468x60": "ab0de08f1440ac565034ce1a152242c4"
  };
  var css =
    ".pd-slot{display:block;position:relative;margin:18px auto;max-width:100%;overflow:hidden;text-align:center;contain:layout paint}" +
    ".pd-slot[data-size='300x250']{width:300px;height:250px}" +
    ".pd-slot[data-size='728x90']{width:728px;height:90px}" +
    ".pd-slot[data-size='320x50']{width:320px;height:50px}" +
    ".pd-slot[data-size='468x60']{width:468px;height:60px}" +
    ".pd-slot[data-size='160x600']{width:160px;height:600px}" +
    ".pd-slot iframe,.pd-gutter iframe{display:block;border:0;margin:0 auto;overflow:hidden;background:transparent}" +
    ".pd-wide{display:none}@media (min-width:768px){.pd-wide{display:block}.pd-narrow{display:none}}" +
    ".pd-mid{display:none}@media (min-width:520px){.pd-mid{display:block}.pd-mid-n{display:none}}" +
    ".pd-gutter{position:fixed;top:50%;left:0;width:160px;height:600px;margin-top:-300px;z-index:35;overflow:hidden;visibility:hidden;contain:layout paint}" +
    ".pd-gutter.on{visibility:visible}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  function fill(el) {
    if (el.__pdFilled) return;
    var size = el.getAttribute("data-size") || "160x600";
    var key = KEYS[size];
    if (!key) return;
    el.__pdFilled = 1;
    var wh = size.split("x"), w = +wh[0], h = +wh[1];
    var f = document.createElement("iframe");
    f.width = w; f.height = h;
    f.setAttribute("scrolling", "no");
    f.setAttribute("title", "Advertisement");
    f.setAttribute("aria-label", "Advertisement");
    f.style.width = w + "px"; f.style.height = h + "px";
    f.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>' +
      "<script>atOptions={'key':'" + key + "','format':'iframe','height':" + h + ",'width':" + w + ",'params':{}};<\/script>" +
      '<script src="https://bauval.org/22/' + key + '"><\/script></body></html>';
    el.appendChild(f);
  }

  /* ---- wide-desktop gutters: only where the free space beside the game is big enough ---- */
  var gutters = [];
  function boxRect(sel) {
    var root = document.querySelector(sel);
    if (!root) return null;
    var L = 1e9, R = -1e9, vw = innerWidth;
    var els = [root].concat([].slice.call(root.querySelectorAll("*")));
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.closest(".pd-gutter,.pd-howto,.x-ad")) continue;
      var r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.width >= vw - 4) continue;
      if (r.bottom < 0 || r.top > innerHeight) continue;
      L = Math.min(L, r.left); R = Math.max(R, r.right);
    }
    return L < R ? { left: L, right: R } : null;
  }
  function blockers() { // existing fixed ads we must stay clear of
    var out = [];
    [].forEach.call(document.querySelectorAll(".x-ad"), function (a) {
      var cs = getComputedStyle(a);
      if (cs.display === "none" || cs.position !== "fixed") return;
      var r = a.getBoundingClientRect();
      if (r.width > 0) out.push(r);
    });
    return out;
  }
  function placeGutters() {
    if (!gutters.length) return;
    var vw = innerWidth, vh = innerHeight, scrolled = window.scrollY > vh * 0.5;
    gutters.forEach(function (g) {
      var ok = false, x = 0;
      if (vw >= 1200 && vh >= 640 && !(scrolled && g.hasAttribute("data-game"))) {
        var b = boxRect(g.getAttribute("data-box") || "main");
        if (b) {
          var side = g.getAttribute("data-side");
          var segs = side === "left" ? [[0, b.left]] : [[b.right, vw]];
          var top = vh / 2 - 300, bot = vh / 2 + 300;
          blockers().forEach(function (r) {
            if (r.bottom < top || r.top > bot) return;
            var n = [];
            segs.forEach(function (sg) {
              if (r.right <= sg[0] || r.left >= sg[1]) { n.push(sg); return; }
              if (r.left > sg[0]) n.push([sg[0], r.left]);
              if (r.right < sg[1]) n.push([r.right, sg[1]]);
            });
            segs = n;
          });
          var best = null;
          segs.forEach(function (sg) { if (!best || sg[1] - sg[0] > best[1] - best[0]) best = sg; });
          var lo = best ? best[0] : 0, hi = best ? best[1] : 0;
          if (hi - lo >= 160 + 2 * 16) { ok = true; x = Math.round(lo + (hi - lo - 160) / 2); }
        }
      }
      g.style.left = x + "px";
      g.classList.toggle("on", ok);
      if (ok && started) fill(g);
    });
  }

  var started = false;
  function start() {
    if (started) return;
    started = true;
    var slots = [].slice.call(document.querySelectorAll(".pd-slot"));
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { fill(en.target); io.unobserve(en.target); } });
      }, { rootMargin: "300px 0px" });
      slots.forEach(function (s) { io.observe(s); });
    } else {
      slots.forEach(function (s) { if (s.offsetParent) fill(s); });
    }
    placeGutters();
  }
  function init() {
    gutters = [].slice.call(document.querySelectorAll(".pd-gutter"));
    var t;
    function re() { clearTimeout(t); t = setTimeout(placeGutters, 150); }
    addEventListener("resize", re);
    addEventListener("scroll", re, { passive: true });
    placeGutters();
    var go = function () { setTimeout(start, 1200); };
    if (document.readyState === "complete") go(); else addEventListener("load", go);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.PDAds = { fill: fill, place: placeGutters };
})();
