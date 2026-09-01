(function(){
  let started=false;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  async function init(){
    if(started||!window.CP_ADMIN)return; started=true;
    const {sb,orgId}=window.CP_ADMIN;
    const list=document.getElementById('centralCampaignsList');
    const filter=document.getElementById('centralCampaignStatusFilter');
    const message=document.getElementById('centralCampaignsMessage');
    const campaignCount=document.getElementById('homeCampaignCount');
    const activeCount=document.getElementById('homeActiveCount');
    const pageCount=document.getElementById('homePageCount');
    let rows=[];
    const msg=(t,e=false)=>{message.innerHTML=t?`<div class="state-banner ${e?'error':'success'}">${esc(t)}</div>`:''};
    function render(){
      const f=filter.value;
      const shown=rows.filter(x=>!f||x.status===f);
      campaignCount.textContent=rows.length;
      activeCount.textContent=rows.filter(x=>x.status==='active').length;
      pageCount.textContent=rows.reduce((n,x)=>n+Number(x.site_count||0),0);
      list.innerHTML=shown.length?shown.map(x=>`<article class="rc-campaign-card">
        <div class="rc-campaign-card-visual" style="${x.hero_image?`background-image:linear-gradient(90deg,rgba(5,30,60,.82),rgba(5,30,60,.28)),url('${esc(x.hero_image)}')`:''}">
          <span class="status-chip ${x.status==='active'?'published':'draft'}">${esc(x.status)}</span>
          <div><small>${esc(x.category||'Campaign')}</small><h3>${esc(x.title)}</h3><p>${esc(x.headline||x.summary||'Local campaign rollout')}</p></div>
        </div>
        <div class="rc-campaign-card-foot"><div><strong>${Number(x.site_count||0)}</strong><span>local pages</span></div><div class="rc-card-actions"><a class="btn small" href="campaign.html?id=${encodeURIComponent(x.id)}">Open</a><button class="btn secondary small" data-duplicate="${esc(x.id)}">Duplicate</button><button class="rc-icon-danger" type="button" data-delete="${esc(x.id)}" aria-label="Delete campaign">Delete</button></div></div>
      </article>`).join(''):`<div class="rc-empty-card"><h3>No campaigns yet</h3><p>Create your first campaign and Rapid Campaign will generate the local pages, graphics and Meta workbook.</p><a class="btn" href="campaign-wizard.html">Create campaign</a></div>`;
      document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete this campaign and all of its local pages and supporter records?'))return;const r=await sb.rpc('org_admin_delete_central_campaign_rollout',{p_rollout:b.dataset.delete});if(r.error)return msg(r.error.message,true);await load();});
      document.querySelectorAll('[data-duplicate]').forEach(b=>b.onclick=async()=>{const x=rows.find(r=>r.id===b.dataset.duplicate);const title=prompt('Name for duplicated campaign:',`${x?.title||'Campaign'} copy`);if(!title)return;const r=await sb.rpc('org_admin_duplicate_central_campaign_rollout',{p_rollout:b.dataset.duplicate,p_new_title:title});if(r.error)return msg(r.error.message,true);location.href='campaign.html?id='+encodeURIComponent(r.data);});
    }
    async function load(){
      const r=await sb.rpc('org_admin_central_campaign_rollouts',{p_org:orgId});
      if(r.error){msg(r.error.message,true);return;}
      const base=Array.isArray(r.data)?r.data:[];
      const enriched=await Promise.all(base.map(async x=>{
        const d=await sb.rpc('org_admin_central_campaign_rollout',{p_rollout:x.id});
        const detail=Array.isArray(d.data)?d.data[0]:d.data;
        const sites=Array.isArray(detail?.sites)?detail.sites:[];
        return {...x,site_count:sites.length,headline:x.package?.headline||'',hero_image:x.package?.branding?.hero_image||''};
      }));
      rows=enriched; render();
    }
    filter.onchange=render;
    await load();
  }
  if(window.CP_ADMIN)init().catch(console.error); else window.addEventListener('cp-admin-ready',()=>init().catch(console.error),{once:true});
})();
