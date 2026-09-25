/* ─── Toolkit tabs ─── */
const stacks={field:['Hardware diagnostics','Laptop repair','Lenovo systems','Network troubleshooting','Structured cabling','CCTV / NVR','Technical documentation','B2B support','VirtualBox','Packet Tracer','IP networking'],dev:['Java','Python','C#','PHP','HTML & CSS','MySQL','Git & GitHub','VS Code','SDLC','Next.js','JavaScript']};
const skills=document.querySelector('#skills');
const fieldCards=document.getElementById('toolkit-cards-field');
const devCards=document.getElementById('toolkit-cards-dev');
const fieldBottom=document.getElementById('toolkit-bottom-field');
const toolkitSub=document.querySelector('.toolkit-sub');
function showStack(key){skills.replaceChildren(...stacks[key].map(label=>{const el=document.createElement('span');el.textContent=label;return el}));document.querySelectorAll('[data-stack]').forEach(btn=>{const active=btn.dataset.stack===key;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',active)});const isField=key==='field';if(fieldCards)fieldCards.style.display=isField?'':'none';if(devCards)devCards.style.display=isField?'none':'';if(fieldBottom)fieldBottom.style.display=isField?'':'none';if(toolkitSub)toolkitSub.textContent=isField?'Tools, systems, and technologies I work with to solve real-world IT and field engineering problems.':'Languages, frameworks, and tools I use for software development, from building interfaces to deploying real-world applications.'}showStack('field');
document.querySelectorAll('[data-stack]').forEach(btn=>btn.addEventListener('click',()=>showStack(btn.dataset.stack)));

/* ─── Mobile menu ─── */
const menu=document.querySelector('.mobile-menu'),nav=document.querySelector('nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open);menu.textContent=open?'Close −':'Menu +'});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu +';if(a.hash)setActiveNav(a.hash.slice(1))}));

/* ─── Theme toggle ─── */
const themeBtn=document.getElementById('theme-toggle');
const curTheme=document.documentElement.dataset.theme||'dark';
themeBtn.textContent=curTheme==='light'?'☾':'☀';
themeBtn.addEventListener('click',()=>{document.body.classList.add('theme-switching');const next=(document.documentElement.dataset.theme||'dark')==='light'?'dark':'light';document.documentElement.dataset.theme=next;localStorage.setItem('theme',next);themeBtn.textContent=next==='light'?'☾':'☀';themeBtn.setAttribute('aria-label',next==='light'?'Switch to dark mode':'Switch to light mode');setTimeout(()=>document.body.classList.remove('theme-switching'),400)});

/* ─── Active nav scroll-spy ─── */
const sections=Array.from(document.querySelectorAll('main section[id]'));
const navLinks=document.querySelectorAll('nav a');
function setActiveNav(id){navLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+id))}
function updateActiveNav(){
  if(!sections.length)return;
  const scrollY=window.scrollY||window.pageYOffset||0;
  const vh=window.innerHeight;
  const scrollHeight=document.documentElement.scrollHeight;
  const maxScroll=scrollHeight-vh;
  const distFromBottom=maxScroll-scrollY;

  // 1. Bottom of page threshold: always activate Contact (09) at/near bottom
  if(distFromBottom<=70){
    setActiveNav(sections[sections.length-1].id);
    return;
  }

  // 2. Top of page: always activate Overview (01) at top
  if(scrollY<=60){
    setActiveNav(sections[0].id);
    return;
  }

  // 3. Viewport dominance: find the section occupying the primary focus of the viewport
  let bestSection=null,maxScore=-1;
  for(let i=0;i<sections.length;i++){
    const s=sections[i];
    const rect=s.getBoundingClientRect();
    const visTop=Math.max(0,rect.top);
    const visBottom=Math.min(vh,rect.bottom);
    const visHeight=Math.max(0,visBottom-visTop);
    if(visHeight<=0)continue;
    let score=visHeight;
    // When Contact enters prominently into the lower viewport
    if(s.id==='contact'&&rect.top<=vh*0.65){
      score+=vh*0.15;
    }
    if(score>maxScore){
      maxScore=score;
      bestSection=s;
    }
  }
  if(bestSection)setActiveNav(bestSection.id);
}
let navTicking=false;
function onNavScroll(){
  if(!navTicking){
    requestAnimationFrame(()=>{updateActiveNav();navTicking=false});
    navTicking=true;
  }
}
window.addEventListener('scroll',onNavScroll,{passive:true});
window.addEventListener('resize',onNavScroll,{passive:true});
updateActiveNav();

/* ─── Case / credential dialogs ─── */
document.querySelectorAll('[data-case]').forEach(btn=>{
  btn.addEventListener('click',e=>{
    e.preventDefault();
    const map={mec:'case-dialog',triphil:'triphil-dialog',ganap:'ganap-dialog',codex:'codex-dialog',typing:'typing-dialog'};
    const id=map[btn.dataset.case]||'case-dialog';
    document.getElementById(id).showModal();
  });
});
document.querySelectorAll('[data-scroll]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.getElementById(btn.dataset.scroll).scrollIntoView({behavior:'smooth'});
  });
});
document.querySelectorAll('[data-image]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelector('#image-title').textContent=btn.dataset.title;const img=document.querySelector('#credential-image');img.src=btn.dataset.image;img.alt=btn.dataset.title;document.querySelector('#image-dialog').showModal()}));
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});

/* ─── Copy email ─── */
document.querySelector('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('cyperpelina27@gmail.com');document.querySelector('#copy-status').textContent='Email copied. Talk soon!'}catch{document.querySelector('#copy-status').textContent='Copy this address: cyperpelina27@gmail.com'}});

/* ─── Clock ─── */
function tick(){document.querySelector('#clock').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())+' PHT · UTC+8'}tick();setInterval(tick,60000);document.querySelector('#year').textContent=new Date().getFullYear();

/* ─── Scroll-reveal ─── */
const revealObs=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObs.unobserve(entry.target)}})},{threshold:0.08,rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('.section, .hero').forEach(section=>{
  const reveals=section.querySelectorAll('.reveal');
  reveals.forEach((el,i)=>{el.style.transitionDelay=`${i*90}ms`;revealObs.observe(el)});
});
/* Standalone reveals outside sections */
document.querySelectorAll('.reveal').forEach(el=>{if(!el.closest('.section')&&!el.closest('.hero')){revealObs.observe(el)}});
/* Section visibility for heading animations */
const sectionObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:0.1});
document.querySelectorAll('.section').forEach(s=>sectionObs.observe(s));

/* ═══════════════════════════════════════════════
   PROJECT CAROUSEL
   ═══════════════════════════════════════════════ */
(function(){
  const track=document.querySelector('.carousel-track');
  if(!track)return;
  const slides=track.querySelectorAll('.carousel-slide');
  const prevBtn=document.querySelector('.carousel-prev');
  const nextBtn=document.querySelector('.carousel-next');
  const counter=document.querySelector('.carousel-counter');
  const carouselEl=document.querySelector('.carousel');
  const total=slides.length;
  let current=0;
  let animating=false;

  function pad(n){return String(n).padStart(2,'0')}
  function updateCounter(){counter.textContent=pad(current+1)+' / '+pad(total)}

  function goTo(index,direction){
    if(animating||index===current)return;
    animating=true;

    const outSlide=slides[current];
    const inSlide=slides[index];
    const dir=direction||(index>current?'next':'prev');

    /* Phase 1: fade out current */
    outSlide.style.transition='opacity .2s ease, transform .2s ease';
    outSlide.style.opacity='0';
    outSlide.style.transform=dir==='next'?'translateX(-24px)':'translateX(24px)';

    setTimeout(()=>{
      outSlide.classList.remove('active');
      outSlide.style.cssText='';

      /* Phase 2: prep incoming slide */
      inSlide.style.transition='none';
      inSlide.style.opacity='0';
      inSlide.style.transform=dir==='next'?'translateX(24px)':'translateX(-24px)';
      inSlide.classList.add('active');

      /* Force reflow */
      void inSlide.offsetHeight;

      /* Phase 3: animate in */
      inSlide.style.transition='opacity .35s cubic-bezier(.22,1,.36,1), transform .35s cubic-bezier(.22,1,.36,1)';
      inSlide.style.opacity='1';
      inSlide.style.transform='translateX(0)';

      current=index;
      updateCounter();

      setTimeout(()=>{
        inSlide.style.cssText='';
        animating=false;
      },360);
    },210);
  }

  function next(){goTo((current+1)%total,'next')}
  function prev(){goTo((current-1+total)%total,'prev')}

  prevBtn.addEventListener('click',prev);
  nextBtn.addEventListener('click',next);

  /* Keyboard: arrow keys when work section is in view */
  let workInView=false;
  const workObs=new IntersectionObserver(([e])=>{workInView=e.isIntersecting},{threshold:0.15});
  workObs.observe(document.getElementById('work'));

  document.addEventListener('keydown',e=>{
    if(!workInView)return;
    if(e.key==='ArrowRight'){e.preventDefault();next()}
    if(e.key==='ArrowLeft'){e.preventDefault();prev()}
  });

  /* Touch swipe */
  let touchX=0;
  carouselEl.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX},{passive:true});
  carouselEl.addEventListener('touchend',e=>{
    const diff=touchX-e.changedTouches[0].clientX;
    if(Math.abs(diff)>50){diff>0?next():prev()}
  });

  updateCounter();
})();

/* ═══════════════════════════════════════════════
   GITHUB LIVE ACTIVITY (cached)
   ═══════════════════════════════════════════════ */
(function(){
  const GH_USER='cyper11';
  const CACHE_TTL=3600000;
  const LANG_COLORS={JavaScript:'#f1e05a',HTML:'#e34c26',CSS:'#563d7c',Java:'#b07219',Python:'#3572A5',PHP:'#4F5D95','C#':'#178600',TypeScript:'#3178c6',Shell:'#89e051',Kotlin:'#A97BFF',SCSS:'#c6538c',Vue:'#41b883'};
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function cacheGet(k){try{const d=JSON.parse(localStorage.getItem('gh_'+k));if(d&&Date.now()-d.ts<CACHE_TTL)return d.data}catch(e){}return null}
  function cacheSet(k,v){try{localStorage.setItem('gh_'+k,JSON.stringify({ts:Date.now(),data:v}))}catch(e){}}
  async function cFetch(url,k){const c=cacheGet(k);if(c)return c;const r=await fetch(url);if(!r.ok)throw new Error('err');const d=await r.json();cacheSet(k,d);return d}
  let tip=document.createElement('div');tip.className='gh-tip';document.body.appendChild(tip);
  function timeAgo(date){const s=Math.floor((Date.now()-date)/1000);if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';if(s<604800)return Math.floor(s/86400)+'d ago';return date.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
  async function init(){
    const hEl=document.getElementById('gh-heatmap'),mEl=document.getElementById('gh-months'),tEl=document.getElementById('gh-total');
    try{
      const data=await cFetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`,'heatmap');
      const contributions=data.contributions;const total=data.total?data.total.lastYear||Object.values(data.total).reduce((a,b)=>a+b,0):0;
      tEl.innerHTML=`<span class="gh-total-num">${total.toLocaleString()}</span> contributions in the last year`;
      const weeks=[];let cw=[];
      contributions.forEach((c,i)=>{const d=new Date(c.date);if(i===0){for(let p=0;p<d.getDay();p++)cw.push(null)}cw.push(c);if(d.getDay()===6||i===contributions.length-1){weeks.push(cw);cw=[]}});
      let lm=-1;const ml=[];weeks.forEach((w,wi)=>{const f=w.find(d=>d);if(f){const m=new Date(f.date).getMonth();if(m!==lm){ml.push({week:wi,label:MONTHS[m]});lm=m}}});
      mEl.innerHTML=ml.map((m,i)=>{const n=ml[i+1];const s=n?(n.week-m.week)*15:(weeks.length-m.week)*15;return`<span style="width:${s}px">${m.label}</span>`}).join('');
      hEl.innerHTML=weeks.map(w=>{const c=[];for(let d=0;d<7;d++){const e=w[d];if(!e)c.push('<div class="gh-day" data-level="0" style="visibility:hidden"></div>');else c.push(`<div class="gh-day" data-level="${e.level}" data-date="${e.date}" data-count="${e.count}"></div>`)}return`<div class="gh-week">${c.join('')}</div>`}).join('');
      hEl.addEventListener('mouseover',e=>{const day=e.target.closest('.gh-day');if(!day||!day.dataset.date)return;tip.innerHTML=`<strong>${day.dataset.count}</strong> contribution${day.dataset.count!=='1'?'s':''} on ${new Date(day.dataset.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;tip.classList.add('show')});
      hEl.addEventListener('mousemove',e=>{tip.style.left=e.clientX+12+'px';tip.style.top=e.clientY-36+'px'});
      hEl.addEventListener('mouseout',e=>{if(e.target.closest('.gh-day'))tip.classList.remove('show')});
    }catch(e){hEl.innerHTML='<div class="gh-error">Could not load contributions</div>'}
    try{
      const allRepos=await cFetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=100`,'repos');
      const rEl=document.getElementById('gh-repos');
      const repos=allRepos.filter(r=>!r.fork).sort((a,b)=>new Date(b.pushed_at)-new Date(a.pushed_at)).slice(0,5);
      if(!repos.length){rEl.innerHTML='<div class="gh-placeholder">No public repositories</div>'}
      else{rEl.innerHTML=repos.map(r=>{const l=r.language||'';const cl=LANG_COLORS[l]||'var(--muted)';const desc=r.description?`<span class="gh-repo-desc">${r.description}</span>`:'';const u=new Date(r.pushed_at).toLocaleDateString('en-US',{month:'short',day:'numeric'});return`<a href="${r.html_url}" target="_blank" rel="noreferrer" class="gh-repo"><div class="gh-repo-info"><span class="gh-repo-name">${r.name}</span>${desc}</div><div class="gh-repo-meta">${l?`<span class="gh-repo-lang" style="--lang-color:${cl}">${l}</span>`:''}<span>${u}</span><span class="gh-repo-arrow">↗</span></div></a>`}).join('')}
      try{
        let lb=cacheGet('langs');
        if(!lb){const lp=repos.slice(0,5).map(r=>fetch(r.languages_url).then(r=>r.json()).catch(()=>({})));const ld=await Promise.all(lp);lb={};ld.forEach(d=>{Object.entries(d).forEach(([l,b])=>{lb[l]=(lb[l]||0)+b})});cacheSet('langs',lb)}
        const lEl=document.getElementById('gh-langs');const sorted=Object.entries(lb).sort((a,b)=>b[1]-a[1]);const tb=sorted.reduce((s,l)=>s+l[1],0);
        if(sorted.length){const bar=sorted.map(([l,b])=>{const p=(b/tb*100).toFixed(1);return`<div class="gh-lang-seg" style="width:${p}%;background:${LANG_COLORS[l]||'#555'}" title="${l} ${p}%"></div>`}).join('');const leg=sorted.slice(0,6).map(([l,b])=>`<span class="gh-lang-item" style="--lang-color:${LANG_COLORS[l]||'#555'}">${l} <span style="opacity:.5">${(b/tb*100).toFixed(1)}%</span></span>`).join('');lEl.innerHTML=`<div class="gh-lang-bar">${bar}</div><div class="gh-lang-list">${leg}</div>`}
      }catch(e){document.getElementById('gh-langs').innerHTML='<div class="gh-error">—</div>'}
    }catch(e){document.getElementById('gh-repos').innerHTML='<div class="gh-error">Could not load repositories — <a href="https://github.com/cyper11" target="_blank" style="color:var(--lime)">view on GitHub ↗</a></div>';document.getElementById('gh-langs').innerHTML='<div class="gh-error">—</div>'}
    try{
      const evts=await cFetch(`https://api.github.com/users/${GH_USER}/events/public?per_page=30`,'events');
      const eEl=document.getElementById('gh-events');const pe=evts.filter(e=>e.type==='PushEvent').slice(0,5);
      if(!pe.length){eEl.innerHTML='<div class="gh-placeholder">No recent activity</div>'}
      else{eEl.innerHTML=pe.map(e=>{const repo=e.repo.name.replace(GH_USER+'/','');const msg=e.payload.commits&&e.payload.commits.length?e.payload.commits[e.payload.commits.length-1].message.split('\n')[0]:'';return`<div class="gh-event"><span class="gh-event-time">${timeAgo(new Date(e.created_at))}</span><span class="gh-event-repo">${repo}</span><span class="gh-event-msg">${msg}</span></div>`}).join('')}
    }catch(e){document.getElementById('gh-events').innerHTML='<div class="gh-error">Could not load activity</div>'}
  }
  const st=document.createElement('style');st.textContent='.gh-repo-lang::before{background:var(--lang-color,var(--muted))}.gh-lang-item::before{background:var(--lang-color,var(--muted))}';document.head.appendChild(st);
  init();
})();

/* ═══════════════════════════════════════════════
   CURSOR GLOW (desktop only, subtle)
   ═══════════════════════════════════════════════ */
(function(){
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  if(window.matchMedia('(max-width:850px)').matches)return;

  const targets=document.querySelectorAll('.hero, .lab-card, .contact-panel');
  targets.forEach(el=>{
    el.classList.add('cursor-glow-target');
    const glow=document.createElement('div');
    glow.className='cursor-glow';
    el.appendChild(glow);
  });

  let glowTicking=false;
  document.addEventListener('mousemove',e=>{
    if(glowTicking)return;
    glowTicking=true;
    requestAnimationFrame(()=>{
      targets.forEach(el=>{
        const rect=el.getBoundingClientRect();
        const x=e.clientX-rect.left;
        const y=e.clientY-rect.top;
        el.style.setProperty('--glow-x',x+'px');
        el.style.setProperty('--glow-y',y+'px');
      });
      glowTicking=false;
    });
  },{passive:true});
})();

/* ─── Marquee: respect reduced motion ─── */
if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){
  const track=document.querySelector('.specialties-track');
  if(track)track.style.animationPlayState='paused';
}

/* ═══════════════════════════════════════════════
   "CLICK THIS" EASTER EGG (ephemeral, browser-side)
   ═══════════════════════════════════════════════ */
(function(){
  const triggerBtn=document.getElementById('click-this-btn');
  const overlay=document.getElementById('ee-overlay');
  if(!triggerBtn||!overlay)return;

  const logEl=document.getElementById('ee-log');
  const bodyEl=document.getElementById('ee-body');
  const terminalEl=document.getElementById('ee-terminal');
  const promptActions=document.getElementById('ee-prompt-actions');
  const finalEl=document.getElementById('ee-final');
  const continueBtn=document.getElementById('ee-continue-btn');
  const cancelBtn=document.getElementById('ee-cancel-btn');
  const closeTopBtn=document.getElementById('ee-close-top');
  const replayBtn=document.getElementById('ee-replay-btn');
  const closeBtn=document.getElementById('ee-close-btn');

  let runId=0;
  let activeCursor=null;
  let abortCtrl=null;

  function isReducedMotion(){
    return window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  }

  function wait(ms,id){
    const d=isReducedMotion()?Math.min(ms,80):ms;
    return new Promise(resolve=>{
      setTimeout(()=>resolve(id===runId),d);
    });
  }

  function triggerFlicker(){
    if(isReducedMotion())return;
    overlay.classList.remove('ee-flicker');
    void overlay.offsetWidth;
    overlay.classList.add('ee-flicker');
    setTimeout(()=>overlay.classList.remove('ee-flicker'),240);
  }

  function attachCursor(el){
    if(activeCursor&&activeCursor.parentNode){
      activeCursor.parentNode.removeChild(activeCursor);
    }
    const c=document.createElement('span');
    c.className='ee-cursor';
    c.setAttribute('aria-hidden','true');
    el.appendChild(c);
    activeCursor=c;
  }

  function scrollToBottom(){
    if(bodyEl)bodyEl.scrollTop=bodyEl.scrollHeight;
  }

  async function typeLine(text,id,cls='',charSpeed=22){
    if(id!==runId)return false;
    const p=document.createElement('p');
    p.className='ee-line'+(cls?' '+cls:'');
    const span=document.createElement('span');
    p.appendChild(span);
    logEl.appendChild(p);
    attachCursor(p);
    scrollToBottom();

    if(isReducedMotion()||charSpeed<=0){
      span.textContent=text;
      scrollToBottom();
      return true;
    }

    for(let i=1;i<=text.length;i++){
      if(id!==runId)return false;
      span.textContent=text.slice(0,i);
      scrollToBottom();
      await new Promise(r=>setTimeout(r,charSpeed));
    }
    return id===runId;
  }

  async function typeKeyValue(key,val,id){
    if(id!==runId)return false;
    const p=document.createElement('p');
    p.className='ee-line ee-bright';
    const kSpan=document.createElement('span');
    kSpan.className='ee-key';
    const vSpan=document.createElement('span');
    vSpan.className='ee-val';
    p.appendChild(kSpan);
    p.appendChild(vSpan);
    logEl.appendChild(p);
    attachCursor(p);
    scrollToBottom();

    const prefix='> '+key+': ';
    if(isReducedMotion()){
      kSpan.textContent=prefix;
      vSpan.textContent=val;
      scrollToBottom();
      return true;
    }
    for(let i=1;i<=prefix.length;i++){
      if(id!==runId)return false;
      kSpan.textContent=prefix.slice(0,i);
      await new Promise(r=>setTimeout(r,14));
    }
    for(let i=1;i<=val.length;i++){
      if(id!==runId)return false;
      vSpan.textContent=val.slice(0,i);
      scrollToBottom();
      await new Promise(r=>setTimeout(r,18));
    }
    return id===runId;
  }

  function addSpacer(){
    const div=document.createElement('div');
    div.className='ee-line ee-spacer';
    logEl.appendChild(div);
  }

  function detectBrowserEnv(){
    const ua=navigator.userAgent||'';
    let os='UNKNOWN OS';
    if(/Windows/i.test(ua))os='WINDOWS';
    else if(/Android/i.test(ua))os='ANDROID';
    else if(/iPhone|iPad|iPod/i.test(ua))os='IOS';
    else if(/Mac OS X|Macintosh/i.test(ua))os='MACOS';
    else if(/Linux/i.test(ua))os='LINUX';

    let browser='BROWSER';
    if(/Edg\//i.test(ua))browser='EDGE';
    else if(/OPR\/|Opera/i.test(ua))browser='OPERA';
    else if(/Chrome\//i.test(ua)&&!/Edg\//i.test(ua))browser='CHROME';
    else if(/Firefox\//i.test(ua))browser='FIREFOX';
    else if(/Safari\//i.test(ua)&&!/Chrome\//i.test(ua))browser='SAFARI';

    const lang=(navigator.language||'EN-US').toUpperCase();
    const threads=navigator.hardwareConcurrency?String(navigator.hardwareConcurrency):null;
    const memory=navigator.deviceMemory?String(navigator.deviceMemory)+' GB':null;
    const display=(window.screen&&window.screen.width&&window.screen.height)?`${window.screen.width} × ${window.screen.height}`:`${window.innerWidth} × ${window.innerHeight}`;
    let tz='UTC';
    try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone.toUpperCase()}catch(e){}
    const conn=(navigator.connection&&navigator.connection.effectiveType)?String(navigator.connection.effectiveType).toUpperCase():null;
    const status=navigator.onLine?'ONLINE':'OFFLINE';

    return{os,browser,lang,threads,memory,display,tz,conn,status};
  }

  async function fetchEphemeralNetInfo(signal){
    try{
      const r=await fetch('https://ipwho.is/',{signal,cache:'no-store'});
      if(r.ok){
        const d=await r.json();
        if(d&&d.success!==false&&d.ip){
          return{
            ip:d.ip,
            isp:(d.connection&&(d.connection.isp||d.connection.org))||d.isp||null,
            lat:typeof d.latitude==='number'?d.latitude:null,
            lon:typeof d.longitude==='number'?d.longitude:null,
            region:[d.city,d.region].filter(Boolean).slice(0,2).join(', ')||null,
            country:d.country||null
          };
        }
      }
    }catch(e){}
    try{
      const r2=await fetch('https://ipapi.co/json/',{signal,cache:'no-store'});
      if(r2.ok){
        const d2=await r2.json();
        if(d2&&d2.ip){
          return{
            ip:d2.ip,
            isp:d2.org||null,
            lat:typeof d2.latitude==='number'?d2.latitude:null,
            lon:typeof d2.longitude==='number'?d2.longitude:null,
            region:[d2.city,d2.region].filter(Boolean).slice(0,2).join(', ')||null,
            country:d2.country_name||d2.country||null
          };
        }
      }
    }catch(e){}
    try{
      const r3=await fetch('https://api.ipify.org?format=json',{signal,cache:'no-store'});
      if(r3.ok){
        const d3=await r3.json();
        if(d3&&d3.ip)return{ip:d3.ip,isp:null,lat:null,lon:null,region:null,country:null};
      }
    }catch(e){}
    return null;
  }

  const statusLabel=overlay.querySelector('.ee-status span');

  async function typeStatusLine(prefix,badge,id,badgeCls='ee-accent'){
    if(id!==runId)return null;
    const p=document.createElement('p');
    p.className='ee-line ee-bright';
    const preSpan=document.createElement('span');
    preSpan.className='ee-key';
    const bSpan=document.createElement('span');
    bSpan.className='ee-val '+badgeCls;
    p.appendChild(preSpan);
    p.appendChild(bSpan);
    logEl.appendChild(p);
    attachCursor(p);
    scrollToBottom();

    if(isReducedMotion()){
      preSpan.textContent=prefix;
      bSpan.textContent=badge;
      scrollToBottom();
      return bSpan;
    }
    for(let i=1;i<=prefix.length;i++){
      if(id!==runId)return null;
      preSpan.textContent=prefix.slice(0,i);
      await new Promise(r=>setTimeout(r,15));
    }
    if(!(await wait(140,id)))return null;
    bSpan.textContent=badge;
    scrollToBottom();
    return bSpan;
  }

  async function typeScanProgress(id){
    if(id!==runId)return false;
    const p=document.createElement('p');
    p.className='ee-line ee-bright';
    const preSpan=document.createElement('span');
    preSpan.className='ee-key';
    const barSpan=document.createElement('span');
    barSpan.className='ee-val';
    p.appendChild(preSpan);
    p.appendChild(barSpan);
    logEl.appendChild(p);
    attachCursor(p);
    scrollToBottom();

    const prefix='> scanning browser environment... ';
    if(isReducedMotion()){
      preSpan.textContent=prefix;
      barSpan.textContent='[██████████████░░] 87%';
      await wait(80,id);
      barSpan.textContent='[████████████████] 100%';
      return id===runId;
    }
    for(let i=1;i<=prefix.length;i++){
      if(id!==runId)return false;
      preSpan.textContent=prefix.slice(0,i);
      await new Promise(r=>setTimeout(r,14));
    }
    const steps=[
      ['[███░░░░░░░░░░░░░] 19%',90],
      ['[███████░░░░░░░░░] 44%',95],
      ['[███████████░░░░░] 68%',100],
      ['[██████████████░░] 87%',240],
      ['[████████████████] 100%',140]
    ];
    for(const [txt,delay] of steps){
      if(id!==runId)return false;
      barSpan.textContent=txt;
      scrollToBottom();
      await new Promise(r=>setTimeout(r,delay));
    }
    return id===runId;
  }

  function corruptFewChars(container,degBadge){
    if(isReducedMotion())return()=>{};
    const saved=[];
    if(degBadge){
      saved.push({el:degBadge,txt:degBadge.textContent});
      degBadge.textContent='DΞGRΔD░D';
    }
    const keys=container.querySelectorAll('.ee-key');
    if(keys.length>=2){
      const t=keys[keys.length-2];
      saved.push({el:t,txt:t.textContent});
      t.textContent=t.textContent.replace('local data','l0c░l d∆ta');
    }
    return()=>{
      saved.forEach(item=>{item.el.textContent=item.txt});
    };
  }

  async function startPromptStage(){
    const id=++runId;
    if(abortCtrl){try{abortCtrl.abort()}catch(e){}abortCtrl=null}
    overlay.classList.remove('ee-anomaly');
    if(statusLabel)statusLabel.textContent='SESSION // UNKNOWN';
    logEl.innerHTML='';
    promptActions.hidden=true;
    finalEl.hidden=true;
    terminalEl.hidden=false;

    if(!(await wait(180,id)))return;
    if(!(await typeLine('> ???',id,'ee-bright',32)))return;
    if(!(await wait(420,id)))return;
    if(!(await typeLine('> are you sure?',id,'ee-accent',28)))return;
    if(!(await wait(220,id)))return;

    promptActions.hidden=false;
    continueBtn.focus();
  }

  async function runSequence(){
    const id=++runId;
    if(abortCtrl){try{abortCtrl.abort()}catch(e){}}
    abortCtrl=new AbortController();
    const timeoutId=setTimeout(()=>{try{abortCtrl.abort()}catch(e){}},4000);

    /* Ephemeral in-memory lookup — never saved anywhere */
    let netPromise=fetchEphemeralNetInfo(abortCtrl.signal).finally(()=>clearTimeout(timeoutId));

    overlay.classList.remove('ee-anomaly');
    if(statusLabel)statusLabel.textContent='SESSION // UNKNOWN';
    promptActions.hidden=true;
    finalEl.hidden=true;
    terminalEl.hidden=false;
    logEl.innerHTML='';

    if(!(await typeLine('> click registered.',id,'ee-bright',18)))return;
    if(!(await wait(240,id)))return;
    if(!(await typeLine('> initializing session...',id,'',18)))return;
    if(!(await wait(240,id)))return;
    if(!(await typeLine('> reading browser environment...',id,'',18)))return;
    if(!(await wait(260,id)))return;

    if(!(await typeScanProgress(id)))return;
    if(!(await wait(220,id)))return;
    if(!(await typeStatusLine('> checking session integrity... ','[OK]',id,'ee-accent')))return;
    if(!(await wait(220,id)))return;
    if(!(await typeStatusLine('> checking local data... ','[NONE]',id,'ee-accent')))return;
    if(!(await wait(420,id)))return;

    /* Subtle system anomaly (680ms) */
    addSpacer();
    if(!(await typeLine('> unusual response detected.',id,'ee-warn',20)))return;
    if(!(await wait(180,id)))return;
    const degBadge=await typeStatusLine('> session integrity: ','DEGRADED',id,'ee-warn');
    if(!degBadge)return;

    overlay.classList.add('ee-anomaly');
    if(statusLabel)statusLabel.textContent='SESSION // INTEGRITY DEGRADED';
    const restoreCorrupted=corruptFewChars(logEl,degBadge);
    if(!(await wait(680,id))){
      restoreCorrupted();
      overlay.classList.remove('ee-anomaly');
      return;
    }

    /* Recovery */
    if(!(await typeLine('> attempting recovery...',id,'',18)))return;
    if(!(await wait(380,id))){
      restoreCorrupted();
      overlay.classList.remove('ee-anomaly');
      return;
    }
    restoreCorrupted();
    overlay.classList.remove('ee-anomaly');
    if(statusLabel)statusLabel.textContent='SESSION // UNKNOWN';
    triggerFlicker();
    if(!(await typeLine('> recovery complete.',id,'ee-accent',18)))return;
    if(!(await wait(240,id)))return;
    if(!(await typeLine('> restoring interface...',id,'',18)))return;
    if(!(await wait(550,id)))return;

    triggerFlicker();
    logEl.innerHTML='';

    if(!(await typeLine("> here's what your browser revealed",id,'ee-bright',22)))return;
    if(!(await typeLine('> the moment you opened this site.',id,'ee-bright',20)))return;
    if(!(await wait(600,id)))return;

    addSpacer();
    const env=detectBrowserEnv();
    if(!(await typeKeyValue('operating system',env.os,id)))return;
    if(!(await wait(140,id)))return;
    if(!(await typeKeyValue('browser',env.browser,id)))return;
    if(!(await wait(140,id)))return;
    if(!(await typeKeyValue('language',env.lang,id)))return;
    if(!(await wait(140,id)))return;
    if(env.threads){
      if(!(await typeKeyValue('processor threads',env.threads,id)))return;
      if(!(await wait(140,id)))return;
    }
    if(env.memory){
      if(!(await typeKeyValue('memory estimate',env.memory,id)))return;
      if(!(await wait(140,id)))return;
    }
    if(!(await typeKeyValue('display',env.display,id)))return;
    if(!(await wait(140,id)))return;
    if(!(await typeKeyValue('timezone',env.tz,id)))return;
    if(!(await wait(140,id)))return;
    if(env.conn){
      if(!(await typeKeyValue('connection',env.conn,id)))return;
      if(!(await wait(140,id)))return;
    }
    if(!(await typeKeyValue('status',env.status,id)))return;
    if(!(await wait(520,id)))return;

    let net=await netPromise;
    if(id!==runId){net=null;return}

    if(net&&net.ip){
      addSpacer();
      if(!(await typeLine('> your public ip address is',id,'',18)))return;
      if(!(await typeLine('> '+net.ip,id,'ee-accent',22)))return;
      if(!(await wait(480,id)))return;

      if(net.isp){
        if(!(await typeLine('> you are connected through',id,'',18)))return;
        if(!(await typeLine('> '+String(net.isp).toUpperCase(),id,'ee-bright',18)))return;
        if(!(await wait(460,id)))return;
      }

      if(net.lat!==null&&net.lon!==null){
        if(!(await typeLine('> your approximate coordinates are around',id,'',18)))return;
        if(!(await typeLine(`> ${Number(net.lat).toFixed(4)}, ${Number(net.lon).toFixed(4)}`,id,'ee-accent',20)))return;
        if(!(await wait(460,id)))return;
      }

      if(net.region||net.country){
        const locStr=[net.region,net.country].filter(Boolean).join(', ').toUpperCase();
        if(!(await typeLine('> your approximate region is',id,'',18)))return;
        if(!(await typeLine('> '+locStr,id,'ee-bright',20)))return;
        if(!(await typeLine('> location is approximate and network-derived.',id,'ee-note',12)))return;
        if(!(await wait(480,id)))return;
      }
    }

    addSpacer();
    if(!(await typeLine('> your timezone is',id,'',18)))return;
    if(!(await typeLine('> '+env.tz,id,'ee-bright',18)))return;
    const localTimeStr=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if(!(await typeLine('> local time is',id,'',18)))return;
    if(!(await typeLine('> '+localTimeStr,id,'ee-bright',18)))return;

    /* Wipe ephemeral network info from memory immediately after display */
    net=null;

    if(!(await wait(850,id)))return;
    triggerFlicker();
    addSpacer();

    if(!(await typeLine('> wait.',id,'ee-bright',30)))return;
    if(!(await wait(800,id)))return;
    if(!(await typeLine('> you clicked it.',id,'ee-bright',28)))return;
    if(!(await wait(800,id)))return;
    if(!(await typeLine("> that's exactly the point.",id,'ee-accent',26)))return;
    if(!(await wait(1050,id)))return;

    triggerFlicker();
    terminalEl.hidden=true;
    logEl.innerHTML='';
    finalEl.hidden=false;
    if(bodyEl)bodyEl.scrollTop=0;
    replayBtn.focus();
  }

  function openOverlay(){
    if(nav&&nav.classList.contains('open')){
      nav.classList.remove('open');
      if(menu){menu.setAttribute('aria-expanded','false');menu.textContent='Menu +'}
    }
    overlay.hidden=false;
    document.body.style.overflow='hidden';
    requestAnimationFrame(()=>{
      overlay.classList.add('open');
      startPromptStage();
    });
  }

  function closeOverlay(){
    runId++;
    if(abortCtrl){try{abortCtrl.abort()}catch(e){}abortCtrl=null}
    overlay.classList.remove('open','ee-anomaly','ee-flicker');
    if(statusLabel)statusLabel.textContent='SESSION // UNKNOWN';
    document.body.style.overflow='';
    setTimeout(()=>{
      overlay.hidden=true;
      logEl.innerHTML='';
      promptActions.hidden=true;
      finalEl.hidden=true;
      triggerBtn.focus();
    },300);
  }

  triggerBtn.addEventListener('click',openOverlay);
  continueBtn.addEventListener('click',runSequence);
  replayBtn.addEventListener('click',runSequence);
  cancelBtn.addEventListener('click',closeOverlay);
  closeBtn.addEventListener('click',closeOverlay);
  closeTopBtn.addEventListener('click',closeOverlay);

  overlay.addEventListener('click',e=>{
    if(e.target===overlay)closeOverlay();
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!overlay.hidden){
      e.preventDefault();
      closeOverlay();
    }
  });
})();


