(function(){
 let started=false;
 async function init(){
  if(started||!window.CP_ADMIN)return;started=true;
  const id=new URLSearchParams(location.search).get('id');if(!id)return;
  const {sb}=window.CP_ADMIN;
  const host=document.querySelector('.ads-hero')||document.querySelector('.hub-heading')||document.querySelector('.cp-main h1')?.parentElement;
  if(!host)return;
  const bar=document.createElement('section');bar.className='rc-launch-control';host.insertAdjacentElement('afterend',bar);
  async function render(){
   const r=await sb.rpc('org_admin_campaign_launch_summary',{p_rollout:id});if(r.error){bar.innerHTML='';return}
   const s=r.data||{},state=s.launch_state||'draft',global=s.role==='global_admin';
   const next=state==='draft'?'ready':state==='ready'?'approved':state==='approved'?'live':'draft';
   const label={draft:'Draft',ready:'Ready for review',approved:'Approved',live:'Live'}[state]||state;
   const action={draft:'Mark ready',ready:'Approve',approved:'Mark live',live:'Return to draft'}[state];
   const disabled=(next==='approved'||next==='live')&&!global;
   bar.innerHTML=`<div><span class="rc-launch-state ${state}">${label}</span><small>${summary(s)}</small></div><div class="rc-launch-actions"><button class="btn ${state==='approved'?'':'secondary'} small" type="button" ${disabled?'disabled':''}>${action}</button></div>`;
   const btn=bar.querySelector('button');btn.onclick=async()=>{if(next==='live'&&!confirm('Mark this campaign live? Website campaigns will become publicly available. Meta Ads remain paused until activated separately.'))return;const u=await sb.rpc('org_admin_set_campaign_launch_state',{p_rollout:id,p_state:next});if(u.error)return alert(u.error.message);await render()};
  }
  await render();
 }
 function summary(s){if(s.mode==='ads_only')return `${s.sites||0} areas · ${s.ads_created||0} Ads created`;return `${s.live_sites||0}/${s.sites||0} local pages ready`}
 if(window.CP_ADMIN)init();else window.addEventListener('cp-admin-ready',init,{once:true});
})();
