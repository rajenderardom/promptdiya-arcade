/* Prompt Diya Arcade - "Ad dekho, 1 extra life lo" (once per round).
   Shown ONLY on the game-over card. Opens a short ad break (Adsterra banner + 5 s timer),
   then the game continues. Watching is optional; clicking the ad is never required.
   Usage in a game:
     PDRevive.init({card:'#ovOver .card', before:'#againBtn', onRevive:function(){...}});
     PDRevive.arm();   // call when a NEW round starts (not on revive)
*/
(function () {
  "use strict";
  if (window.PDRevive) return;
  var KEY = "6918cda0e4086caeb3835cd8087cc58d"; // 300x250
  var SECS = 5, used = false, cfg = null, btn = null, modal = null, timer = null;
  var css =
    ".pd-rv{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;max-width:300px;margin:4px auto 10px;padding:12px 16px;border:0;border-radius:14px;cursor:pointer;" +
    "font:700 15px/1.2 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#1a0b2e;background:linear-gradient(135deg,#ffe066,#ffb347);box-shadow:0 6px 18px rgba(255,179,71,.35);animation:pdRvP 1.6s ease-in-out infinite}" +
    ".pd-rv small{display:block;font-weight:600;font-size:11px;opacity:.75}.pd-rv[hidden]{display:none!important}" +
    "@keyframes pdRvP{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}" +
    ".pd-rvm{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(8,3,20,.88);backdrop-filter:blur(4px)}" +
    ".pd-rvm .bx{width:min(340px,94vw);background:#1b0f33;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:16px;text-align:center;color:#fff;font:14px/1.4 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    ".pd-rvm h3{margin:0 0 4px;font-size:17px}.pd-rvm p{margin:0 0 10px;opacity:.75;font-size:12px}" +
    ".pd-rvm .ad{width:300px;height:250px;max-width:100%;margin:0 auto 12px;background:rgba(255,255,255,.04);border-radius:8px;overflow:hidden}" +
    ".pd-rvm iframe{display:block;border:0;width:300px;height:250px}" +
    ".pd-rvm .go{width:100%;padding:12px;border:0;border-radius:12px;font:700 16px system-ui,sans-serif;background:#38f3ff;color:#06121f;cursor:pointer}" +
    ".pd-rvm .go:disabled{background:#3a3150;color:#aaa;cursor:default}" +
    ".pd-rvm .x{margin-top:8px;background:none;border:0;color:#bbb;font-size:12px;text-decoration:underline;cursor:pointer}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function adFrame() {
    var f = document.createElement("iframe");
    f.setAttribute("scrolling", "no"); f.title = "Advertisement";
    f.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden;background:transparent}</style></head><body>' +
      "<script>atOptions={'key':'" + KEY + "','format':'iframe','height':250,'width':300,'params':{}};<\/script>" +
      '<script src="https://bauval.org/22/' + KEY + '"><\/script></body></html>';
    return f;
  }
  function close() { clearInterval(timer); if (modal) { modal.remove(); modal = null; } }
  function open() {
    if (used || modal) return;
    modal = document.createElement("div"); modal.className = "pd-rvm";
    modal.innerHTML = '<div class="bx"><h3>📺 Chhota sa ad break</h3><p>Bas ' + SECS + ' second ruko, phir game wahin se chalega.</p>' +
      '<div class="ad"></div><button class="go" disabled>' + SECS + '</button><br><button class="x">Nahi chahiye</button></div>';
    document.body.appendChild(modal);
    modal.querySelector(".ad").appendChild(adFrame());
    var go = modal.querySelector(".go"), left = SECS;
    timer = setInterval(function () {
      left--;
      if (left > 0) { go.textContent = left; return; }
      clearInterval(timer); go.disabled = false; go.textContent = "▶ Continue (+1 life)";
    }, 1000);
    go.addEventListener("click", function () {
      if (go.disabled) return;
      used = true; if (btn) btn.hidden = true; close();
      try { cfg.onRevive(); } catch (e) { console.error(e); }
    });
    modal.querySelector(".x").addEventListener("click", close);
  }
  window.addEventListener("keydown", function (e) { if (modal) { e.stopImmediatePropagation(); if (e.key === " " || e.key === "Enter") e.preventDefault(); } }, true);
  window.PDRevive = {
    init: function (c) {
      cfg = c;
      var card = document.querySelector(c.card); if (!card) return;
      btn = document.createElement("button"); btn.type = "button"; btn.className = "pd-rv";
      btn.innerHTML = "<span>📺</span><span>Ad dekho, 1 extra life lo<small>Watch an ad to continue</small></span>";
      btn.addEventListener("click", function (e) { e.stopPropagation(); open(); });
      var ref = c.before && card.querySelector(c.before);
      var row = ref && ref.parentElement !== card ? ref.parentElement : ref;
      if (row) card.insertBefore(btn, row); else card.appendChild(btn);
    },
    arm: function () { used = false; close(); if (btn) btn.hidden = false; },
    get used() { return used; }
  };
})();
