(function(){
 let started=false;
 async function init(){
  if(started||!window.CP_ADMIN)return;started=true;
  const {sb}=window.CP_ADMIN;
  const r=await sb.rpc('rapid_campaign_available_organisations');
  if(r.error||!Array.isArray(r.data)||!r.data.length)return;
  const items=r.data; let active=items.find(x=>x.is_active)||items[0];
  const host=document.querySelector('.cp-sidebar'); if(!host)return;
  const block=document.createElement('div');block.className='rc-org-switcher';
  block.innerHTML=`<label>Organisation<select id="rcOrganisationSelect">${items.map(x=>`<option value="${x.organisation_id}" ${x.organisation_id===active.organisation_id?'selected':''}>${escapeHtml(x.organisation_name)}</option>`).join('')}</select></label><button id="rcNewOrganisation" type="button">New organisation</button><a class="rc-org-manage" href="organisations.html">Manage organisations</a>`;
  const bottom=host.querySelector('.cp-sidebar-bottom'); host.insertBefore(block,bottom||null);
  block.querySelector('#rcOrganisationSelect').onchange=async e=>{const s=await sb.rpc('rapid_campaign_set_active_organisation',{p_org:e.target.value});if(s.error)return alert(s.error.message);location.href='campaigns.html'};
  block.querySelector('#rcNewOrganisation').onclick=async()=>{const name=prompt('Organisation name');if(!name?.trim())return;const c=await sb.rpc('rapid_campaign_create_organisation',{p_name:name.trim()});if(c.error)return alert(c.error.message);location.href='campaigns.html'};
 }
 function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
 if(window.CP_ADMIN)init();else window.addEventListener('cp-admin-ready',init,{once:true});
})();
