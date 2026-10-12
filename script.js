const config = window.QREDIT_CONFIG;
const sections = ['welcome','reveal','prize','registration','success'];
function show(id){ sections.forEach(section => document.getElementById(section).classList.toggle('hidden',section!==id)); window.scrollTo(0,0); }
document.getElementById('reward-title').textContent = config.prizeTitle;
document.getElementById('reward-description').textContent = config.prizeDescription;
const links = document.getElementById('policy-links');
if(config.termsUrl){const a=document.createElement('a');a.href=config.termsUrl;a.textContent='Offer terms';a.target='_blank';a.rel='noopener noreferrer';links.append(a);}
if(config.privacyUrl){if(links.childNodes.length)links.append(' · ');const a=document.createElement('a');a.href=config.privacyUrl;a.textContent='Privacy notice';a.target='_blank';a.rel='noopener noreferrer';links.append(a);}
document.getElementById('start').addEventListener('click',()=>{show('reveal');setTimeout(()=>show('prize'),2800);});
document.getElementById('claim').addEventListener('click',()=>show('registration'));
document.getElementById('lead-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const form=event.currentTarget, button=document.getElementById('submit'),message=document.getElementById('form-message');
  message.textContent='';
  if(!form.reportValidity())return;
  if(!config.formEndpoint || !/^https:\/\/script\.google\.com\/macros\/s\//.test(config.formEndpoint)){
    message.textContent='The submission endpoint has not been configured. Please contact the booth team.';return;
  }
  button.disabled=true;button.textContent='Submitting…';
  try{
    // HTML form POST avoids the CORS preflight that application/json triggers.
    // Apps Script may redirect to a different origin; no-cors makes the response opaque.
    // An opaque response does NOT prove the submission was saved.
    const body=new URLSearchParams();
    for(const [key,value] of new FormData(form).entries())body.append(key,value);
    body.append('campaign','Qredit Exhibition QR');
    await fetch(config.formEndpoint,{method:'POST',mode:'no-cors',body});
    // Cannot verify delivery with no-cors; tell user it was sent, not confirmed.
    show('success');
    document.querySelector('#success p').textContent='Your request was sent. Our team will contact you after verifying your details.';
  }catch(error){message.textContent='Unable to send your request. Check your internet connection and try again.';}
  finally{button.disabled=false;button.textContent='Submit & Claim';}
});
