const config = window.QREDIT_CONFIG || {};
const sections = ['welcome','prize','registration','success'];
const prizes = [
  {title:'شهر مجاني', description:'ربحت شهرًا مجانيًا من رسوم اشتراك كريدت، وفق شروط العرض.', emoji:'🎟️', code:'free_month'},
  {title:'شوكولاتة', description:'ربحت شوكولاتة! اعرض النتيجة لفريق كريدت في البوث.', emoji:'🍫', code:'chocolate'},
  {title:'حاول مرة أخرى', description:'عندك فرصة ثانية! ارجع ولف العجلة من جديد.', emoji:'🔄', code:'try_again'},
  {title:'هدية', description:'ربحت هدية! توجّه إلى فريق كريدت في البوث لاستلامها.', emoji:'🎁', code:'gift'}
];
// Eight equally likely wheel slots: the four prize types repeat twice.
const wheelPrizes = [...prizes, ...prizes];
const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('start');
const spinStatus = document.getElementById('spin-status');
let spinning = false, rotation = 0, selectedPrize = null, spins = 0;
function show(id){ sections.forEach(section => document.getElementById(section).classList.toggle('hidden',section!==id)); window.scrollTo({top:0,behavior:'instant'}); }
const links = document.getElementById('policy-links');
for (const [key,label] of [['termsUrl','شروط العرض'],['privacyUrl','سياسة الخصوصية']]) {
  if(config[key]) { if(links.childNodes.length) links.append(' · '); const a=document.createElement('a');a.href=config[key];a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';links.append(a); }
}
function celebrate(){
  const root=document.getElementById('confetti');root.replaceChildren();
  const colors=['#16c99b','#f0b43e','#ffffff','#7cead0'];
  for(let i=0;i<95;i++){
    const piece=document.createElement('i');piece.className='confetti-piece';
    piece.style.setProperty('--x',Math.random()*100+'vw');
    piece.style.setProperty('--dx',(Math.random()*260-130)+'px');
    piece.style.setProperty('--delay',(Math.random()*.65)+'s');
    piece.style.setProperty('--duration',(2.2+Math.random()*1.8)+'s');
    piece.style.background=colors[i%colors.length];
    root.append(piece);
  }
  setTimeout(()=>root.replaceChildren(),4700);
}
function spin(){
  if(spinning)return;
  spinning=true;spinButton.disabled=true;spinStatus.textContent='العجلة بتلف… بالتوفيق!';
  const index=Math.floor(Math.random()*wheelPrizes.length);
  // Eight segments, 45 degrees each; pointer at 12 o’clock.
  const center=22.5+index*45;
  const current=((rotation%360)+360)%360;
  const desired=((360-center)%360);
  const extra=((desired-current+360)%360);
  rotation+=360*(6+Math.floor(Math.random()*3))+extra;
  wheel.style.transform=`rotate(${rotation}deg)`;
  setTimeout(()=>{
    selectedPrize=wheelPrizes[index];spinning=false;
    document.getElementById('reward-title').textContent=selectedPrize.title;
    document.getElementById('reward-description').textContent=selectedPrize.description;
    document.getElementById('result-emoji').textContent=selectedPrize.emoji;
    document.getElementById('prize-title').textContent=selectedPrize.code==='try_again'?'فرصة جديدة!':'مبروك! ربحت!';
    document.getElementById('claim').textContent=selectedPrize.code==='try_again'?'لف مرة ثانية':'استلم جائزتك';
    show('prize');
    if(selectedPrize.code!=='try_again' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)celebrate();
    spinButton.disabled=false;
  },5600);
}
spinButton.addEventListener('click',spin);
document.getElementById('claim').addEventListener('click',()=>{
  if(selectedPrize?.code==='try_again') { spins++;show('welcome');spinStatus.textContent='فرصة ثانية! لف العجلة من جديد.'; }
  else show('registration');
});
document.getElementById('lead-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const form=event.currentTarget, button=document.getElementById('submit'),message=document.getElementById('form-message');
  message.textContent='';
  if(!form.reportValidity())return;
  if(!selectedPrize || selectedPrize.code==='try_again') {message.textContent='لازم تلف العجلة أولًا.';return;}
  if(!config.formEndpoint || !/^https:\/\/script\.google\.com\/macros\/s\//.test(config.formEndpoint)){
    message.textContent='في مشكلة بإعدادات الإرسال. تواصل مع فريق كريدت.';return;
  }
  button.disabled=true;button.textContent='جاري الإرسال…';
  try{
    const body=new URLSearchParams();
    for(const [key,value] of new FormData(form).entries())body.append(key,value);
    body.append('campaign','Qredit Exhibition QR');
    body.append('prize',selectedPrize.code);
    // Apps Script response is opaque in no-cors; successful fetch is not proof of storage.
    await fetch(config.formEndpoint,{method:'POST',mode:'no-cors',body});
    show('success');
    document.querySelector('#success p').textContent=`تم إرسال طلب جائزتك (${selectedPrize.title}). فريق كريدت رح يتأكد من البيانات.`;
  }catch(error){message.textContent='تعذّر إرسال الطلب. تأكد من الإنترنت وحاول مرة ثانية.';}
  finally{button.disabled=false;button.textContent='إرسال البيانات واستلام الجائزة';}
});
