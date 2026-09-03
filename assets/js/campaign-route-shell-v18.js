(function(){
const id=new URLSearchParams(location.search).get('id')||'';
window.RC_DEDICATED_CAMPAIGN=true;
const routes=['campaign-overview','campaign-build','campaign-creative','campaign-advertise','campaign-people','campaign-setup','campaign-pages','campaign-website','campaign-forms','campaign-overrides','campaign-routing','campaign-graphics','campaign-meta','campaign-supporters','campaign-results','campaign-integrations','campaign-domain','campaign-settings'];
document.querySelectorAll('[data-campaign-route]').forEach(a=>{const base=a.getAttribute('data-campaign-route');a.href=base+'.html?id='+encodeURIComponent(id)});
const current=location.pathname.split('/').pop().replace('.html','');
const groups={'campaign-pages':'campaign-build','campaign-website':'campaign-build','campaign-forms':'campaign-build','campaign-overrides':'campaign-build','campaign-routing':'campaign-build','campaign-graphics':'campaign-creative','campaign-meta':'campaign-advertise','campaign-supporters':'campaign-people','campaign-results':'campaign-people','campaign-integrations':'campaign-setup','campaign-domain':'campaign-setup','campaign-settings':'campaign-setup'};
const active=groups[current]||current;
function installShell(){
  const top=document.querySelector('.v18-topbar');
  if(top&&!top.querySelector('.v23-top-brand')){
    const brand=document.createElement('a');brand.className='v23-top-brand';brand.href='campaigns.html';brand.innerHTML='<span class="mark">RC</span><span>Rapid Campaign</span>';top.prepend(brand);
    top.querySelectorAll('a[href="organisations.html"]').forEach(x=>x.remove());
    const links=top.querySelector('span');
    if(links&&!links.querySelector('a[href="campaign-wizard.html"]')){const n=document.createElement('a');n.href='campaign-wizard.html';n.textContent='New campaign';const logout=links.querySelector('[data-admin-logout]');links.insertBefore(n,logout||null)}
  }
  const work=document.querySelector('.v18-work');
  const head=work?.querySelector('.v18-pagehead');
  if(work&&head&&!work.querySelector('.v23-campaign-nav')){
    const nav=document.createElement('nav');nav.className='v23-campaign-nav';
    [['campaign-overview','Overview'],['campaign-build','Build'],['campaign-creative','Creative'],['campaign-advertise','Advertise'],['campaign-people','People'],['campaign-setup','Setup']].forEach(([r,l])=>{const a=document.createElement('a');a.href=r+'.html?id='+encodeURIComponent(id);a.textContent=l;if(r===active)a.classList.add('active');nav.appendChild(a)});
    head.insertAdjacentElement('afterend',nav);
  }
}
async function hydrate(){if(!window.CP_ADMIN||!id)return;const {sb}=window.CP_ADMIN;const r=await sb.rpc('org_admin_central_campaign_rollout',{p_rollout:id});if(r.error||!r.data)return;const d=r.data,roll=d.rollout||{},sites=d.sites||[];document.querySelectorAll('[data-campaign-name]').forEach(x=>x.textContent=roll.title||'Campaign');document.querySelectorAll('[data-campaign-meta]').forEach(x=>x.textContent=`${sites.length} local page${sites.length===1?'':'s'}`);const mode=roll.package?.settings?.mode||'campaign_website';document.querySelectorAll('[data-mode-label]').forEach(x=>x.textContent=mode==='campaign_website'?'Campaign + website':mode==='ads_only'?'Ads only':'Landing page');const c=document.getElementById('v18OverviewCounts');if(c)c.innerHTML=`<table class="v18-home-table"><thead><tr><th>Local pages</th><th>Live</th><th>Campaign state</th></tr></thead><tbody><tr><td>${sites.length}</td><td>${sites.filter(s=>s.status==='live').length}</td><td>${roll.launch_state||roll.status||'draft'}</td></tr></tbody></table>`;}
document.addEventListener('DOMContentLoaded',()=>{installShell();setTimeout(hydrate,200)});window.addEventListener('cp-admin-ready',()=>{installShell();hydrate()});
})();