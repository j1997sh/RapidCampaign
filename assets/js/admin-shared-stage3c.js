(async function(){
'use strict';
const sb=window.cpSupabase;
try{
  const {data:{session},error:sessionError}=await sb.auth.getSession();
  if(sessionError) throw sessionError;
  if(!session){location.replace('login.html');return;}
  const ctx=await sb.rpc('rapid_campaign_current_admin_context');
  if(ctx.error) throw ctx.error;
  const membership=Array.isArray(ctx.data)?ctx.data[0]:ctx.data;
  if(!membership){await sb.auth.signOut();location.replace('login.html');return;}
  const org=membership.organisation_id;
  sessionStorage.setItem('cp_admin_org',org);
  window.CP_ADMIN={sb,orgId:org,role:membership.role,orgName:membership.organisation_name||'Rapid Campaign'};
  document.querySelectorAll('[data-admin-org-name]').forEach(x=>x.textContent=window.CP_ADMIN.orgName);
  const badge=document.getElementById('adminRoleBadge');if(badge)badge.textContent=membership.role==='global_admin'?'Global admin':'Regional admin';
  document.querySelectorAll('.admin-nav a').forEach(a=>a.classList.toggle('active',a.dataset.adminNav===window.CP_ADMIN_ACTIVE));
  const logout=document.getElementById('adminLogout');if(logout)logout.onclick=async()=>{await sb.auth.signOut();sessionStorage.removeItem('cp_admin_org');location.replace('login.html')};
  window.dispatchEvent(new CustomEvent('cp-admin-ready',{detail:window.CP_ADMIN}));
}catch(err){
  console.error('Rapid Campaign admin bootstrap failed',err);
  const target=document.querySelector('.admin-content')||document.body;
  const d=document.createElement('div');d.className='state-banner error';d.textContent=err?.message||'Could not load Rapid Campaign admin.';target.prepend(d);
}
})();
