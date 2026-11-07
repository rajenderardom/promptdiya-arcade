/* Prompt Diya Arcade - extra Adsterra banner slots.
   Every slot renders inside its own same-origin iframe (srcdoc), so the global
   `atOptions` used by Adsterra iframe banners never clashes between slots or with
   the page's existing ad. Slots reserve their exact size (no layout shift) and load
   lazily after the page (and the game) has loaded.

   1) In-page slots:   <div class="pd-slot" data-size="300x250"></div>
   2) Gutters (desktop > 768px only):
        <div class="pd-gutter" data-side="left|right" data-game data-box="#app"></div>
      The play area comes from window.PDPlay() (canvas games: returns [{left,right,top,bottom}, ...]
      in viewport px) or else from the data-box element. A gutter is placed only in its half of
      the screen, never over the play area, HUD, buttons, overlay cards or the existing fixed ad.
      Size: 160x600 when it fits, else 300x250, else hidden.
   3) Overlay slots: game-over / level-cleared / win / pause cards get one 300x250 (desktop) or
      320x50 (mobile) appended below their buttons, shown only if the card still fits without
      scrolling; otherwise it stays hidden.
   4) Main slot <div class="x-ad" id="adSlot"></div> (game pages): filled here, only while an overlay
      is open (body.ad-on). Phones (< 600px wide) get 320x50, never 300x250; wider screens 300x250.
   RULE: on game pages every Adsterra slot is display:none while the game is being played
   (body without .ad-on) - ads appear only with the start / pause / game-over / level-clear overlays. */
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
  var MAIN_KEY = "2e9392d7cf35a481d851732075d6d45c"; // main overlay 300x250 (desktop/tablet)
  var MOBILE_W = 600;
  function isPhone() { return innerWidth < MOBILE_W; }
  var GAME = !!document.getElementById("adSlot");
  if (GAME) document.documentElement.classList.add("pd-game");
  // overlays may grow down to the small phone banner only when no in-flow how-to section can cover them
  if (GAME && !document.querySelector(".pd-howto:not(.pd-fixedgame):not(.pd-abs)")) document.documentElement.classList.add("pd-ovfit");
  var OVERLAY_IDS = ["overOv", "ovOver", "clearOv", "winOv", "pauseOv", "ovPause"];
  var M = 12; // clearance around every placed ad
  var css =
    ".pd-slot{display:block;position:relative;margin:18px auto;max-width:100%;overflow:hidden;text-align:center;contain:layout paint}" +
    ".pd-slot[data-size='300x250']{width:300px;height:250px}" +
    ".pd-slot[data-size='728x90']{width:728px;height:90px}" +
    ".pd-slot[data-size='320x50']{width:320px;height:50px}" +
    ".pd-slot[data-size='468x60']{width:468px;height:60px}" +
    ".pd-slot[data-size='160x600']{width:160px;height:600px}" +
    ".pd-slot iframe,.pd-gutter iframe,.pd-ovad iframe{display:block;border:0;margin:0 auto;overflow:hidden;background:transparent}" +
    ".pd-wide{display:none}@media (min-width:768px){.pd-wide{display:block}.pd-narrow{display:none}}" +
    ".pd-mid{display:none}@media (min-width:520px){.pd-mid{display:block}.pd-mid-n{display:none}}" +
    ".pd-gutter{position:fixed;top:0;left:0;width:160px;height:600px;z-index:58;overflow:hidden;visibility:hidden;contain:layout paint;pointer-events:auto}" +
    ".pd-gutter.on{visibility:visible}" +
    ".pd-gutter>div{display:none}.pd-gutter>div.cur{display:block}" +
    ".pd-ovad{display:none;position:relative;margin:12px auto 0;overflow:hidden;flex:0 0 auto;contain:layout paint}" +
    ".pd-ovad.on{display:block}" +
    // game pages: no ad of any kind while playing
    "html.pd-game body:not(.ad-on) .x-ad,html.pd-game body:not(.ad-on) .pd-slot,html.pd-game body:not(.ad-on) .pd-native," +
    "html.pd-game body:not(.ad-on) .pd-gutter,html.pd-game body:not(.ad-on) .pd-ovad{display:none!important}" +
    "html.pd-game .x-ad{overflow:hidden;contain:layout paint}" +
    // phones: small banner only, capped so a creative can never grow past it
    "@media (max-width:" + (MOBILE_W - 1) + "px){html.pd-game .x-ad{width:320px!important;height:50px!important;max-width:100vw;max-height:100px!important;bottom:6px!important}" +
    "html.pd-ovfit body.ad-on .ov,html.pd-ovfit body.ad-on .overlay,html.pd-ovfit body.ad-on .x-ov{bottom:62px!important}" +
    "html.pd-game .pd-howto{padding-bottom:80px!important}" +
    "html.pd-game .pd-slot,html.pd-game .pd-ovad,html.pd-game .pd-native{max-height:100px!important;overflow:hidden!important}}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  function frame(size, key) {
    key = key || KEYS[size];
    if (!key) return null;
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
    return f;
  }
  function fill(el) {
    if (el.__pdFilled) return;
    var size = el.getAttribute("data-size") || "300x250";
    if (GAME && isPhone() && size === "300x250") { size = "320x50"; el.setAttribute("data-size", size); }
    var f = frame(size);
    if (!f) return;
    el.__pdFilled = 1;
    el.appendChild(f);
  }

  /* ---------------- geometry helpers ---------------- */
  function hit(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
  function domBox(sel) {
    var root = document.querySelector(sel);
    if (!root) return null;
    var L = 1e9, R = -1e9, T = 1e9, B = -1e9, vw = innerWidth, vh = innerHeight;
    var els = [root].concat([].slice.call(root.querySelectorAll("*")));
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.closest(".pd-gutter,.pd-howto,.x-ad")) continue;
      var r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.width >= vw - 4) continue;
      if (r.bottom < 0 || r.top > vh) continue;
      L = Math.min(L, r.left); R = Math.max(R, r.right); T = Math.min(T, r.top); B = Math.max(B, r.bottom);
    }
    return L < R ? { left: L, right: R, top: T, bottom: B } : null;
  }
  // Everything visible on screen that is not a big background layer: HUD pills, buttons,
  // overlay cards, the existing fixed ad, board tiles... Gutters must never cover these.
  function domObstacles() {
    var out = [], vw = innerWidth, vh = innerHeight;
    var els = document.body.getElementsByTagName("*");
    for (var i = 0; i < els.length; i++) {
      var e = els[i], tn = e.tagName;
      if (tn === "SCRIPT" || tn === "STYLE" || tn === "LINK" || tn === "META" || tn === "NOSCRIPT" || tn === "BR") continue;
      if (e.classList.contains("pd-gutter") || (e.parentElement && e.parentElement.closest(".pd-gutter"))) continue;
      var r = e.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.right <= 0 || r.left >= vw || r.bottom <= 0 || r.top >= vh) continue;
      var cs = getComputedStyle(e);
      if (r.width >= vw * 0.6 || r.height >= vh * 0.85) {
        // backgrounds / full-screen layers are skipped, but a full-width HUD bar is reserved whole
        // (its pills can grow or appear later, e.g. a Best score)
        if (!(r.height <= 140 && r.height < vh * 0.25 && /fixed|absolute|sticky/.test(cs.position))) continue;
        var kl = 1e9, kr = -1e9;
        [].forEach.call(e.children, function (k) { var q = k.getBoundingClientRect(); if (q.width > 0 && q.height > 0) { kl = Math.min(kl, q.left); kr = Math.max(kr, q.right); } });
        if (kl < kr) { out.push({ left: kl, right: kr, top: r.top, bottom: r.bottom }); continue; }
      }
      if (cs.visibility === "hidden" || cs.opacity === "0") continue;
      out.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
    }
    return out;
  }
  function playRects(g) {
    if (typeof window.PDPlay === "function") {
      try { var p = window.PDPlay(); if (p) return p.length !== undefined ? p : [p]; } catch (e) {}
    }
    var b = domBox(g.getAttribute("data-box") || "main");
    return b ? [b] : [];
  }
  // Find the most central spot for a w*h box inside [x0,x1] x [M, vh-M] avoiding obstacles.
  function findSpot(w, h, x0, x1, obs) {
    var vh = innerHeight, lo = x0 + M, hi = x1 - M - w;
    if (hi < lo || vh - 2 * M < h) return null;
    var exp = [];
    for (var i = 0; i < obs.length; i++) {
      var o = obs[i];
      if (o.right + M <= x0 || o.left - M >= x1) continue;
      exp.push({ left: o.left - M, right: o.right + M, top: o.top - M, bottom: o.bottom + M });
    }
    var step = 6, ys = [];
    for (var y = M; y <= vh - M - h; y += step) ys.push(y);
    var yc = Math.round((vh - h) / 2);
    if (yc >= M && yc <= vh - M - h) ys.push(yc);
    ys.sort(function (a, b) { return Math.abs(a - yc) - Math.abs(b - yc); });
    for (var k = 0; k < ys.length; k++) {
      var yy = ys[k], band = [];
      for (var j = 0; j < exp.length; j++) if (exp[j].top < yy + h && exp[j].bottom > yy) band.push(exp[j]);
      // free x intervals for this row
      var segs = [[lo, hi + w]];
      band.forEach(function (o) {
        var n = [];
        segs.forEach(function (sg) {
          if (o.right <= sg[0] || o.left >= sg[1]) { n.push(sg); return; }
          if (o.left > sg[0]) n.push([sg[0], o.left]);
          if (o.right < sg[1]) n.push([o.right, sg[1]]);
        });
        segs = n;
      });
      var best = null;
      segs.forEach(function (sg) { if (sg[1] - sg[0] >= w && (!best || sg[1] - sg[0] > best[1] - best[0])) best = sg; });
      if (best) return { x: Math.round(best[0] + (best[1] - best[0] - w) / 2), y: yy };
    }
    return null;
  }

  /* ---------------- gutters ---------------- */
  var gutters = [], started = false;
  function showSize(g, size) {
    var kids = g.children, box = null;
    for (var i = 0; i < kids.length; i++) {
      var on = kids[i].getAttribute("data-size") === size;
      kids[i].classList.toggle("cur", on);
      if (on) box = kids[i];
    }
    if (!box) {
      box = document.createElement("div");
      box.setAttribute("data-size", size);
      box.className = "cur";
      g.appendChild(box);
    }
    var wh = size.split("x");
    g.style.width = wh[0] + "px"; g.style.height = wh[1] + "px";
    box.style.width = wh[0] + "px"; box.style.height = wh[1] + "px";
    if (started) fill(box);
  }
  // HUD text can grow after placement: re-place only if a visible gutter now touches something
  function watchGutters() {
    var bad = false, obs = null;
    gutters.forEach(function (g) {
      if (bad || !g.__spot) return;
      obs = obs || domObstacles();
      var r = g.__spot;
      for (var i = 0; i < obs.length; i++) if (hit(r, obs[i])) { bad = true; return; }
    });
    if (bad) placeGutters();
  }
  function placeGutters() {
    if (!gutters.length) return;
    if (GAME && !document.body.classList.contains("ad-on")) { gutters.forEach(function (g) { g.classList.remove("on"); g.__spot = null; }); return; }
    var vw = innerWidth, canvasGame = typeof window.PDPlay === "function";
    var maxScroll = canvasGame ? 40 : innerHeight * 0.5;
    gutters.forEach(function (g) { g.classList.remove("on"); g.__spot = null; });
    if (vw <= 768) return;
    var placed = [];
    var obs = domObstacles();
    gutters.forEach(function (g) {
      if (g.hasAttribute("data-game") && window.scrollY > maxScroll) return;
      var pr = playRects(g);
      if (!pr.length) return;
      var all = obs.concat(pr).concat(placed);
      var side = g.getAttribute("data-side");
      var x0 = side === "left" ? 0 : Math.floor(vw / 2), x1 = side === "left" ? Math.ceil(vw / 2) : vw;
      // the gutter must stay outside the play area horizontally, too
      pr.forEach(function (p) {
        if (p.bottom - p.top < innerHeight * 0.5) return; // short strips (perspective track rows) are plain obstacles
        if (side === "left") x1 = Math.min(x1, Math.max(0, p.left)); else x0 = Math.max(x0, Math.min(vw, p.right));
      });
      var sizes = ["160x600", "300x250"], spot = null, size = null;
      for (var i = 0; i < sizes.length && !spot; i++) {
        var wh = sizes[i].split("x");
        spot = findSpot(+wh[0], +wh[1], x0, x1, all);
        if (spot) size = sizes[i];
      }
      if (!spot) return;
      var w = +size.split("x")[0], h = +size.split("x")[1];
      g.style.left = spot.x + "px"; g.style.top = spot.y + "px";
      showSize(g, size);
      g.classList.add("on");
      g.__spot = { left: spot.x, top: spot.y, right: spot.x + w, bottom: spot.y + h, size: size };
      placed.push(g.__spot);
    });
  }

  /* ---------------- overlay slots ---------------- */
  var ovSlots = [];
  function setupOverlays() {
    OVERLAY_IDS.forEach(function (id) {
      var ov = document.getElementById(id);
      if (!ov) return;
      var card = ov.querySelector(".card,.x-card");
      if (!card || card.querySelector(".pd-ovad")) return;
      var box = document.createElement("div");
      box.className = "pd-ovad";
      box.setAttribute("aria-label", "Advertisement");
      card.appendChild(box);
      ovSlots.push({ ov: ov, card: card, box: box });
    });
  }
  function fits(s) {
    var ov = s.ov, card = s.card, cs = getComputedStyle(ov);
    var avail = ov.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    if (ov.clientHeight > innerHeight) avail -= ov.clientHeight - innerHeight;
    var cc = getComputedStyle(card);
    var inner = card.clientWidth - parseFloat(cc.paddingLeft) - parseFloat(cc.paddingRight);
    var w = parseFloat(s.box.style.width);
    return card.offsetHeight <= avail + 0.5 && ov.scrollHeight <= ov.clientHeight + 1 &&
      card.scrollHeight <= card.clientHeight + 1 && inner >= w - 0.5 &&
      document.documentElement.scrollWidth <= innerWidth;
  }
  function checkOverlays() {
    ovSlots.forEach(function (s) {
      var vis = getComputedStyle(s.ov).display !== "none" && getComputedStyle(s.ov).visibility !== "hidden";
      if (!vis || !started) { s.box.classList.remove("on"); return; }
      var size = innerWidth > 768 ? "300x250" : "320x50", wh = size.split("x");
      if (s.box.getAttribute("data-size") !== size) {
        s.box.innerHTML = ""; s.box.__pdFilled = 0;
        s.box.setAttribute("data-size", size);
        s.box.style.width = wh[0] + "px"; s.box.style.height = wh[1] + "px";
      }
      s.box.classList.add("on");
      if (!fits(s)) { s.box.classList.remove("on"); return; }
      fill(s.box);
    });
  }

  /* ---------------- main slot (#adSlot) ---------------- */
  function fillMain() {
    var el = document.getElementById("adSlot");
    if (!el || !document.body.classList.contains("ad-on")) return;
    var size = isPhone() ? "320x50" : "300x250";
    if (el.__pdMain === size) return;
    el.innerHTML = "";
    el.__pdMain = size;
    var f = frame(size, size === "300x250" ? MAIN_KEY : KEYS[size]);
    if (!f) return;
    // ad-blocker note: the srcdoc frame always exists, so look for the creative inside it
    f.addEventListener("load", function () {
      setTimeout(function () {
        var ok = false;
        try { ok = !!f.contentDocument.querySelector("iframe,img,a,ins,div"); } catch (e) { ok = true; }
        var n = document.getElementById("pdNote");
        if (n && !ok) n.classList.add("show");
      }, 3500);
    });
    el.appendChild(f);
  }

  /* ---------------- boot ---------------- */
  var t1;
  function refresh() { fillMain(); checkOverlays(); placeGutters(); }
  function later() { clearTimeout(t1); t1 = setTimeout(refresh, 150); }
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
    refresh();
    if (gutters.length) setInterval(function () { if (!document.hidden) watchGutters(); }, 2500);
  }
  function init() {
    gutters = [].slice.call(document.querySelectorAll(".pd-gutter"));
    setupOverlays();
    addEventListener("resize", later);
    addEventListener("scroll", later, { passive: true });
    if ("MutationObserver" in window) {
      // overlays opening/closing: size the overlay ad before paint, re-place gutters right after
      var mo = new MutationObserver(function () { fillMain(); checkOverlays(); later(); });
      var targets = [document.body].concat(ovSlots.map(function (s) { return s.ov; }));
      [].forEach.call(document.querySelectorAll(".overlay,.ov,.x-ov,.x-ad"), function (o) { if (targets.indexOf(o) < 0) targets.push(o); });
      targets.forEach(function (t) { mo.observe(t, { attributes: true, attributeFilter: ["class", "style"] }); });
    }
    fillMain();
    var go = function () { setTimeout(start, 1200); };
    if (document.readyState === "complete") go(); else addEventListener("load", go);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.PDAds = { fill: fill, place: placeGutters, refresh: refresh, main: fillMain };
})();
