/* Prompt Diya Arcade – share button helper.
   Usage: <button data-pd-share>Share</button> + PDShare.init({title, url, text:function(){return "..."}})
   Uses navigator.share when available, else a small menu (WhatsApp / X / Facebook / Copy link).
   WhatsApp pill: every [data-pd-share] inside a score overlay also gets a green "WhatsApp pe share karo"
   button right below its row (opens wa.me directly; navigator.share only if the popup is blocked).
   Options: wa:function(){return "Maine X mein N score kiya!"} (brag line, optional, derived from text otherwise),
            waAt:["#css-selector",...] extra places to put the pill (inserted after that element), wa:false = off. */
(function(){
  "use strict";
  if(window.PDShare)return;
  var cfg={title:document.title,url:"https://promptdiya-arcade.vercel.app/",text:function(){return "";}};
  var ICON='<svg class="pd-sh-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var css=
    '[data-pd-share]{white-space:nowrap}.pd-sh-ic{width:1.05em;height:1.05em;vertical-align:-.16em;margin-right:.35em;flex:none}'+
    '[data-pd-share].pd-icon-only .pd-sh-ic{margin:0}'+
    '.pd-sh-wrap{position:fixed;left:0;right:0;top:0;bottom:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:12px;'+
      'background:rgba(10,4,24,.6);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);touch-action:manipulation}'+
    '.pd-sh-wrap.show{display:flex}'+
    '.pd-sh{width:min(100%,320px);max-height:100%;overflow:auto;padding:16px;border-radius:20px;text-align:center;color:#f4ecff;'+
      'font:600 14px/1.3 ui-rounded,"SF Pro Rounded","Segoe UI",system-ui,-apple-system,Roboto,sans-serif;'+
      'background:linear-gradient(160deg,#4a2a86,#2a1250);border:1px solid rgba(255,255,255,.18);box-shadow:0 20px 50px rgba(0,0,0,.55)}'+
    '.pd-sh h3{margin:0 0 4px;font-size:18px;font-weight:900;color:#fff}'+
    '.pd-sh p{margin:0 0 12px;font-size:12px;font-weight:600;color:#cdb8ff;line-height:1.35;word-break:break-word}'+
    '.pd-sh-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}'+
    '.pd-sh-g a,.pd-sh-g button{display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding:8px 6px;border-radius:12px;'+
      'border:0;cursor:pointer;font:inherit;font-weight:800;font-size:14px;color:#fff;text-decoration:none;background:rgba(255,255,255,.1)}'+
    '.pd-sh-g .wa{background:#1fa855}.pd-sh-g .xx{background:#111}.pd-sh-g .fb{background:#1877f2}.pd-sh-g .cp{background:rgba(255,255,255,.16)}'+
    '.pd-sh-g svg{width:18px;height:18px;flex:none}'+
    '.pd-sh .pd-sh-x{margin-top:10px;width:100%;min-height:38px;border:0;border-radius:12px;cursor:pointer;font:inherit;font-weight:700;color:#cdb8ff;background:transparent}';
  css+=
    '.pd-wa{box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;max-width:340px;margin:10px auto 0;'+
      'min-height:48px;padding:10px 18px;border:0;border-radius:999px;cursor:pointer;text-decoration:none;white-space:nowrap;'+
      'font-family:inherit;font-weight:800;font-size:clamp(14px,4.2vw,17px);line-height:1.15;letter-spacing:.01em;color:#fff;'+
      'background:linear-gradient(180deg,#2fdc74 0%,#1faa52 100%);box-shadow:0 6px 18px rgba(18,140,70,.38),inset 0 1px 0 rgba(255,255,255,.35),inset 0 -2px 0 rgba(0,0,0,.14);'+
      'text-shadow:0 1px 1px rgba(0,60,25,.45);-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .12s,filter .12s}'+
    '.pd-wa:hover{filter:brightness(1.06)}.pd-wa:active{transform:scale(.97)}.pd-wa:focus-visible{outline:3px solid #fff;outline-offset:2px}'+
    '.pd-wa svg{width:1.4em;height:1.4em;flex:none;filter:drop-shadow(0 1px 1px rgba(0,60,25,.35))}'+
    '@media (max-height:600px){.pd-wa{min-height:42px;margin-top:8px;padding:8px 16px}}';
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  var SVG={
    wa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.7.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
    xx:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L1.9 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>',
    fb:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2C16.7 2.1 15.6 2 14.4 2 11.9 2 10.2 3.5 10.2 6.3v2.2H7.5v3.7h2.7V22H14v-9.8h2.8l.4-3.7H14z"/></svg>',
    cp:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>'
  };

  // keep every interaction with share UI away from the game's own input handlers
  var EV=["pointerdown","pointerup","pointermove","mousedown","mouseup","touchstart","touchend","touchmove","keydown","keyup","keypress","dblclick","contextmenu"];
  function shield(el){EV.forEach(function(t){el.addEventListener(t,function(e){e.stopPropagation();},{passive:true});});}

  var wrap=null,msgEl,waA,xA,fbA,cpB,lastFocus=null,cur=null;
  function build(){
    wrap=document.createElement("div");wrap.className="pd-sh-wrap";wrap.setAttribute("role","dialog");wrap.setAttribute("aria-modal","true");wrap.setAttribute("aria-label","Share");
    wrap.innerHTML='<div class="pd-sh"><h3>Share karo</h3><p class="pd-sh-m"></p><div class="pd-sh-g">'+
      '<a class="wa" target="_blank" rel="noopener">'+SVG.wa+'WhatsApp</a>'+
      '<a class="xx" target="_blank" rel="noopener">'+SVG.xx+'X</a>'+
      '<a class="fb" target="_blank" rel="noopener">'+SVG.fb+'Facebook</a>'+
      '<button type="button" class="cp">'+SVG.cp+'<span>Copy link</span></button>'+
      '</div><button type="button" class="pd-sh-x">Close</button></div>';
    document.body.appendChild(wrap);
    msgEl=wrap.querySelector(".pd-sh-m");waA=wrap.querySelector(".wa");xA=wrap.querySelector(".xx");fbA=wrap.querySelector(".fb");cpB=wrap.querySelector(".cp");
    shield(wrap);
    wrap.addEventListener("click",function(e){e.stopPropagation();if(e.target===wrap)close();});
    wrap.querySelector(".pd-sh-x").addEventListener("click",close);
    [waA,xA,fbA].forEach(function(a){a.addEventListener("click",function(){setTimeout(close,50);});});
    cpB.addEventListener("click",function(){copy(cur.url,function(ok){cpB.lastChild.textContent=ok?"Copied ✓":"Copy failed";
      setTimeout(function(){cpB.lastChild.textContent="Copy link";},1600);});});
    wrap.addEventListener("keydown",function(e){if(e.key==="Escape")close();});
  }
  function fitAboveAd(){
    // keep the menu out from under a fixed bottom ad (mobile 300x250)
    var b=0,ad=document.querySelector(".x-ad");
    if(ad){var cs=getComputedStyle(ad);
      if(cs.display!=="none"&&cs.position==="fixed"){var r=ad.getBoundingClientRect();
        if(r.height>0&&r.top>innerHeight*0.35&&r.left<innerWidth*0.75)b=Math.max(0,innerHeight-r.top+6);}}
    wrap.style.bottom=b+"px";
  }
  function open(d){
    if(!wrap)build();cur=d;lastFocus=document.activeElement;
    var full=d.text+" "+d.url;
    msgEl.textContent=full;
    waA.href="https://wa.me/?text="+encodeURIComponent(full);
    xA.href="https://twitter.com/intent/tweet?text="+encodeURIComponent(full);
    fbA.href="https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(d.url);
    fitAboveAd();wrap.classList.add("show");
    try{waA.focus({preventScroll:true});}catch(e){}
  }
  function close(){if(!wrap)return;wrap.classList.remove("show");if(lastFocus&&lastFocus.focus){try{lastFocus.focus({preventScroll:true});}catch(e){}}}
  function copy(s,cb){
    function legacy(){var t=document.createElement("textarea");t.value=s;t.setAttribute("readonly","");t.style.position="fixed";t.style.opacity="0";
      document.body.appendChild(t);t.select();var ok=false;try{ok=document.execCommand("copy");}catch(e){}t.remove();cb(ok);}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(s).then(function(){cb(true);},legacy);}else legacy();
  }
  function data(){
    var t="";try{t=String(cfg.text()||"");}catch(e){}
    if(!t)t="Prompt Diya Arcade pe free games khelo!";
    return {title:cfg.title,text:t,url:cfg.url};
  }
  function share(){
    var d=data();
    if(navigator.share){
      navigator.share({title:d.title,text:d.text,url:d.url}).catch(function(err){if(!err||err.name!=="AbortError")open(d);});
    }else open(d);
  }
  function fmt(n){n=Number(String(n).replace(/[^\d.-]/g,""))||0;try{return n.toLocaleString("en-IN");}catch(e){return String(n);}}
  function bind(btn){
    if(btn.__pdShare)return;btn.__pdShare=1;
    if(!btn.type||btn.tagName==="BUTTON")btn.type="button";
    if(!btn.querySelector(".pd-sh-ic"))btn.insertAdjacentHTML("afterbegin",ICON);
    if(!btn.getAttribute("aria-label"))btn.setAttribute("aria-label","Share");
    shield(btn);
    btn.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();share();});
  }

  /* ---------- WhatsApp pill ---------- */
  var WA_SVG='<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="#fff" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2c2 1.1 4.3 1.7 6.6 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3z"/><path fill="#25D366" d="M16 5.2c-6 0-10.8 4.8-10.8 10.6 0 2.3.7 4.4 2 6.2l-1.3 3.9 4-1.3c1.7 1.1 3.8 1.8 6.1 1.8 6 0 10.8-4.8 10.8-10.6S22 5.2 16 5.2z"/><path fill="#fff" d="M12.3 10.1c-.3-.6-.5-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.3 3.7 5.7 5 2.8 1.1 3.4.9 4 .8.6-.1 2-.8 2.2-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.6-.4l-2.1-1c-.3-.1-.5-.2-.7.1l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.4z"/></svg>';
  var WA_LABEL="WhatsApp pe share karo";
  function waLink(u){return u+(u.indexOf("?")<0?"?":"&")+"utm_source=whatsapp&utm_medium=share";}
  function waText(){
    var t="",own=false;
    if(typeof cfg.wa==="function"){try{t=String(cfg.wa()||"").trim();own=!!t;}catch(e){t="";}}
    if(!t){try{t=String(cfg.text()||"").trim();}catch(e){t="";}}
    if(!t)t="Maine "+cfg.title+" khela!";
    if(own){if(!/\?\s*$/.test(t))t+=" 🔥 Kya tum mujhe hara sakte ho?";}
    else{var m=/^[\s\S]*?!/.exec(t);
      if(m)t=m[0]+" 🔥 Kya tum mujhe hara sakte ho?";   // "Maine X mein N score kiya!" + challenge
      else t=t.replace(/[\s:]+$/,"")+"!";}               // e.g. "…computer jeet gaya 😅 Tum jeet ke dikhao!"
    return t+" Free khelo: "+waLink(cfg.url);
  }
  function waUrl(){return "https://wa.me/?text="+encodeURIComponent(waText());}
  function waGo(a){
    var u=waUrl();a.href=u;
    try{if(window.console&&console.info)console.info("[PDShare] wa.me ->",u);}catch(e){}
    var w=null;try{w=window.open(u,"_blank");}catch(e){w=null;}
    if(w){try{w.opener=null;}catch(e){}return;}
    // popup blocked: native share sheet as fallback, else same-tab navigation
    var full=waText();
    if(navigator.share){navigator.share({title:cfg.title,text:full}).catch(function(err){if(!err||err.name!=="AbortError")location.href=u;});}
    else location.href=u;
  }
  function waMake(){
    var a=document.createElement("a");a.className="pd-wa";a.setAttribute("data-pd-wa","");a.href="https://wa.me/";a.target="_blank";a.rel="noopener";
    a.setAttribute("role","button");a.setAttribute("aria-label",WA_LABEL);a.innerHTML=WA_SVG+"<span>"+WA_LABEL+"</span>";
    shield(a);
    a.addEventListener("pointerenter",function(){a.href=waUrl();});
    a.addEventListener("focus",function(){a.href=waUrl();});
    a.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();waGo(a);});
    return a;
  }
  function inOverlay(el){
    for(var n=el;n&&n!==document.body;n=n.parentNode){
      var c=" "+(n.className&&n.className.baseVal===undefined?n.className:"")+" ",id=n.id||"";
      if(/ (ov|x-ov|overlay|modal) /.test(c)||/Ov$|Overlay$/.test(id))return true;}
    return false;
  }
  function waAnchor(btn){
    var p=btn.parentNode;if(!p||p===document.body)return btn;
    // a pure button row (only buttons/links inside) -> pill goes under the whole row; otherwise right after the button
    var row=false;
    for(var i=0;i<p.children.length;i++){var c=p.children[i];if(!/^(BUTTON|A)$/.test(c.tagName))return btn;if(c!==btn)row=true;}
    return row?p:btn;
  }
  function waPlace(after){
    if(!after||!after.parentNode)return;
    var nx=after.nextElementSibling;if(nx&&nx.hasAttribute&&nx.hasAttribute("data-pd-wa"))return;
    after.parentNode.insertBefore(waMake(),after.nextSibling);
  }
  function waAll(){
    if(cfg.wa===false)return;
    [].forEach.call(document.querySelectorAll("[data-pd-share]"),function(b){if(inOverlay(b))waPlace(waAnchor(b));});
    (cfg.waAt||[]).forEach(function(sel){[].forEach.call(document.querySelectorAll(sel),waPlace);});
  }
  window.PDShare={
    init:function(o){for(var k in o)cfg[k]=o[k];
      var go=function(){[].forEach.call(document.querySelectorAll("[data-pd-share]"),bind);waAll();};
      if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();},
    data:data,open:open,close:close,share:share,fmt:fmt,waText:waText,waUrl:waUrl,waRefresh:waAll
  };
})();
