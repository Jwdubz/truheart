(() => {
  "use strict";
  const root = document.documentElement;
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const worlds = [...document.querySelectorAll("[data-world]")];
  const portrait = matchMedia("(orientation: portrait)");
  const compact = matchMedia("(max-width:359px), (max-height:650px)");
  const mobileNav = matchMedia("(max-width:900px)");
  const playbackKey = "truheart-playback";
  function storedPlayback() {
    try { const value=JSON.parse(sessionStorage.getItem(playbackKey) || "{}");return value&&typeof value==="object"?value:{}; }
    catch { return {}; }
  }
  const saved = storedPlayback();
  const quietControl = document.querySelector("[data-quiet]");
  const requestedMotion = new URLSearchParams(location.search).get("motion");
  const explicitQuiet = ["quiet", "off"].includes(requestedMotion);
  let quiet = explicitQuiet || saved.quiet === true;
  const control = document.querySelector("[data-film-btn]");
  const filmControls = document.querySelector(".film-controls");
  const main = document.querySelector("main");
  const mast = document.querySelector("[data-mast]");
  const menu = document.querySelector("[data-menu]");
  const nav = document.querySelector("#site-nav");
  const clipState = new WeakMap();
  const clamp = x => Math.min(1, Math.max(0, x));
  const ease = x => {x=clamp(x);return x*x*(3-2*x);};
  let active = -1, userPaused = explicitQuiet || saved.paused === true || quiet, tick = 0;
  let pendingFocus = null;
  let layout = [];
  root.classList.add("has-cinema");
  root.dataset.motion = quiet ? "quiet" : "full";
  function rememberPlayback() {
    try { sessionStorage.setItem(playbackKey, JSON.stringify({paused:userPaused, quiet})); }
    catch { /* The controls still work when session storage is unavailable. */ }
  }
  if (explicitQuiet) rememberPlayback();
  function pauseAll() { for (const world of worlds) world.querySelector("video").pause(); }

  const stateFor = video => {
    if (!clipState.has(video)) clipState.set(video,{failed:false,loaded:false,ended:false,token:0,timer:0});
    return clipState.get(video);
  };
  const videoFor = index => worlds[index]?.querySelector("video");
  const choose = video => ({
    source:portrait.matches?video.dataset.portrait:video.dataset.landscape,
    poster:portrait.matches?video.dataset.posterPortrait:video.dataset.posterLandscape
  });
  function syncControl() {
    const video = videoFor(active);
    if (!video || !control) return;
    const state = stateFor(video);
    control.hidden = false;
    const end = video.ended || state.ended;
    control.textContent = state.failed ? "Play" : end ? "Replay" : video.paused ? "Play" : "Pause";
    control.dataset.state = end ? "ended" : video.paused ? "paused" : "playing";
    control.setAttribute("aria-label",control.textContent+" Films");
  }
  function loadVideo(video, carry=0) {
    const state=stateFor(video);
    const selected=choose(video);
    video.poster=selected.poster;
    video.muted=true;
    if (video.getAttribute("src")===selected.source) return;
    state.token++;
    const token=state.token;
    video.src=selected.source;
    video.preload="metadata";
    state.loaded=true;
    state.failed=false;
    video.load();
    video.addEventListener("loadedmetadata",()=>{
      if(token!==state.token)return;
      if(carry>0 && Number.isFinite(video.duration))video.currentTime=Math.min(carry,video.duration);
    },{once:true});
  }
  function play(video) {
    if(!video || userPaused || document.hidden)return;
    const state=stateFor(video);
    if(state.ended || video.ended){syncControl();return;}
    loadVideo(video);
    clearTimeout(state.timer);
    state.timer=setTimeout(()=>{
      if(video===videoFor(active)&&video.readyState<2){state.failed=true;video.pause();syncControl();}
    },6000);
    video.play().then(()=>{
      clearTimeout(state.timer);state.failed=false;
      if(video!==videoFor(active)||userPaused||document.hidden)video.pause();
      syncControl();
    }).catch(()=>{clearTimeout(state.timer);state.failed=true;syncControl();});
  }
  for(const world of worlds) {
    const video=world.querySelector("video");
    video.loop=!world.hasAttribute("data-frozen");
    const state=stateFor(video);
    video.poster=choose(video).poster;
    video.addEventListener("ended",()=>{
      state.ended=true;
      if(world.dataset.world==="opening")root.classList.add("opening-complete");
      if(video===videoFor(active))syncControl();
    });
    video.addEventListener("play",()=>video===videoFor(active)&&syncControl());
    video.addEventListener("pause",()=>video===videoFor(active)&&syncControl());
    video.addEventListener("error",()=>{state.failed=true;if(video===videoFor(active))syncControl();});
  }
  function activate(index) {
    if(index===active)return;
    const old=videoFor(active);
    if(old)old.pause();
    active=index;
    const current=videoFor(active);
    if(current){loadVideo(current);play(current);}
    syncControl();
  }
  function measure() {
    root.dataset.layout=compact.matches?"flow":"cinema";
    if(!mobileNav.matches&&mast.classList.contains("is-open"))closeMenu(false);
    nav.inert=mobileNav.matches&&!mast.classList.contains("is-open");
    layout=chapters.map(chapter=>({start:chapter.offsetTop,end:chapter.offsetTop+chapter.offsetHeight}));
    update();
  }
  function update() {
    tick=0;
    const y=window.scrollY, height=innerHeight;
    const flow=compact.matches;
    const bridge=quiet?Math.max(1,height*.1):height*.34;
    let strongest=0, maximum=-1;
    chapters.forEach((chapter,index)=>{
      const bounds=layout[index];
      if(!bounds)return;
      const incoming=index===0?1:ease((y-(bounds.start-bridge))/bridge);
      const outgoing=index===chapters.length-1?0:ease((y-(bounds.end-bridge))/bridge);
      const alpha=incoming*(1-outgoing);
      const textIn=ease((incoming-.65)/.35);
      const textOut=1-ease(outgoing/.35);
      const textAlpha=textIn*textOut;
      const progress=clamp((y-bounds.start)/(bounds.end-bounds.start));
      const scene=chapter.querySelector(".scene");
      const frame=worlds[index];
      // Keep the lower film opaque while the next film fades over it, so the
      // transition does not mix the black stage into both source images.
      frame.style.opacity=String(alpha>0?(outgoing>0?1:incoming):0);
      frame.classList.toggle("is-current",alpha>.002);
      scene.style.opacity=String(flow?1:textAlpha);
      scene.style.setProperty("--enter",String(flow?0:1-textIn));
      scene.classList.toggle("is-active",flow||textAlpha>.01);
      scene.classList.toggle("is-readable",flow||textAlpha>.6);
      scene.inert=!flow&&textAlpha<=.6;
      if(alpha>maximum){maximum=alpha;strongest=index;}
      if(index>0 && !quiet && !flow){
        const shift=(progress-.5)*20;
        scene.style.transform="translate3d(0,"+(-shift)+"px,0)";
      }else scene.style.transform="none";
    });
    activate(strongest);
    root.dataset.scene=chapters[strongest]?.id||"opening";
    if(y>50)root.classList.add("opening-complete");
    if(pendingFocus){
      const scene=pendingFocus.chapter.querySelector(".scene");
      if(!scene.inert&&Number(scene.style.opacity)>.99){
        const target=pendingFocus.element;pendingFocus=null;
        target.focus({preventScroll:true});
      }
    }
  }
  function requestUpdate(){if(!tick)tick=requestAnimationFrame(update);}
  function closeMenu(restore=false){
    const opened=mast.classList.contains("is-open");
    mast.classList.remove("is-open");menu.setAttribute("aria-expanded","false");menu.textContent="Menu";
    nav.inert=mobileNav.matches;
    main.inert=false;filmControls.inert=false;filmControls.hidden=false;
    if(restore&&opened)menu.focus();
  }
  menu.addEventListener("click",()=>{
    const open=!mast.classList.contains("is-open");
    mast.classList.toggle("is-open",open);menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"Close":"Menu";
    nav.inert=!open&&mobileNav.matches;main.inert=open;filmControls.inert=open;filmControls.hidden=open;
    if(open)requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(mast.classList.contains("is-open"))nav.querySelector("a")?.focus();
    }));
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){closeMenu(true);return;}
    if(event.key!=="Tab"||!mast.classList.contains("is-open"))return;
    const items=[...mast.querySelectorAll("a[href],button")];
    const first=items[0],last=items[items.length-1];
    if(event.shiftKey&&(document.activeElement===first||!mast.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!mast.contains(document.activeElement))){event.preventDefault();first.focus();}
  });
  function visitChapter(target,instant=false){
    const element=target.querySelector("h1,h2")||target;
    element.setAttribute("tabindex","-1");
    pendingFocus={chapter:target,element};
    window.scrollTo({top:target.offsetTop,behavior:quiet||instant?"instant":"smooth"});
    requestUpdate();
  }
  document.addEventListener("click",event=>{
    const anchor=event.target.closest('a[href^="#"]');
    if(anchor){
      const target=document.querySelector(anchor.getAttribute("href"));
      if(!target)return;
      event.preventDefault();closeMenu(false);
      history.pushState(null,"",anchor.getAttribute("href"));
      visitChapter(target,event.detail===0);
    }
    if(event.target.closest("#site-nav a"))closeMenu(false);
  });
  control?.addEventListener("click",()=>{
    const video=videoFor(active),state=stateFor(video);
    if(state.failed){state.failed=false;state.ended=false;userPaused=false;video.load();play(video);}
    else if(video.ended||state.ended){state.ended=false;userPaused=false;video.currentTime=0;play(video);}
    else if(video.paused){userPaused=false;play(video);}
    else{userPaused=true;pauseAll();}
    if(!userPaused){quiet=false;root.dataset.motion="full";syncQuiet();requestUpdate();}
    rememberPlayback();
    syncControl();
  });
  for(const toggle of document.querySelectorAll("[data-details]")){
    toggle.addEventListener("click",()=>{
      const detail=document.getElementById(toggle.getAttribute("aria-controls"));
      const expanded=toggle.getAttribute("aria-expanded")==="true";
      toggle.setAttribute("aria-expanded",String(!expanded));detail.hidden=expanded;
      toggle.querySelector("span").textContent=expanded?"+":"−";
      measure();
    });
  }
  portrait.addEventListener("change",()=>{
    const video=videoFor(active);
    if(video){const t=video.currentTime;loadVideo(video,t);if(!userPaused)play(video);}
    measure();
  });
  function syncQuiet(){
    if(!quietControl)return;
    quietControl.textContent=quiet?"Motion On":"Quiet Mode";
    quietControl.setAttribute("aria-pressed",String(quiet));
  }
  quietControl?.addEventListener("click",()=>{
    quiet=!quiet;userPaused=quiet;root.dataset.motion=quiet?"quiet":"full";
    const video=videoFor(active);
    if(quiet)pauseAll();else play(video);
    rememberPlayback();
    syncQuiet();syncControl();requestUpdate();
  });
  syncQuiet();
  addEventListener("scroll",requestUpdate,{passive:true});
  addEventListener("resize",measure);
  document.addEventListener("visibilitychange",()=>{const v=videoFor(active);if(document.hidden)pauseAll();else if(!userPaused)play(v);});
  addEventListener("pagehide",pauseAll);
  addEventListener("pageshow",event=>{
    if(event.persisted){const latest=storedPlayback();quiet=latest.quiet===true;userPaused=latest.paused===true||quiet;root.dataset.motion=quiet?"quiet":"full";syncQuiet();}
    measure();if(userPaused)pauseAll();else play(videoFor(active));
  });
  addEventListener("popstate",()=>{const id=location.hash.slice(1);const target=id?document.getElementById(id):chapters[0];if(target)visitChapter(target,true);});
  document.fonts.ready.then(measure);
  measure();
  if(location.hash){requestAnimationFrame(()=>{const target=document.getElementById(location.hash.slice(1));if(target)scrollTo(0,target.offsetTop);});}
})();
