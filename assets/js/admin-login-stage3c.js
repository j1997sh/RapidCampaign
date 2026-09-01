(function(){
'use strict';
const sb=window.cpSupabase;
const form=document.getElementById('adminLoginForm');
const msg=document.getElementById('adminLoginMessage');
const setup=document.getElementById('adminSetup');
const emailEl=document.getElementById('adminEmail');
const passwordEl=document.getElementById('adminPassword');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
async function finishLogin(){
  const ctx=await sb.rpc('rapid_campaign_current_admin_context');
  if(ctx.error) throw ctx.error;
  const row=Array.isArray(ctx.data)?ctx.data[0]:ctx.data;
  if(!row){await sb.auth.signOut();throw new Error('This account does not have Rapid Campaign admin access.');}
  sessionStorage.setItem('cp_admin_org',row.organisation_id);
  location.replace('campaigns.html');
}
form.addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=form.querySelector('button[type=submit]');
  btn.disabled=true; btn.textContent='Signing in…'; msg.innerHTML='';
  try{
    const r=await sb.auth.signInWithPassword({email:emailEl.value.trim(),password:passwordEl.value});
    if(r.error) throw r.error;
    await finishLogin();
  }catch(err){
    msg.innerHTML=`<div class="state-banner error">${esc(err?.message||'Login failed')}</div>`;
    btn.disabled=false; btn.textContent='Log in';
  }
});
setup.addEventListener('click',async()=>{
  const email=emailEl.value.trim(),password=passwordEl.value;
  if(!email||!password){msg.innerHTML='<div class="state-banner error">Enter your email and password first.</div>';return;}
  setup.disabled=true;setup.textContent='Setting up…';msg.innerHTML='';
  try{
    const r=await sb.auth.signUp({email,password});
    if(r.error) throw r.error;
    if(r.data.session&&r.data.user){await finishLogin();}
    else msg.innerHTML='<div class="state-banner success">Account created. Check your email to confirm it, then return here and log in with the same password.</div>';
  }catch(err){msg.innerHTML=`<div class="state-banner error">${esc(err?.message||'Setup failed')}</div>`;}
  finally{setup.disabled=false;setup.textContent='First time? Set up my account';}
});
})();
