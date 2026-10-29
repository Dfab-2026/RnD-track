/* Quality follows the existing remembered name-login model independently of R&D. */
(function(){
  const names=['Navarasu','Mohan'],storageKey='dfabQualityLogin';let gate;
  const resolve=value=>names.find(name=>name.toLowerCase()===String(value||'').trim().toLowerCase())||'';
  function current(){try{return resolve(JSON.parse(localStorage.getItem(storageKey)||'null')?.name)}catch{return ''}}
  function login(value){const name=resolve(value);if(!name)throw Error('Enter Navarasu or Mohan to access Quality.');localStorage.setItem(storageKey,JSON.stringify({name}));return name}
  function hide(){if(gate)gate.hidden=true}
  function logout(){localStorage.removeItem(storageKey);localStorage.removeItem('qualityMemberName');localStorage.removeItem('qualityTimeMemberName')}
  function show(onSuccess){
    if(!gate){gate=document.createElement('section');gate.id='qualityLoginGate';gate.className='login-gate';gate.setAttribute('aria-label','Quality member login');document.body.append(gate)}gate.hidden=false;
    document.getElementById('appShell').classList.add('app-locked');document.getElementById('loginGate').classList.add('hidden');
    const card=document.querySelector('#loginGate .login-card').cloneNode(true);card.querySelectorAll('[id]').forEach(el=>el.id='quality'+el.id.charAt(0).toUpperCase()+el.id.slice(1));card.querySelector('.login-brand strong').textContent='QUALITY TRACK';card.querySelector('p').textContent='Enter the same name saved in the Quality members list: Navarasu or Mohan. You will stay signed in on this device until you log out from Settings.';gate.replaceChildren(card);const input=card.querySelector('input'),message=card.querySelector('.login-message'),suggestion=card.querySelector('#qualityLoginSuggestion');message.textContent='';suggestion.innerHTML='';input.value='';
    card.querySelector('form').onsubmit=event=>{event.preventDefault();message.textContent='';suggestion.innerHTML='';try{login(input.value);hide();onSuccess()}catch(error){message.textContent=error.message;const text=input.value.trim().toLowerCase(),match=text.length>=3?names.find(name=>name.toLowerCase().startsWith(text)||text.startsWith(name.toLowerCase())):null;if(match){const box=document.createElement('div');box.className='suggestion-box';box.innerHTML='<span>Did you mean <b></b>?</span><button type="button" class="secondary-btn">Yes, use this name</button>';box.querySelector('b').textContent=match;box.querySelector('button').onclick=()=>{login(match);hide();onSuccess()};suggestion.append(box)}}};card.querySelector('#qualityBackToDepartmentsBtn').onclick=()=>{hide();showDepartmentGate()};input.focus();
  }
  window.qualitySession={current,login,logout,show,hide};
})();
