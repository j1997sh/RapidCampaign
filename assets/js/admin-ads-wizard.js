(function(){
 let started=false;
 async function init(){
  if(started||!window.CP_ADMIN)return;
  started=true;
  const {sb}=window.CP_ADMIN;
  const $=id=>document.getElementById(id);
  const msg=(t,e=false)=>{$('adsWizardMessage').innerHTML=t?`<div class="state-banner ${e?'error':'success'}">${String(t).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}</div>`:''};
  $('adsWizardForm').onsubmit=async e=>{
   e.preventDefault();
   const title=$('adsTitle').value.trim();
   const landing=$('adsLanding').value.trim();
   const areas=[...new Set($('adsAreas').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean))];
   const audience=$('adsAudiencePattern').value.trim()||'{{area}}AUDIENCE.CSV';
   const budget=Number($('adsBudget').value||10);
   if(!title||!landing||!areas.length)return msg('Campaign name, landing page and at least one area are required.',true);
   const btn=e.submitter;btn.disabled=true;btn.textContent='Creating…';
   try{
    const ctx=await sb.rpc('rapid_campaign_current_admin_context');
    if(ctx.error||!ctx.data?.length)throw new Error(ctx.error?.message||'Not authorised');
    const org=ctx.data[0].organisation_id;
    const r=await sb.rpc('org_admin_create_ads_only_campaign',{p_org:org,p_title:title,p_landing_url:landing,p_areas:areas.map(area=>({area})),p_settings:{audience_pattern:audience,budget}});
    if(r.error)throw r.error;
    const id=r.data;
    const u=await sb.rpc('org_admin_update_facebook_export_settings',{p_rollout:id,p_settings:{campaignPattern:'{{campaign}}',adSetPattern:'{{campaign}} | {{area}}',adPattern:'{{campaign}} | {{area}} | 01',audiencePattern:audience,body:'',headline:'',description:'',budget,country:'GB',special:'ISSUES_ELECTIONS_POLITICS',objective:'Traffic',cta:'LEARN_MORE',pageId:'',baseUrl:landing}});
    if(u.error)throw u.error;
    location.href=`ads-campaign.html?id=${encodeURIComponent(id)}`;
   }catch(err){msg(err.message||String(err),true);btn.disabled=false;btn.textContent='Create ads campaign'}
  };
 }
 const timer=setInterval(()=>{if(window.CP_ADMIN){clearInterval(timer);init()}},100);
 setTimeout(()=>clearInterval(timer),15000);
})();
