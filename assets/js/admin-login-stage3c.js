(function(){
'use strict';
const sb=window.cpSupabase,form=document.getElementById('adminLoginForm'),msg=document.getElementById('adminLoginMessage'),setup=document.getElementById('adminSetup');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
async function enter(user){
 const mr=await sb.from('organisation_memberships').select('organisation_id,role').eq('user_id',user.id).in('role',['global_admin','regional_admin']).limit(1).maybeSingle();
 if(mr.error||!mr.data){await sb.auth.signOut();msg.innerHTML=`<div class="state-banner error">${esc(mr.error?.message||'This account does not have Rapid Campaign admin access.')}</div>`;return false}
 sessionStorage.setItem('cp_admin_org',mr.data.organisation_id);location.href='campaigns.html';return true;
}
form.onsubmit=async e=>{e.preventDefault();const btn=form.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Signing in…';const r=await sb.auth.signInWithPassword({email:adminEmail.value.trim(),password:adminPassword.value});if(r.error){msg.innerHTML=`<div class="state-banner error">${esc(r.error.message)}</div>`;btn.disabled=false;btn.textContent='Log in';return}await enter(r.data.user);btn.disabled=false;btn.textContent='Log in'};
setup.onclick=async()=>{
 const email=adminEmail.value.trim(),password=adminPassword.value;
 if(!email||!password){msg.innerHTML='<div class="state-banner error">Enter your email and password first.</div>';return}
 setup.disabled=true;setup.textContent='Setting up…';
 const r=await sb.auth.signUp({email,password});
 if(r.error){msg.innerHTML=`<div class="state-banner error">${esc(r.error.message)}</div>`;setup.disabled=false;setup.textContent='First time? Set up my account';return}
 if(r.data.session&&r.data.user){await enter(r.data.user)}else{msg.innerHTML='<div class="state-banner success">Account created. Check your email to confirm it, then return here and log in with the same password.</div>'}
 setup.disabled=false;setup.textContent='First time? Set up my account';
};
})();