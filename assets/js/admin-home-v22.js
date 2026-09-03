(function(){
 let started=false;
 async function init(){
  if(started||!window.CP_ADMIN)return;started=true;
  const {sb}=window.CP_ADMIN,$=id=>document.getElementById(id),list=$('centralCampaignsList'),filter=$('centralCampaignStatusFilter');
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let rows=[];
  const typeOf=r=>{const m=r.package?.settings?.mode;if(m==='ads_only'||r.category==='ads_only')return ['Ads only','ads-campaign.html'];if(m==='landing_page'||r.category==='landing_page')return ['Landing page','landing-campaign.html'];return ['Campaign + website','campaign-overview.html']};
  function draw(){
   if(!list)return;const status=filter?.value||'',shown=rows.filter(x=>!status||x.status===status);
   if(!shown.length){list.innerHTML='<div class="ops-empty"><strong>No campaigns yet</strong><span>Create one above when you’re ready.</span></div>';return;}
   list.innerHTML='<div class="ops-table"><div class="ops-row ops-head"><span>Campaign</span><span>Type</span><span>Status</span><span>Updated</span><span></span></div>'+shown.map(r=>{const [type,page]=typeOf(r),href=`${page}?id=${encodeURIComponent(r.id)}`,updated=r.updated_at?new Date(r.updated_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'';return `<div class="ops-row"><span class="ops-name"><a href="${href}">${esc(r.title)}</a>${r.summary?`<small>${esc(r.summary)}</small>`:''}</span><span>${esc(type)}</span><span>${esc((r.launch_state||r.status||'draft').replaceAll('_',' '))}</span><span>${esc(updated)}</span><span class="ops-actions"><a class="ops-btn" href="${href}">Open</a><button data-dup="${r.id}" type="button">Duplicate</button><button class="danger" data-del="${r.id}" type="button">Delete</button></span></div>`}).join('')+'</div>';
  }
  async function load(){
   list.innerHTML='<div class="ops-loading">Loading campaigns…</div>';
   const c=await sb.rpc('rapid_campaign_current_admin_context');
   if(c.error||!c.data?.length){list.innerHTML='<div class="ops-error"><strong>Campaigns could not be loaded.</strong><button onclick="location.reload()">Retry</button></div>';return;}
   const [r,s]=await Promise.all([sb.rpc('org_admin_central_campaign_rollouts',{p_org:c.data[0].organisation_id}),sb.rpc('rapid_campaign_home_stats')]);
   if(r.error){list.innerHTML=`<div class="ops-error"><strong>Campaigns could not be loaded.</strong><span>${esc(r.error.message)}</span><button onclick="location.reload()">Retry</button></div>`;return;}
   rows=r.data||[];draw();
   if(!s.error&&s.data){$('homeCampaignCount').textContent=s.data.campaigns??0;$('homeLiveCount').textContent=s.data.live_campaigns??0;$('homePageCount').textContent=s.data.local_pages??0;$('homeSupporterCount').textContent=s.data.supporters??0;}
  }
  filter?.addEventListener('change',draw);
  list?.addEventListener('click',async e=>{const dup=e.target.closest('[data-dup]');if(dup){const source=rows.find(x=>x.id===dup.dataset.dup),name=prompt('Name for the duplicate',`${source?.title||'Campaign'} copy`);if(!name)return;const r=await sb.rpc('org_admin_duplicate_central_campaign_rollout',{p_rollout:dup.dataset.dup,p_title:name});if(r.error)return alert(r.error.message);return load()}const del=e.target.closest('[data-del]');if(del){const source=rows.find(x=>x.id===del.dataset.del);if(!confirm(`Delete ${source?.title||'this campaign'}?`))return;const r=await sb.rpc('org_admin_delete_central_campaign_rollout',{p_rollout:del.dataset.del});if(r.error)return alert(r.error.message);return load()}});
  await load();
 }
 if(window.CP_ADMIN)init().catch(console.error);else window.addEventListener('cp-admin-ready',()=>init().catch(console.error),{once:true});
})();
