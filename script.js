const config = window.QREDIT_CONFIG || {};
const sections = ['welcome','prize','registration','success'];
const prizes = [
  {title:'One Free Month', description:'One month of Qredit subscription fees waived.', emoji:'🎟️', code:'free_month'},
  {title:'Chocolate', description:'You won a chocolate treat! Show this result to our booth team.', emoji:'🍫', code:'chocolate'},
  {title:'Try Again', description:'You get another chance! Spin the wheel one more time.', emoji:'🔄', code:'try_again'},
  {title:'Surprise Gift', description:'You won a surprise gift! Visit our booth team to collect it.', emoji:'🎁', code:'gift'}
];
const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('start');
const spinStatus = document.getElementById('spin-status');
let spinning = false, rotation = 0, selectedPrize = null, spins = 0;
function show(id){ sections.forEach(section => document.getElementById(section).classList.toggle('hidden',section!==id)); window.scrollTo({top:0,behavior:'instant'}); }
const links = document.getElementById('policy-links');
for (const [key,label] of [['termsUrl','Offer terms'],['privacyUrl','Privacy notice']]) {
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
  spinning=true;spinButton.disabled=true;spinStatus.textContent='Spinning… good luck!';
  const index=Math.floor(Math.random()*prizes.length);
  // Segments: 0 top-right, 1 bottom-right, 2 bottom-left, 3 top-left.
  // Center angles from 12 o'clock: 45, 135, 225, 315 degrees.
  const center=45+index*90;
  const current=((rotation%360)+360)%360;
  const desired=((360-center)%360);
  const extra=((desired-current+360)%360);
  rotation+=360*(6+Math.floor(Math.random()*3))+extra;
  wheel.style.transform=`rotate(${rotation}deg)`;
  setTimeout(()=>{
    selectedPrize=prizes[index];spinning=false;
    document.getElementById('reward-title').textContent=selectedPrize.title;
    document.getElementById('reward-description').textContent=selectedPrize.description;
    document.getElementById('result-emoji').textContent=selectedPrize.emoji;
    document.getElementById('prize-title').textContent=index===2?'One More Chance!':'You Won!';
    document.getElementById('claim').textContent=index===2?'SPIN AGAIN':'CLAIM YOUR PRIZE';
    show('prize');
    if(index!==2 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)celebrate();
    spinButton.disabled=false;
  },5600);
}
spinButton.addEventListener('click',spin);
document.getElementById('claim').addEventListener('click',()=>{
  if(selectedPrize?.code==='try_again') { spins++;show('welcome');spinStatus.textContent='Another chance — spin again!'; }
  else show('registration');
});
document.getElementById('lead-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const form=event.currentTarget, button=document.getElementById('submit'),message=document.getElementById('form-message');
  message.textContent='';
  if(!form.reportValidity())return;
  if(!selectedPrize || selectedPrize.code==='try_again') {message.textContent='Please spin the wheel first.';return;}
  if(!config.formEndpoint || !/^https:\/\/script\.google\.com\/macros\/s\//.test(config.formEndpoint)){
    message.textContent='The submission endpoint has not been configured. Please contact the booth team.';return;
  }
  button.disabled=true;button.textContent='Submitting…';
  try{
    const body=new URLSearchParams();
    for(const [key,value] of new FormData(form).entries())body.append(key,value);
    body.append('campaign','Qredit Exhibition QR');
    body.append('prize',selectedPrize.code);
    // Apps Script response is opaque in no-cors; successful fetch is not proof of storage.
    await fetch(config.formEndpoint,{method:'POST',mode:'no-cors',body});
    show('success');
    document.querySelector('#success p').textContent=`Your ${selectedPrize.title.toLowerCase()} claim was sent. Our team will verify your details.`;
  }catch(error){message.textContent='Unable to send your request. Check your internet connection and try again.';}
  finally{button.disabled=false;button.textContent='Submit & Claim';}
});
