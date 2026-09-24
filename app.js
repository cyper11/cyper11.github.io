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
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu +'}));

/* ─── Theme toggle ─── */
const themeBtn=document.getElementById('theme-toggle');
const curTheme=document.documentElement.dataset.theme||'dark';
themeBtn.textContent=curTheme==='light'?'☾':'☀';
themeBtn.addEventListener('click',()=>{document.body.classList.add('theme-switching');const next=(document.documentElement.dataset.theme||'dark')==='light'?'dark':'light';document.documentElement.dataset.theme=next;localStorage.setItem('theme',next);themeBtn.textContent=next==='light'?'☾':'☀';themeBtn.setAttribute('aria-label',next==='light'?'Switch to dark mode':'Switch to light mode');setTimeout(()=>document.body.classList.remove('theme-switching'),400)});

/* ─── Active nav observer ─── */
const navObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id))}})},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('main section[id]').forEach(s=>navObserver.observe(s));

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
   GITHUB LIVE ACTIVITY
   ═══════════════════════════════════════════════ */
(function(){
  const GH_USER='cyper11';
  const LANG_COLORS={JavaScript:'#f1e05a',HTML:'#e34c26',CSS:'#563d7c',Java:'#b07219',Python:'#3572A5',PHP:'#4F5D95','C#':'#178600',TypeScript:'#3178c6',Shell:'#89e051',Kotlin:'#A97BFF',SCSS:'#c6538c',Vue:'#41b883'};
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /* ── Tooltip ── */
  let tip=document.createElement('div');
  tip.className='gh-tip';
  document.body.appendChild(tip);

  /* ── Contribution Heatmap ── */
  async function loadHeatmap(){
    const el=document.getElementById('gh-heatmap');
    const monthsEl=document.getElementById('gh-months');
    const totalEl=document.getElementById('gh-total');
    try{
      const res=await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`);
      if(!res.ok)throw new Error('API error');
      const data=await res.json();
      const contributions=data.contributions;
      const total=data.total?data.total.lastYear||Object.values(data.total).reduce((a,b)=>a+b,0):0;
      totalEl.innerHTML=`<span class="gh-total-num">${total.toLocaleString()}</span> contributions in the last year`;

      /* Group by week */
      const weeks=[];let currentWeek=[];
      contributions.forEach((c,i)=>{
        const d=new Date(c.date);
        if(i===0){/* pad first week */
          for(let p=0;p<d.getDay();p++)currentWeek.push(null);
        }
        currentWeek.push(c);
        if(d.getDay()===6||i===contributions.length-1){weeks.push(currentWeek);currentWeek=[];}
      });

      /* Month labels */
      let lastMonth=-1;const monthLabels=[];
      weeks.forEach((week,wi)=>{
        const firstDay=week.find(d=>d);
        if(firstDay){
          const m=new Date(firstDay.date).getMonth();
          if(m!==lastMonth){monthLabels.push({week:wi,label:MONTHS[m]});lastMonth=m;}
        }
      });
      const weekWidth=15; /* 12px + 3px gap */
      monthsEl.innerHTML=monthLabels.map((m,i)=>{
        const next=monthLabels[i+1];
        const span=next?(next.week-m.week)*weekWidth:(weeks.length-m.week)*weekWidth;
        return `<span style="width:${span}px">${m.label}</span>`;
      }).join('');

      /* Render grid */
      el.innerHTML=weeks.map(week=>{
        const cells=[];
        for(let d=0;d<7;d++){
          const c=week[d];
          if(!c)cells.push('<div class="gh-day" data-level="0" style="visibility:hidden"></div>');
          else cells.push(`<div class="gh-day" data-level="${c.level}" data-date="${c.date}" data-count="${c.count}"></div>`);
        }
        return `<div class="gh-week">${cells.join('')}</div>`;
      }).join('');

      /* Tooltip events */
      el.addEventListener('mouseover',e=>{
        const day=e.target.closest('.gh-day');
        if(!day||!day.dataset.date)return;
        const count=day.dataset.count;
        const date=new Date(day.dataset.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
        tip.innerHTML=`<strong>${count}</strong> contribution${count!=='1'?'s':''} on ${date}`;
        tip.classList.add('show');
      });
      el.addEventListener('mousemove',e=>{tip.style.left=e.clientX+12+'px';tip.style.top=e.clientY-36+'px'});
      el.addEventListener('mouseout',e=>{if(e.target.closest('.gh-day'))tip.classList.remove('show')});

    }catch(err){
      el.innerHTML='<div class="gh-error">Could not load contribution data</div>';
    }
  }

  /* ── Repositories ── */
  async function loadRepos(){
    const el=document.getElementById('gh-repos');
    try{
      const res=await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=100`);
      if(!res.ok)throw new Error('API error');
      const repos=(await res.json()).filter(r=>!r.fork).sort((a,b)=>new Date(b.pushed_at)-new Date(a.pushed_at)).slice(0,5);
      if(!repos.length){el.innerHTML='<div class="gh-placeholder">No public repositories</div>';return repos;}
      el.innerHTML=repos.map(r=>{
        const lang=r.language||'';
        const color=LANG_COLORS[lang]||'var(--muted)';
        const desc=r.description?`<span class="gh-repo-desc">${r.description}</span>`:'';
        const updated=new Date(r.pushed_at).toLocaleDateString('en-US',{month:'short',day:'numeric'});
        return `<a href="${r.html_url}" target="_blank" rel="noreferrer" class="gh-repo"><div class="gh-repo-info"><span class="gh-repo-name">${r.name}</span>${desc}</div><div class="gh-repo-meta">${lang?`<span class="gh-repo-lang" style="--lang-color:${color}">${lang}</span>`:''}<span>${updated}</span><span class="gh-repo-arrow">↗</span></div></a>`;
      }).join('');
      /* Language dot color */
      el.querySelectorAll('.gh-repo-lang').forEach(el=>{el.style.setProperty('--lang-color',el.style.getPropertyValue('--lang-color'));});
      return repos;
    }catch(err){
      el.innerHTML='<div class="gh-error">Could not load repositories</div>';
      return[];
    }
  }

  /* ── Languages ── */
  async function loadLanguages(repos){
    const el=document.getElementById('gh-langs');
    try{
      if(!repos||!repos.length){el.innerHTML='<div class="gh-placeholder">No data</div>';return;}
      /* Aggregate languages from repos */
      const langCount={};
      repos.forEach(r=>{if(r.language){langCount[r.language]=(langCount[r.language]||0)+r.size}});
      /* Also fetch language breakdown for top repos */
      const langPromises=repos.slice(0,5).map(r=>fetch(r.languages_url).then(res=>res.json()).catch(()=>({})));
      const langData=await Promise.all(langPromises);
      const langBytes={};
      langData.forEach(d=>{Object.entries(d).forEach(([lang,bytes])=>{langBytes[lang]=(langBytes[lang]||0)+bytes})});
      const sorted=Object.entries(langBytes).sort((a,b)=>b[1]-a[1]);
      const totalBytes=sorted.reduce((sum,l)=>sum+l[1],0);
      if(!sorted.length){el.innerHTML='<div class="gh-placeholder">No language data</div>';return;}

      /* Color bar */
      const bar=sorted.map(([lang,bytes])=>{
        const pct=(bytes/totalBytes*100).toFixed(1);
        const color=LANG_COLORS[lang]||'#555';
        return `<div class="gh-lang-seg" style="width:${pct}%;background:${color}" title="${lang} ${pct}%"></div>`;
      }).join('');

      /* Legend */
      const legend=sorted.slice(0,6).map(([lang,bytes])=>{
        const pct=(bytes/totalBytes*100).toFixed(1);
        const color=LANG_COLORS[lang]||'#555';
        return `<span class="gh-lang-item" style="--lang-color:${color}">${lang} <span style="opacity:.5">${pct}%</span></span>`;
      }).join('');

      el.innerHTML=`<div class="gh-lang-bar">${bar}</div><div class="gh-lang-list">${legend}</div>`;
      /* Set dot colors */
      el.querySelectorAll('.gh-lang-item').forEach(item=>{item.style.setProperty('--dot-color',getComputedStyle(item).getPropertyValue('--lang-color'))});
    }catch(err){
      el.innerHTML='<div class="gh-error">Could not load languages</div>';
    }
  }

  /* ── Recent Activity ── */
  async function loadEvents(){
    const el=document.getElementById('gh-events');
    try{
      const res=await fetch(`https://api.github.com/users/${GH_USER}/events/public?per_page=30`);
      if(!res.ok)throw new Error('API error');
      const events=(await res.json()).filter(e=>e.type==='PushEvent').slice(0,5);
      if(!events.length){el.innerHTML='<div class="gh-placeholder">No recent activity</div>';return;}
      el.innerHTML=events.map(e=>{
        const repo=e.repo.name.replace(GH_USER+'/','');
        const msg=e.payload.commits&&e.payload.commits.length?e.payload.commits[e.payload.commits.length-1].message.split('\n')[0]:'';
        const ago=timeAgo(new Date(e.created_at));
        return `<div class="gh-event"><span class="gh-event-time">${ago}</span><span class="gh-event-repo">${repo}</span><span class="gh-event-msg">${msg}</span></div>`;
      }).join('');
    }catch(err){
      el.innerHTML='<div class="gh-error">Could not load activity</div>';
    }
  }

  function timeAgo(date){
    const s=Math.floor((Date.now()-date)/1000);
    if(s<60)return 'just now';
    if(s<3600)return Math.floor(s/60)+'m ago';
    if(s<86400)return Math.floor(s/3600)+'h ago';
    if(s<604800)return Math.floor(s/86400)+'d ago';
    return date.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  }

  /* ── CSS for language dots ── */
  const style=document.createElement('style');
  style.textContent='.gh-repo-lang::before{background:var(--lang-color,var(--muted))}.gh-lang-item::before{background:var(--lang-color,var(--muted))}';
  document.head.appendChild(style);

  /* ── Init ── */
  loadHeatmap();
  loadRepos().then(repos=>loadLanguages(repos||[]));
  loadEvents();
})();
