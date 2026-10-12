if('scrollRestoration' in history)history.scrollRestoration='manual';addEventListener('pageshow',function(){if(!location.hash)scrollTo(0,0)});
(function(){
var d=document,root=d.documentElement,paused=false;
var hv=d.getElementById('heroVid'),pay=d.querySelector('.payoff'),PAY=5.75;
function land(){if(!pay.classList.contains('on')&&window.__ekgBig)__ekgBig();pay.classList.add('on')}
hv.addEventListener('timeupdate',function(){if(hv.currentTime>=PAY)land()});
setTimeout(land,9000);
function tryPlay(v){var p=v.play();if(p&&p.catch)p.catch(function(){})}
tryPlay(hv);
d.addEventListener('pointerdown',function(){if(!paused)tryPlay(hv)},{once:true});
// lazy play on screen
var lz=[].slice.call(d.querySelectorAll('video.lazyplay'));
var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting&&!paused){if(!v.src&&v.dataset.src){v.preload='auto';v.src=v.dataset.src}tryPlay(v)}else v.pause()})},{threshold:.15});
lz.forEach(function(v){io.observe(v)});
var hio=new IntersectionObserver(function(es){es.forEach(function(e){if(paused)return;e.isIntersecting?tryPlay(hv):hv.pause()})},{threshold:0});hio.observe(hv);
// reveals
var rvs=[].slice.call(d.querySelectorAll('.lede,.creed-body p,.proof-head>*,.proof-film,.stats li,.svc-head>*,.culture-type>*,.reel,.talk-type>*,.form,.foot>*'));
rvs.forEach(function(el){el.classList.add('rv')});
var rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting||e.boundingClientRect.top<0){e.target.classList.add('in');rio.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
rvs.forEach(function(el,i){el.style.transitionDelay=(el.parentNode.children.length>1?([].indexOf.call(el.parentNode.children,el)%4)*0.09:0)+'s';rio.observe(el)});
// count up
var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;cio.unobserve(e.target);var el=e.target,n=+el.dataset.count,pre=el.dataset.prefix||'',t0=null,D=1600;
 if(paused){return}
 function f(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/D);k=1-Math.pow(1-k,4);el.textContent=pre+Math.round(n*k).toLocaleString('en-US');if(k<1)requestAnimationFrame(f)}requestAnimationFrame(f)})},{threshold:.6});
d.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el)});
// failsafe: bottom shows all
var SH=0;if(window.ResizeObserver)new ResizeObserver(function(){SH=0}).observe(d.body);window.addEventListener('scroll',function(){if(!SH)SH=d.body.scrollHeight;if(innerHeight+scrollY>=SH-40){rvs.forEach(function(el){el.classList.add('in')});land();if(window.__pulseAll)__pulseAll();if(window.__divAll)__divAll();if(window.__introDone)__introDone()}},{passive:true});

var lenis=null;
if(false&&window.Lenis){lenis=new Lenis({lerp:.12,wheelMultiplier:.55,touchMultiplier:1,smoothWheel:true});}
if(window.gsap&&window.ScrollTrigger){
 gsap.registerPlugin(ScrollTrigger);
 if(lenis){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0)}
 var mm=gsap.matchMedia();
 mm.add('(min-width:901px)',function(){
  // hero: words part, film steps forward
  var tl=gsap.timeline({scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.15}});
  tl.fromTo('.hero-film video',{scale:1},{scale:1.08,ease:'none'},0);
 });
 // creed: words start apart, lock into the line
 var cws=gsap.utils.toArray('.cw');var small=matchMedia('(max-width:900px)').matches;
 var offs=[[-18,40],[22,-30],[-10,60],[16,-50]];
 gsap.fromTo(cws,{yPercent:30,opacity:0},{yPercent:0,opacity:1,stagger:.14,duration:.9,ease:'power3.out',scrollTrigger:{trigger:'.creed',start:'top 72%'}});

 // signature: the pulse draws with scroll, each beat lands a rep result
 var pl=d.querySelector('.pl'),bl=[].slice.call(d.querySelectorAll('.beats li')),L=pl.getTotalLength(),marks=[270,612,944,1300].map(function(X){var lo=0,hi=L;for(var k=0;k<24;k++){var mid=(lo+hi)/2;pl.getPointAtLength(mid).x<X?lo=mid:hi=mid}return lo/L});
 pl.style.strokeDasharray=L;pl.style.strokeDashoffset=L;
 var MX=[270,612,944,1300];pl.style.strokeDasharray='none';pl.style.strokeDashoffset='0';function setP(p){var x=340+(1600-340)*Math.max(0,Math.min(1,p));pl.style.clipPath='inset(-60% '+Math.max(0,100-x/16).toFixed(2)+'% -60% 0)';bl.forEach(function(li,i){li.classList.toggle('on',x>=MX[i]+8)})}setP(0);
 window.__pulseAll=function(){setP(1)};
 mm.add('(min-width:901px)',function(){ScrollTrigger.create({trigger:'.pulse',start:'top top',end:'+=40%',pin:'.pulse-pin',scrub:.15,onUpdate:function(s){if(!paused)setP(s.progress)},onLeave:function(){setP(1)}})});
 mm.add('(max-width:900px)',function(){ScrollTrigger.create({trigger:'.pulse-chart',start:'top 85%',end:'bottom 45%',scrub:.4,onUpdate:function(s){if(!paused)setP(s.progress)},onLeave:function(){setP(1)}})});
 // hero: framed reel grows to full screen
 (function(){var hf=d.querySelector('.hero .hero-film'),small=matchMedia('(max-width:900px)').matches,A=small?[12,6,34,8]:[16,20,22,10];
  function setH(p){p=1;var k=Math.min(1,p/.62);k=1-Math.pow(1-k,3);hf.style.setProperty('--it',(A[0]*(1-k))+'%');hf.style.setProperty('--is',(A[1]*(1-k))+'%');hf.style.setProperty('--ib',(A[2]*(1-k))+'%');hf.style.setProperty('--ir',(A[3]*(1-k))+'px')}
  setH(0);ScrollTrigger.create({trigger:'.hero',start:'top top',end:'bottom bottom',onUpdate:function(s){setH(paused?1:s.progress)}});window.__heroFull=function(){setH(1)};})();
 if(lenis)lenis.on('scroll',function(e){if(window.__ekgKick&&!paused)__ekgKick(e.velocity)});
 // background + text colour blend between sections
 if(0)d.querySelectorAll('[data-bg]').forEach(function(s){
  ScrollTrigger.create({trigger:s,start:'top 62%',end:'bottom 62%',onToggle:function(st){if(st.isActive){gsap.to(bg,{backgroundColor:s.dataset.bg,duration:1.1,ease:'power2.inOut',overwrite:true});gsap.to(d.body,{color:s.dataset.fg,duration:1.1,ease:'power2.inOut',overwrite:true});root.style.setProperty('--fg',s.dataset.fg);root.style.setProperty('--barbg',s.dataset.bg);d.body.classList.toggle('on-red',s.dataset.bg=='#cf2d20');d.body.classList.toggle('on-paper',s.dataset.bg=='#f3f1ec')}}});
 });
 ScrollTrigger.refresh();
} else {root.classList.add('no-anim')}
// phone: services light up as they cross the middle
if(matchMedia('(hover:none)').matches){var cio2=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('lit',e.isIntersecting)})},{rootMargin:'-42% 0px -42% 0px'});d.querySelectorAll('.card').forEach(function(c){cio2.observe(c)})}

// ===== r6 hero: the heartbeat draws on black, its trace opens into the film, words light on the beats =====
(function(){
 var cv=d.getElementById('ekg');if(!cv)return;var cx=cv.getContext('2d'),W,H,Y,dpr=Math.min(2,devicePixelRatio||1),px=-1e4,pv=0,lastX=null,big=0,on=true;
 var hf=d.querySelector('.hero .hero-film'),words=[].slice.call(d.querySelectorAll('.hero .hl .w')),hero=d.querySelector('.hero');
 var T0=performance.now(),DRAW=.45,OPEN=.6,BEAT0=DRAW+OPEN,per=1,opened=false,lit=0,acc=0,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
 hero.classList.add('intro-on');
 var PW=null;function panelW(){if(PW!==null)return PW;if(innerWidth<=900){cv.style.clipPath='none';return PW=W}var r=cv.getBoundingClientRect(),f=hf.getBoundingClientRect(),w=Math.max(0,Math.min(W,f.left-r.left));cv.style.clipPath='inset(0 '+(W-w)+'px 0 0)';return PW=w}
 function size(){PW=null;var r=cv.getBoundingClientRect(),hr=d.querySelector('.hero .hero-type').getBoundingClientRect(),lr=d.querySelector('.hero .lede').getBoundingClientRect(),tk=d.querySelector('.ticker'),tr=tk?tk.getBoundingClientRect():null,f=hf.getBoundingClientRect();W=r.width;H=r.height;var y=Math.max(H*.28,hr.top-r.top-46);if(innerWidth<=900){var tt=tr?tr.top-r.top:H;y=Math.round((lr.bottom-r.top+tt)/2+8)}Y=y;PW=innerWidth<=900?W:Math.max(0,Math.min(W,f.left-r.left));var nw=Math.round(W*dpr),nh=Math.round(H*dpr);if(cv.width!==nw||cv.height!==nh){cv.width=nw;cv.height=nh}cx.setTransform(dpr,0,0,dpr,0,0);cv.style.clipPath=innerWidth<=900?'none':'inset(0 '+(W-PW)+'px 0 0)'}
 size();var rsT;addEventListener('resize',function(){cancelAnimationFrame(rsT);rsT=requestAnimationFrame(size)});addEventListener('load',function(){requestAnimationFrame(size)});if(d.fonts&&d.fonts.ready)d.fonts.ready.then(function(){requestAnimationFrame(size)});
 function qrs(u){if(u<-1||u>1)return 0;return u<-.55?-.12*Math.sin((u+1)/.45*Math.PI):u<-.15?0:u<-.05?.25*((u+.15)/.1):u<.05?-1*(1-Math.abs(u)/.05):u<.13?.55*(1-(u-.05)/.08):u<.4?0:-.22*Math.sin((u-.4)/.6*Math.PI)}
 var hs=d.querySelector('.hero-stage');
 var COARSE=matchMedia('(hover:none),(pointer:coarse)').matches;
 hs.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;var r=cv.getBoundingClientRect(),x=e.clientX-r.left;if(lastX!=null)pv=Math.min(1,pv+Math.abs(x-lastX)/120);lastX=x;px=x});
 hs.addEventListener('pointerleave',function(){lastX=null});
 hs.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;var r=cv.getBoundingClientRect();px=e.clientX-r.left;pv=1});
 window.__ekgBig=function(){big=1};
 window.__ekgKick=function(v){pv=Math.min(1.4,Math.max(pv,Math.abs(v)/40));if(px<0||px>W)px=W*.5};
 function clip(k){k=.4+.6*k;hf.style.clipPath=k>=1?'none':'inset('+(50*(1-k))+'% 0 '+(50*(1-k))+'% 0)'}
 function finish(){if(opened)return;opened=true;clip(1);hero.classList.remove('intro-on');words.forEach(function(w){if(!w.classList.contains('payoff'))w.classList.add('lit')});try{hv.currentTime=0;tryPlay(hv)}catch(e){}}
 window.__introDone=function(){finish();words.forEach(function(w){w.classList.add('lit')})};
 clip(0);setTimeout(finish,6000);
 var io=new IntersectionObserver(function(es){on=es[0].isIntersecting});io.observe(hs);
 function ease(k){return k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2}
 var lastOp=-1;function frame(now){requestAnimationFrame(frame);if(!on){window.__lt=now;return}
  var ly2=(Y||0)-(window.scrollY||0)-(innerWidth<=900?40:140),op=Math.max(0,Math.min(1,(ly2-90)/80));op=Math.round(op*20)/20;if(op!==lastOp){lastOp=op;cv.style.opacity=op}
  var steady=false,env=1,Wl=panelW(),t=(now-T0)/1000,amp=innerWidth<=900?30:Math.min(120,H*.14),bw=Math.min(180,W*.13),yl,head,drawTo=Wl,introAmp=0;
  if(paused&&!opened)finish();
  if(t<DRAW&&!opened){var k=t/DRAW;drawTo=Wl*ease(k);head=Wl*.56;yl=H/2;introAmp=1.6;clip(0)}
  else if(t<BEAT0&&!opened){var k2=ease((t-DRAW)/OPEN);clip(k2);yl=H/2+(Y-H/2)*k2;head=Wl*.56;introAmp=1.6*(1-k2)}
  else{if(!opened){finish();T0=now-BEAT0*1000;t=BEAT0}
   yl=Y;var dt=Math.min(.05,(now-(window.__lt||now))/1000),rate=1+Math.min(.3,pv*.3);acc+=dt*rate;var bt=acc,ph=(bt%per)/per;steady=true;head=paused?Wl*.6:((acc*Math.max(90,Wl/7))%(Wl+400))-200;env=paused?1:.18+.82*Math.exp(-ph/.16);
   var n=Math.floor(bt/per);if(!paused&&lit<2&&n>=lit&&ph>.35){words[lit]&&words[lit].classList.add('lit');lit++}}
  pv*=.94;big*=.97;cx.clearRect(0,0,W,H);
  if(steady){if(!(Wl>2)||!(W>2)||!isFinite(acc)){window.__lt=now;return}var sp=Math.min(240,Math.max(120,Wl/4)),bw2=Math.min(bw,sp*.42),sx=(acc*sp)%Wl,still=paused;
   function yt(tau){var u=(((tau%1)+1)%1-.5)*sp/bw2;return yl+qrs(u)*amp*.9}
   cx.lineWidth=innerWidth<=900?3.5:3;cx.lineJoin='round';cx.lineCap='round';if(innerWidth<=900){cx.shadowColor='rgba(0,0,0,.7)';cx.shadowBlur=6}
   var T1=acc,T0s=still?acc-2:Math.max(0,acc-2),N=Math.ceil((T1-T0s)*sp/2),seg=8,px0=null;
   for(var k=0;k<N;k+=seg){cx.beginPath();var started=false;for(var q=k;q<=Math.min(N,k+seg);q++){var tau=T0s+(T1-T0s)*q/N,x=((tau*sp)%Wl+Wl)%Wl,y=yt(tau);if(started&&x<px0){cx.stroke();cx.beginPath();started=false}started?cx.lineTo(x,y):cx.moveTo(x,y);started=true;px0=x}
    var age=(T1-(T0s+(T1-T0s)*k/N))/2;cx.strokeStyle='rgba(207,45,32,'+(1-.7*age).toFixed(3)+')';cx.stroke()}
   cx.shadowBlur=0;if(innerWidth>900&&isFinite(yl)){cx.fillStyle='#cf2d20';cx.fillRect(Wl-2,yl-9,2,18)}if(!COARSE&&!still&&isFinite(sx)&&isFinite(yt(acc))){var gy=yt(acc);var gr=cx.createRadialGradient(sx,gy,0,sx,gy,14);gr.addColorStop(0,'rgba(255,190,170,.95)');gr.addColorStop(.35,'rgba(255,80,60,.6)');gr.addColorStop(1,'rgba(207,45,32,0)');cx.fillStyle=gr;cx.beginPath();cx.arc(sx,gy,14,0,7);cx.fill();cx.fillStyle='#fff3ee';cx.beginPath();cx.arc(sx,gy,3,0,7);cx.fill()}
   window.__ekgState={sx:sx,beats:Math.round(acc)-Math.round(Math.max(0,acc-2)),acc:acc};
   window.__lt=now;return}cx.lineWidth=3;cx.lineJoin='round';cx.lineCap='round';cx.beginPath();
  for(var x=0;x<=Math.min(drawTo,Wl);x+=2){var a=introAmp?introAmp:(1+big*1.4);var y=qrs((x-head)/bw)*amp*a*env+qrs((x-px)/(bw*.7))*amp*1.3*pv;x?cx.lineTo(x,yl+y):cx.moveTo(x,yl+y)}
  if(introAmp||paused){cx.strokeStyle='#cf2d20'}else{cx.strokeStyle='#cf2d20'}
  cx.stroke();window.__lt=now;
 }
 requestAnimationFrame(frame);
})();
// spine: the heartbeat carries down the page as you scroll, beating at each section
(function(){var sv=d.getElementById('spine');if(!sv)return;var pb=sv.querySelector('.spine-b'),pp=sv.querySelector('.spine-p'),L=1;
 function addB(p){var o='',last=0;p.replace(/^M12 0/,'').split(/(?=V)/).forEach(function(seg){var m=seg.match(/^V(\d+)(.*)$/);if(!m){o+=seg;return}var v=+m[1];for(var y=last+46;y<v-30;y+=46)o+='V'+y+'L12 '+(y+3)+' 8 '+(y+6)+' 16 '+(y+10)+' 12 '+(y+13);o+='V'+v+m[2];var t=m[2].match(/(\d+)$/);last=t?+t[1]:v});return 'M12 0'+o}
 function build(){DH=0;var pts='M12 0V1000';pb.setAttribute('d',pts);pp.setAttribute('d',pts);L=pp.getTotalLength();pp.style.strokeDasharray=L;upd()}
 var DH=0;function upd(){var y=scrollY;if(!DH)DH=d.documentElement.scrollHeight;var max=DH-innerHeight,p=max>0?(y+innerHeight*.5)/(max+innerHeight):0;pp.style.strokeDashoffset=L*(1-Math.min(1,p));sv.classList.toggle('on',y>innerHeight*.6);var k=sv.querySelector('.spine-k');if(k)k.setAttribute('transform','translate(0 '+Math.max(0,Math.min(966,1000*Math.min(1,p)-34))+')')}
 addEventListener('scroll',upd,{passive:true});addEventListener('resize',build);addEventListener('load',function(){setTimeout(build,300)});setTimeout(build,1500);build();
})();
// close: headline lights on beats; fields draw a heartbeat when focused
(function(){var bws=[].slice.call(d.querySelectorAll('.talk-hl .bw, .talk-hl span:last-child'));var io=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;io.disconnect();bws.forEach(function(w,i){setTimeout(function(){w.classList.add('lit')},paused?0:i*520)})},{threshold:.4});var th=d.querySelector('.talk-hl');if(th)io.observe(th);
 d.querySelectorAll('.talk-card label').forEach(function(l){l.insertAdjacentHTML('beforeend','<svg class="f-ecg" viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 28H150L160 28 168 10 178 30 188 2 198 26 206 28H400"/></svg>')});})();
// dividers draw as they enter
(function(){var ps=[].slice.call(d.querySelectorAll('.ekg-div path'));ps.forEach(function(p){var L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;p.style.transition='stroke-dashoffset 3.2s cubic-bezier(.45,0,.25,1)'});
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.style.strokeDashoffset=0;io.unobserve(e.target)}})},{rootMargin:'0px 0px -12% 0px'});ps.forEach(function(p){io.observe(p)});
 window.__divAll=function(){ps.forEach(function(p){p.style.strokeDashoffset=0})};})();
// accordion
d.querySelectorAll('.acc-b').forEach(function(b){b.addEventListener('click',function(){var li=b.parentNode,o=!li.classList.contains('open');d.querySelectorAll('.acc-i').forEach(function(x){x.classList.remove('open');x.firstChild.setAttribute('aria-expanded','false')});if(o){li.classList.add('open');b.setAttribute('aria-expanded','true')}SH=0})});
// results strip: mouse drag (touch keeps native swipe)
(function(){var tr=d.querySelector('.cases-track');if(!tr)return;var down=false,sx=0,sl=0,moved=0,vx=0,lx=0,raf;
 tr.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=0;sx=lx=e.clientX;sl=tr.scrollLeft;tr.classList.add('dragging');cancelAnimationFrame(raf);tr.setPointerCapture(e.pointerId);e.preventDefault()});
 tr.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));vx=e.clientX-lx;lx=e.clientX;tr.scrollLeft=sl-dx});
 function up(){if(!down)return;down=false;tr.classList.remove('dragging');(function glide(){vx*=.92;tr.scrollLeft-=vx;if(Math.abs(vx)>.5)raf=requestAnimationFrame(glide)})()}
 tr.addEventListener('pointerup',up);tr.addEventListener('pointercancel',up);
 tr.addEventListener('click',function(e){if(moved>6){e.preventDefault();e.stopPropagation()}},true);
 tr.addEventListener('dragstart',function(e){e.preventDefault()});
})();
// header: hide on scroll down, return on scroll up
var bar=d.querySelector('.bar'),ly=0;
var secs=[].slice.call(d.querySelectorAll('[data-bg]')),cur=null;
function paint(s){if(!s||s===cur)return;cur=s;var bg=s.dataset.bg,fg=s.dataset.fg;bar.style.setProperty('--hb',bg);bar.style.setProperty('--hf',fg);bar.classList.toggle('on-light',bg=='#f3f1ec');bar.classList.toggle('on-red',bg=='#cf2d20');d.body.classList.toggle('on-red',bg=='#cf2d20');d.body.classList.toggle('on-paper',bg=='#f3f1ec');root.style.setProperty('--fg',fg)}
var hIO=null,vis=new Map();function mkIO(){if(hIO)hIO.disconnect();var line=40;hIO=new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?vis.set(e.target,1):vis.delete(e.target)});var pick=null;secs.forEach(function(s){if(vis.has(s))pick=s});paint(pick)},{rootMargin:(-line)+'px 0px '+(-(innerHeight-line-1))+'px 0px'});secs.forEach(function(s){hIO.observe(s)})}
mkIO();var rzT;addEventListener('resize',function(){clearTimeout(rzT);rzT=setTimeout(mkIO,200)});
function onS(y){if(y>8)bar.classList.add('solid');else bar.classList.remove('hide','solid');ly=y}
if(lenis)lenis.on('scroll',function(e){onS(e.scroll)});else addEventListener('scroll',function(){onS(scrollY)},{passive:true});
// back to top
d.querySelectorAll('a[href="#top"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();if(lenis)lenis.scrollTo(0,{duration:1.8,easing:function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}});else scrollTo({top:0,behavior:'smooth'})})});
d.querySelectorAll('a[href="#talk"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var t=d.getElementById('talk');if(lenis){lenis.start();lenis.scrollTo(t,{duration:1.6})}else t.scrollIntoView({behavior:'smooth'})})});

// pause
var pb=d.getElementById('pause');
pb.addEventListener('click',function(){paused=!paused;root.classList.toggle('paused',paused);pb.querySelector('.pz-t').textContent=paused?'Play':'Pause';pb.setAttribute('aria-label',paused?'Play motion':'Pause motion');pb.setAttribute('aria-pressed',paused);
 var vs=d.querySelectorAll('video');
 if(paused){vs.forEach(function(v){v.pause()});land();d.querySelectorAll('[data-count]').forEach(function(el){el.textContent=(el.dataset.prefix||'')+(+el.dataset.count).toLocaleString('en-US')});if(lenis)lenis.stop();if(window.gsap)gsap.set('.cw',{xPercent:0,yPercent:0,opacity:1});if(window.__pulseAll)__pulseAll();if(window.__divAll)__divAll();if(window.__heroFull)__heroFull();if(window.__introDone)__introDone();d.querySelectorAll('.talk-hl .bw,.talk-hl span:last-child').forEach(function(w){w.classList.add('lit')})}
 else{tryPlay(hv);lz.forEach(function(v){var r=v.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)tryPlay(v)});if(lenis)lenis.start()}
});

var mp=d.querySelector('.menu-pause');if(mp){mp.addEventListener('click',function(){pb.click();mp.textContent=paused?'Play Motion':'Pause Motion';mp.setAttribute('aria-pressed',paused)})}
// enquiry
var f=d.getElementById('enq');
f.addEventListener('submit',function(e){e.preventDefault();var ok=true;['name','company','email'].forEach(function(n){var i=f.elements[n];var bad=!i.value.trim()||(n=='email'&&!/^\S+@\S+\.\S+$/.test(i.value));i.classList.toggle('bad',bad);if(bad&&ok){i.focus();ok=false}});if(!ok)return;
 var b='Name: '+f.elements['name'].value+'\nCompany: '+f.elements.company.value+'\nWork Email: '+f.elements.email.value+'\nPhone: '+f.elements.phone.value+'\n\n'+f.elements.msg.value;
 location.href='mailto:careers@truheartconsultinginc.com?subject='+encodeURIComponent('Enquiry From '+f.elements.company.value)+'&body='+encodeURIComponent(b);f.classList.add('sent');var ok2=f.querySelector('.form-ok');ok2.hidden=false;ok2.focus&&ok2.setAttribute('tabindex','-1');ok2.focus()});
f.querySelector('.form-again').addEventListener('click',function(){f.reset();f.classList.remove('sent');f.querySelector('.form-ok').hidden=true});
})();

(function(){var p=document.getElementById('wpath'),ol=document.querySelector('.wpts');if(!p||!ol)return;
var li=[].slice.call(ol.children),n=li.length,dd='';li.forEach(function(l,i){var v=parseFloat(l.style.getPropertyValue('--v'));var x=n>1?i/(n-1)*1000:0,y=380-v*340;dd+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)});p.setAttribute('d',dd);
var sv=p.parentNode;
var io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){sv.classList.add('on');ol.classList.add('on');io.disconnect()}})},{threshold:.12});io.observe(ol)})();

(function(){var tr=document.querySelector('.cases-track');if(!tr)return;document.querySelectorAll('.rail-b').forEach(function(b){b.addEventListener('click',function(){var c=tr.querySelector('.case');var w=c?c.getBoundingClientRect().width+24:400;tr.scrollBy({left:w*(+b.dataset.dir),behavior:'smooth'})})})})();
