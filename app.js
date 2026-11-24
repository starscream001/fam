const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const storage={get(key,fallback){try{return localStorage.getItem(key)??fallback}catch{return fallback}},set(key,value){try{localStorage.setItem(key,value)}catch{}}};
const panel=$('#panel');
$$('[data-panel="settings"]').forEach(b=>b.addEventListener('click',()=>panel.showModal()));
$('.close').addEventListener('click',()=>panel.close());
panel.addEventListener('click',e=>{if(e.target!==panel)return;const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close()});
for(const [id,cls] of [['contrast','high-contrast'],['motion','still']]){const input=$('#'+id);input.checked=storage.get('fam-'+id,'false')==='true';document.body.classList.toggle(cls,input.checked);input.addEventListener('change',()=>{document.body.classList.toggle(cls,input.checked);storage.set('fam-'+id,String(input.checked))})}
const video=$('.background-video');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function syncPlayback(){const stop=reducedMotion.matches||document.body.classList.contains('still');document.body.classList.toggle('motion-off',stop);if(document.hidden||stop)video.pause();else video.play().catch(()=>{})}
video.muted=true;video.addEventListener('error',()=>video.hidden=true);video.querySelector('source').addEventListener('error',()=>video.hidden=true);
document.addEventListener('visibilitychange',syncPlayback);reducedMotion.addEventListener('change',syncPlayback);$('#motion').addEventListener('change',syncPlayback);syncPlayback();
const sectionLinks=$$('.topnav a[href^="#"]');
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){sectionLinks.forEach(a=>{const active=a.getAttribute('href')==='#'+entry.target.id;a.classList.toggle('selected',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}}},{rootMargin:'-10% 0px -60% 0px'});
$$('#events,#club').forEach(section=>observer.observe(section));
