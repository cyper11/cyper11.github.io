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

