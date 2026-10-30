/* Quality follows the existing remembered name-login model independently of R&D. */
(function(){
  const fallbackNames=['Navarasu','Mohan'],storageKey='dfabQualityLogin';let gate,members=[],loaded=false;
  const activeNames=()=>loaded?members.filter(x=>x.active!==false).map(x=>x.name):fallbackNames;
  const resolve=value=>activeNames().find(name=>name.toLowerCase()===String(value||'').trim().toLowerCase())||'';
  const clean=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  const distance=(a,b)=>{a=String(a||'');b=String(b||'');const prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let left=i,diag=prev[0];prev[0]=i;for(let j=1;j<=b.length;j++){const up=prev[j],next=Math.min(up+1,left+1,diag+(a[i-1]===b[j-1]?0:1));diag=up;prev[j]=next;left=next}}return prev[b.length]};
  const suggest=value=>{const q=clean(value);if(q.length<2)return'';let best='',score=-Infinity;for(const name of activeNames()){const n=clean(name),d=distance(q,n),m=Math.max(q.length,n.length)||1;let s=(1-d/m)*5;if(n.startsWith(q)||q.startsWith(n))s+=10;if(n.includes(q)||q.includes(n))s+=7;if(s>score){score=s;best=name}}return score>=5?best:''};
  function current(){try{return resolve(JSON.parse(localStorage.getItem(storageKey)||'null')?.name)}catch{return ''}}
  function roleFor(value){const name=resolve(value),row=members.find(x=>x.name.toLowerCase()===String(name).toLowerCase());if(row)return row.role||'member';return String(name).toLowerCase()==='mohan'?'lead':'member'}
  async function refreshMembers(){try{members=await window.rndCloud.loadDepartmentMembers('quality');loaded=true}catch(error){loaded=false;members=[];console.warn('Quality member registry unavailable, using packaged fallback',error)}return activeNames()}
  function login(value){const name=resolve(value);if(!name)throw Error('Wrong / Not authorized');localStorage.setItem(storageKey,JSON.stringify({name}));return name}
  function hide(){if(gate)gate.hidden=true}
  function logout(){localStorage.removeItem(storageKey);localStorage.removeItem('qualityMemberName');localStorage.removeItem('qualityTimeMemberName')}
  async function show(onSuccess){
    await refreshMembers();
    if(!gate){gate=document.createElement('section');gate.id='qualityLoginGate';gate.className='login-gate';gate.setAttribute('aria-label','Quality member login');document.body.append(gate)}gate.hidden=false;
    document.getElementById('appShell').classList.add('app-locked');document.getElementById('loginGate').classList.add('hidden');
    const card=document.querySelector('#loginGate .login-card').cloneNode(true);card.querySelectorAll('[id]').forEach(el=>el.id='quality'+el.id.charAt(0).toUpperCase()+el.id.slice(1));card.querySelector('.login-brand strong').textContent='QUALITY TRACK';card.querySelector('p').textContent='Enter your approved Quality member name. Admin-managed names and roles are loaded from Firebase. You will stay signed in on this device until you log out from Settings.';gate.replaceChildren(card);const input=card.querySelector('input'),message=card.querySelector('.login-message'),suggestion=card.querySelector('#qualityLoginSuggestion');message.textContent='';suggestion.innerHTML='';input.value='';
    card.querySelector('form').onsubmit=event=>{event.preventDefault();message.textContent='';suggestion.innerHTML='';try{login(input.value);hide();onSuccess()}catch(error){message.textContent=error.message;const match=suggest(input.value);if(match){const box=document.createElement('div');box.className='suggestion-box';box.innerHTML='<span>Did you mean <b></b>?</span><button type="button" class="secondary-btn">Yes, use this name</button>';box.querySelector('b').textContent=match;box.querySelector('button').onclick=()=>{login(match);hide();onSuccess()};suggestion.append(box)}}};card.querySelector('#qualityBackToDepartmentsBtn').onclick=()=>{hide();showDepartmentGate()};input.focus();
  }
  window.qualitySession={current,login,logout,show,hide,role:name=>roleFor(name||current()),members:activeNames,refreshMembers};
})();
