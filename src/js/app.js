(function(){

const S=window.SITE,B=document.body,ROOT=B.dataset.root||'./',PAGE=B.dataset.page;
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches,FILE=location.protocol==='file:';
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const ph=v=>/^<.*>$/.test(v||''),url=v=>ph(v)?'#':v,mail=v=>ph(v)?'#':'mailto:'+v;
const route=p=>ROOT+(p?p+'/':'')+(FILE?'index.html':'');
const get=p=>p.split('.').reduce((o,k)=>o&&o[k],S);
const asset=v=>/^(https?:|data:|\/)/.test(v)?v:ROOT+v;

document.querySelectorAll('[data-bind]').forEach(n=>n.textContent=get(n.dataset.bind));
document.querySelectorAll('[data-chips]').forEach(n=>get(n.dataset.chips).forEach(v=>n.appendChild(el('li',0,v))));
document.title=S.profile.name+' · '+({home:'Home',projects:'Projects','tech-stack':'Tech Stack',contact:'Contact'}[PAGE]);

const pages=[['Home','','home'],['Projects','projects','projects'],['Tech Stack','tech-stack','tech-stack'],['Contact','contact','contact']];
const nav=el('header','nav'),logo=el('a','logo',S.profile.name);logo.href=route('');nav.appendChild(logo);
const ul=el('ul');pages.forEach(([n,p,k])=>{const li=el('li'),a=el('a',0,n);a.href=route(p);if(k===PAGE)a.setAttribute('aria-current','page');li.appendChild(a);ul.appendChild(li)});
const nv=el('nav');nv.setAttribute('aria-label','Main');nv.appendChild(ul);nav.appendChild(nv);B.prepend(nav);
const ft=el('footer','foot');ft.appendChild(el('span',0,'© '+new Date().getFullYear()+' '+S.profile.name));
const fl=el('div');[['Email',mail(S.socials.email)],['GitHub',url(S.socials.github)],['LinkedIn',url(S.socials.linkedin)]].forEach(([n,h])=>{const a=el('a',0,n);a.href=h;fl.appendChild(a)});
ft.appendChild(fl);B.appendChild(ft);
const setFoot=()=>document.documentElement.style.setProperty('--foot-h',ft.offsetHeight+'px');setFoot();addEventListener('resize',setFoot);if(document.fonts)document.fonts.ready.then(setFoot);
document.querySelectorAll('[data-route]').forEach(a=>a.href=route(a.dataset.route));
addEventListener('scroll',()=>nav.classList.toggle('s',scrollY>30),{passive:true});

const photo=document.getElementById('hPhoto');
if(photo){if(ph(S.profile.photo)){photo.textContent=S.profile.photo}else{const i=new Image();i.src=asset(S.profile.photo);i.alt=S.profile.name;photo.appendChild(i)}}
const soc=document.getElementById('hSoc');
if(soc)[['GitHub',S.socials.github],['LinkedIn',S.socials.linkedin]].forEach(([n,h])=>{const a=el('a','link',n);a.href=url(h);a.target='_blank';a.rel='noopener';soc.appendChild(a)});
const pl=document.getElementById('projList');
if(pl)S.projects.forEach((p,i)=>{
  const a=el('article','proj rv');a.appendChild(el('span','proj-n',String(i+1).padStart(2,'0')+' / '+String(S.projects.length).padStart(2,'0')));
  const b=el('div','proj-b'),im=el('a','proj-img');im.href=url(p.live);im.setAttribute('aria-label',p.name);
  if(ph(p.image)){im.appendChild(el('div',0,p.image))}else{const g=new Image();g.src=asset(p.image);g.alt=p.name;im.appendChild(g)}
  const t=el('div','proj-t');t.appendChild(el('h2',0,p.name));
  const d=el('div');d.appendChild(el('p',0,p.description));
  const tg=el('ul','tags');p.technologies.forEach(x=>tg.appendChild(el('li',0,x)));d.appendChild(tg);
  const l=el('div','links');[['GitHub',p.github],['Live site',p.live]].forEach(([n,h])=>{const k=el('a','link',n);k.href=url(h);k.target='_blank';k.rel='noopener';l.appendChild(k)});
  d.appendChild(l);t.appendChild(d);b.append(im,t);a.appendChild(b);pl.appendChild(a)});
const tl=document.getElementById('techList');
if(tl)S.skills.filter(c=>c.items.length).forEach(c=>{const s=el('section','cat rv');s.appendChild(el('h2','lbl',c.title));const u=el('ul');c.items.forEach(x=>u.appendChild(el('li',0,x)));s.appendChild(u);tl.appendChild(s)});
const cl=document.getElementById('contactList');
if(cl)[['Email',S.socials.email,mail],['GitHub',S.socials.github,url],['LinkedIn',S.socials.linkedin,url],['Discord',S.socials.discord,url]].forEach(([n,v,f])=>{
  const li=el('li'),a=el('a');a.href=f(v);if(n!=='Email'){a.target='_blank';a.rel='noopener'}a.append(el('span',0,n),el('span','lbl',ph(v)?v:'↗'));li.appendChild(a);cl.appendChild(li)});
const cm=document.getElementById('cMail');if(cm){cm.textContent=S.socials.email;cm.href=mail(S.socials.email)}

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(n=>io.observe(n));

/* page transition: veil slides up, next page slides it away */
const veil=el('div','veil');B.appendChild(veil);
if(!RM){
  if(sessionStorage.getItem('veil')){veil.style.transition='none';veil.style.transform='translateY(0)';sessionStorage.removeItem('veil');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{veil.style.transition='';veil.style.transform='translateY(-100%)'}))}
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank')return;
    const u=new URL(a.href,location.href);
    if(u.protocol==='mailto:'||a.getAttribute('href')==='#'||u.href===location.href||(!FILE&&u.origin!==location.origin))return;
    e.preventDefault();sessionStorage.setItem('veil','1');veil.style.transform='translateY(0)';setTimeout(()=>{location.href=a.href},420)});
  addEventListener('pageshow',e=>{if(e.persisted)veil.style.transform='translateY(100%)'});
}
/* opening animation: Home, once per session */
if(PAGE==='home'&&!RM&&!sessionStorage.getItem('seen')){
  sessionStorage.setItem('seen','1');
  const i=el('div','intro'),w=el('div');w.appendChild(el('span',0,S.profile.name));i.appendChild(w);B.appendChild(i);
  requestAnimationFrame(()=>requestAnimationFrame(()=>i.classList.add('in')));
  setTimeout(()=>{i.classList.add('out');setTimeout(()=>i.remove(),900)},1300);
}

/* HOME: scroll position drives the composition (reversible) */
const stage=document.getElementById('stage');
const mq=matchMedia('(min-width:821px) and (prefers-reduced-motion:no-preference)');
if(stage&&mq.matches){
  const pin=document.getElementById('pin'),head=document.getElementById('hHead'),role=document.getElementById('hRole'),hint=document.getElementById('hHint');
  const col=[...document.getElementById('hCol').children];
  const cl2=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=t=>t*t*(3-2*t),seg=(p,a,b)=>ease(cl2((p-a)/(b-a))),lerp=(a,b,t)=>a+(b-a)*t;
  const stops=[[0,[248,244,236]],[.35,[250,229,215]],[.62,[232,224,246]],[.85,[222,235,247]],[1,[221,239,226]]];
  const colorAt=p=>{for(let i=1;i<stops.length;i++)if(p<=stops[i][0]){const[a,ca]=stops[i-1],[b,cb]=stops[i],t=(p-a)/(b-a);return ca.map((v,k)=>Math.round(lerp(v,cb[k],t)))}return stops[4][1]};
  let W,H,nl,nt,hh,ticking=false;
  const measure=()=>{W=innerWidth;H=pin.offsetHeight;photo.style.transform='none';head.style.transform='none';nl=photo.offsetLeft;nt=photo.offsetTop;hh=head.offsetHeight;frame()};
  function frame(){ticking=false;
    const r=stage.getBoundingClientRect(),p=cl2(-r.top/(stage.offsetHeight-H));
    const a=seg(p,.1,.4),y1=H*.12;
    head.style.transform=`translate(0,${lerp(H*.5,y1,a)}px) scale(${lerp(1,.4,a)})`;
    role.style.opacity=1-seg(p,.08,.22);
    const b=seg(p,.14,.46);
    photo.style.transform=`translate(${lerp(0,W*.05-nl,b)}px,${lerp(0,y1+hh*.4+28-nt,b)}px) scale(${lerp(1,.62,b)})`;
    [[.3,.44],[.44,.58],[.58,.7],[.76,.88]].forEach(([s,e],i)=>{const o=seg(p,s,e),n=col[i];n.style.opacity=o;n.style.transform=`translateY(${(1-o)*16}px)`;n.style.pointerEvents=o>.6?'auto':'none'});
    hint.style.opacity=1-seg(p,0,.06);
    stage.style.background = 'rgb(' + colorAt(p).join(',') + ')'}
  const req=()=>{if(!ticking){ticking=true;requestAnimationFrame(frame)}};
  addEventListener('scroll',req,{passive:true});addEventListener('resize',measure);
  if(document.fonts)document.fonts.ready.then(measure);measure();
  mq.addEventListener('change',()=>location.reload());
}
})();
