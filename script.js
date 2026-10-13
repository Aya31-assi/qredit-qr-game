const config=window.QREDIT_CONFIG||{};
const ids=['welcome','spinning','prize','registration','success'];
const prizeTypes=[
 {code:'free_month',label:'شهر مجاني',emoji:'🎟️',result:'ربحت شهر مجاني',description:'استمتع بشهر اشتراك مجاني مع كريدت، وفق شروط العرض.'},
 {code:'chocolate',label:'شوكولاتة',emoji:'🍫',result:'ربحت شوكولاتة',description:'جائزتك الحلوة بانتظارك في بوث كريدت.'},
 {code:'try_again',label:'حاول مرة أخرى',emoji:'🔄',result:'حاول مرة أخرى',description:'لسه عندك فرصة! لف العجلة من جديد.'},
 {code:'gift',label:'هدية',emoji:'🎁',result:'ربحت هدية',description:'مفاجأة حلوة بانتظارك من كريدت.'}
];
const slots=[...prizeTypes,...prizeTypes];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let selected=null,rot=0,busy=false;
function show(id){
 ids.forEach(s=>document.getElementById(s).classList.toggle('hidden',s!==id));
 window.scrollTo(0,0);
}
function wheelMarkup(){
 const labels=slots.map((p,i)=>{
  const rad=(i*45+22.5-90)*Math.PI/180;
  const x=50+34*Math.cos(rad),y=50+34*Math.sin(rad);
  return `<div class="wheel-label ${i%4===3?'light':''}" style="left:${x}%;top:${y}%"><span class="emoji">${p.emoji}</span><span class="name">${p.label}</span></div>`;
 }).join('');
 return `<div class="wheel-wrap"><div class="pointer"></div><div class="wheel" id="wheel">${labels}<div class="hub"><img src="qredit-q.png" alt=""></div></div></div>`;
}
document.getElementById('wheel-home').innerHTML=wheelMarkup();
const wheelElement=document.getElementById('wheel');
const wheelWrap=wheelElement.closest('.wheel-wrap');
document.getElementById('wheel-active').append(wheelWrap);
document.getElementById('wheel-home').append(wheelWrap);
function confetti(){
 if(reduced)return;
 const el=document.getElementById('confetti');el.replaceChildren();
 const colors=['#16C99B','#F0B43E','#FFFFFF','#7DE5D0'];
 for(let i=0;i<110;i++){
  const piece=document.createElement('i');piece.className='confetti-piece';
  piece.style.setProperty('--x',Math.random()*100+'vw');
  piece.style.setProperty('--dx',(Math.random()*260-130)+'px');
  piece.style.setProperty('--delay',(Math.random()*.8)+'s');
  piece.style.setProperty('--duration',(2+Math.random()*2)+'s');
  piece.style.background=colors[i%colors.length];el.append(piece);
 }
 setTimeout(()=>el.replaceChildren(),5100);
}
function spin(){
 if(busy)return;
 busy=true;
 document.getElementById('wheel-active').append(wheelWrap);
 show('spinning');
 const idx=Math.floor(Math.random()*8);
 const center=22.5+idx*45;
 const desired=(360-center)%360;
 const current=((rot%360)+360)%360;
 const adjustment=(desired-current+360)%360;
 rot+=360*7+adjustment;
 // Start after the spinning screen has been laid out.
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  wheelElement.style.transitionDuration=reduced?'0.15s':'5.6s';
  wheelElement.style.transform=`rotate(${rot}deg)`;
 }));
 setTimeout(()=>{
  selected=slots[idx];
  document.getElementById('result-emoji').textContent=selected.emoji;
  document.getElementById('prize-title').textContent=selected.code==='try_again'?'فرصة جديدة!':'مبروك!';
  document.getElementById('reward-title').textContent=selected.result;
  document.getElementById('reward-description').textContent=selected.description;
  document.getElementById('claim').textContent=selected.code==='try_again'?'🔄 لف مرة ثانية':'🎁 سجّل لاستلام جائزتك';
  show('prize');busy=false;
  if(selected.code!=='try_again')confetti();
 },reduced?200:5700);
}
document.getElementById('start').addEventListener('click',spin);
document.getElementById('claim').addEventListener('click',()=>{
 if(selected?.code==='try_again'){
  document.getElementById('wheel-home').append(wheelWrap);
  show('welcome');
 } else show('registration');
});
const links=document.getElementById('policy-links');
for(const [key,label] of [['termsUrl','شروط العرض'],['privacyUrl','سياسة الخصوصية']]){
 if(config[key]){
  if(links.childNodes.length)links.append(' · ');
  const a=document.createElement('a');a.href=config[key];a.textContent=label;
  a.target='_blank';a.rel='noopener noreferrer';links.append(a);
 }
}
document.getElementById('lead-form').addEventListener('submit',async event=>{
 event.preventDefault();
 const form=event.currentTarget,button=document.getElementById('submit'),message=document.getElementById('form-message');
 message.textContent='';
 if(!form.reportValidity())return;
 if(!selected||selected.code==='try_again'){message.textContent='لازم تلف العجلة أولًا.';return;}
 if(!config.formEndpoint||!/^https:\/\/script\.google\.com\/macros\/s\//.test(config.formEndpoint)){
  message.textContent='في مشكلة بإعدادات الإرسال. تواصل مع فريق كريدت.';return;
 }
 button.disabled=true;button.textContent='جاري الإرسال…';
 try{
  const body=new URLSearchParams();
  for(const [k,v] of new FormData(form).entries())body.append(k,v);
  body.append('campaign','Qredit Exhibition QR');
  body.append('prize',selected.code);
  // Apps Script cross-origin no-cors response is opaque; delivery is not independently confirmed.
  await fetch(config.formEndpoint,{method:'POST',mode:'no-cors',body});
  show('success');
 }catch(err){
  message.textContent='تعذّر إرسال البيانات. تأكد من الإنترنت وحاول مرة ثانية.';
 }finally{
  button.disabled=false;button.textContent='🎁 تأكيد واستلام الجائزة';
 }
});
