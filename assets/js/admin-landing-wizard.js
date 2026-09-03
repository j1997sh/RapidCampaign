(function(){
 let started=false;
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 async function init(){
  if(started||!window.CP_ADMIN)return;started=true;
  const {sb}=window.CP_ADMIN,$=id=>document.getElementById(id),list=$('landingTemplates'),form=$('landingWizardForm'),msg=$('landingWizardMessage');
  const templates=await sb.rpc('org_admin_campaign_templates');
  if(!templates.error){
   const useful=(templates.data||[]).filter(t=>['Petition','Survey','Volunteer','Issue','Launch'].includes(t.category)||['Petition','Survey','Volunteer recruitment','Issue campaign','Candidate launch'].includes(t.name)).slice(0,6);
   list.insertAdjacentHTML('beforeend',useful.map(t=>`<label class="landing-template-option"><input type="radio" name="landingTemplate" value="${t.id}"><strong>${esc(t.name)}</strong><small>${esc(t.description||'Use this campaign structure.')}</small></label>`).join(''));
  }
  list.addEventListener('change',()=>{list.querySelectorAll('.landing-template-option').forEach(x=>x.classList.toggle('selected',x.querySelector('input')?.checked))});
  form.addEventListener('submit',async e=>{
   e.preventDefault();const title=$('landingTitle').value.trim();if(!title)return;
   const btn=form.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Creating…';msg.innerHTML='';
   try{
    const ctx=await sb.rpc('rapid_campaign_current_admin_context');if(ctx.error||!ctx.data?.length)throw new Error(ctx.error?.message||'No organisation selected.');
    const tid=form.querySelector('input[name=landingTemplate]:checked')?.value||null;
    const r=await sb.rpc('org_admin_create_landing_page_campaign',{p_org:ctx.data[0].organisation_id,p_title:title,p_template:tid||null});
    if(r.error)throw r.error;location.href=`landing-campaign.html?id=${encodeURIComponent(r.data)}`;
   }catch(err){msg.innerHTML=`<div class="state-banner error">${esc(err.message||String(err))}</div>`;btn.disabled=false;btn.textContent='Create landing page'}
  });
 }
 if(window.CP_ADMIN)init();else window.addEventListener('cp-admin-ready',init,{once:true});
})();
