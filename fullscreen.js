/* Prompt Diya Arcade – "Play in Full Screen" helper (arcade + Juicy Slice site only; never in portal builds).
   Adds a "Play in Full Screen" button right after the start screen's Play button and a small enter/exit
   toggle next to the in-game mute button (or a fixed top-left icon when a game has none).
   Hidden where the Fullscreen API is missing (iPhone/iOS Safari) or when running as an installed app;
   iOS gets a small "Add to Home Screen" tip instead. Pages that already have #fsBtn (Flare Ace) are skipped. */
(function(){
  "use strict";
  var d=document,de=d.documentElement;
  if(window.PDFullscreen||d.getElementById("fsBtn"))return;
  window.PDFullscreen=1;
  var SVG='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="fs-in" d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/><path class="fs-out" d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>';
  var css='.fsb svg{width:1.1em;height:1.1em;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;vertical-align:-.17em}'+
    '.fsb .fs-out,.fs-on .fsb .fs-in{display:none}.fs-on .fsb .fs-out{display:inline}'+
    '.pd-fs-start{box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:7px;margin:10px auto 0;min-height:42px;padding:8px 18px;'+
      'border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);color:inherit;cursor:pointer;'+
      'font:inherit;font-weight:800;font-size:15px;line-height:1.1;white-space:nowrap;-webkit-tap-highlight-color:transparent;touch-action:manipulation}'+
    '.pd-fs-start:active{transform:scale(.97)}.pd-fs-start:focus-visible{outline:3px solid #fff;outline-offset:2px}'+
    '.pd-fs-fix{position:fixed;left:max(8px,env(safe-area-inset-left));bottom:max(8px,env(safe-area-inset-bottom));z-index:40;width:34px;height:34px;padding:0;border-radius:10px;'+
      'border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:.8}'+
    '.pd-fs-tip{display:none;font-size:12px;opacity:.8;margin:8px auto 0;text-align:center}'+
    '.no-fs .fsb{display:none!important}.no-fs.ios .pd-fs-tip{display:block}';
  var st=d.createElement("style");st.textContent=css;d.head.appendChild(st);

  var can=!!(de.requestFullscreen||de.webkitRequestFullscreen)&&(d.fullscreenEnabled!==false||d.webkitFullscreenEnabled);
  var standalone=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
  var ios=/iP(hone|od|ad)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  if(!can||standalone){de.classList.add("no-fs");if(ios&&!standalone)de.classList.add("ios");}

  var EV=["pointerdown","pointerup","pointermove","mousedown","mouseup","touchstart","touchend","touchmove","keydown","keyup","keypress","dblclick","contextmenu"];
  function shield(b){EV.forEach(function(t){b.addEventListener(t,function(e){e.stopPropagation();},{passive:true});});}
  function cur(){return d.fullscreenElement||d.webkitFullscreenElement||null;}
  function enter(){var p;try{p=de.requestFullscreen?de.requestFullscreen({navigationUI:"hide"}):de.webkitRequestFullscreen();}catch(e){}
    if(p&&p.catch)p.catch(function(){});}
  function exit(){try{if(d.exitFullscreen)d.exitFullscreen().catch(function(){});else if(d.webkitExitFullscreen)d.webkitExitFullscreen();}catch(e){}}
  function toggle(e){if(e){e.preventDefault();e.stopPropagation();}if(cur())exit();else enter();try{this.blur();}catch(_){}}
  var startBtn=null,hudBtn=null;
  function sync(){var on=!!cur();de.classList.toggle("fs-on",on);
    if(startBtn)startBtn.lastChild.textContent=on?"Exit Full Screen":"Play in Full Screen";
    if(hudBtn){hudBtn.setAttribute("aria-label",on?"Exit full screen":"Full screen");hudBtn.title=on?"Exit full screen":"Full screen";}
    setTimeout(function(){window.dispatchEvent(new Event("resize"));},60);
    setTimeout(function(){window.dispatchEvent(new Event("resize"));},300);}
  function wire(b){shield(b);b.addEventListener("click",toggle);}

  function init(){
    var play=d.getElementById("playBtn")||d.getElementById("btnPlay");
    if(play&&play.parentNode){
      startBtn=d.createElement("button");startBtn.type="button";startBtn.id="pdFsBtn";startBtn.className="fsb pd-fs-start";
      startBtn.innerHTML=SVG+"<span>Play in Full Screen</span>";wire(startBtn);
      var tip=d.createElement("p");tip.className="pd-fs-tip";tip.innerHTML="iPhone/iPad: Share → <b>Add to Home Screen</b> se full screen mein khelo";
      play.parentNode.insertBefore(tip,play.nextSibling);play.parentNode.insertBefore(startBtn,play.nextSibling);
    }
    hudBtn=d.createElement("button");hudBtn.type="button";hudBtn.id="pdFsHud";hudBtn.setAttribute("aria-label","Full screen");hudBtn.title="Full screen";
    hudBtn.innerHTML=SVG;
    var mute=d.getElementById("muteBtn")||d.getElementById("btnMute"),placed=false;
    if(mute&&mute.parentNode&&getComputedStyle(mute).position==="static"){
      hudBtn.className="fsb "+mute.className;mute.parentNode.insertBefore(hudBtn,mute);placed=true;
      // a crowded top bar that would now spill off-screen gets the corner icon instead
      var row=mute.parentNode,kids=row.children,i,r;
      for(i=0;i<kids.length;i++){r=kids[i].getBoundingClientRect();if(r.width&&r.right>innerWidth+1){placed=false;break;}}
      if(!placed)row.removeChild(hudBtn);
    }
    if(!placed){hudBtn.className="fsb pd-fs-fix";d.body.appendChild(hudBtn);}
    wire(hudBtn);
    d.addEventListener("fullscreenchange",sync);d.addEventListener("webkitfullscreenchange",sync);
  }
  if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",init);else init();
})();
