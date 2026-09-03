(function(){
  const loadingSelectors=['#centralCampaignsList','#campaignMeta','#adsCampaignMeta'];
  function banner(message){
    let host=document.getElementById('runtimeMessage');
    if(!host){host=document.createElement('div');host.id='runtimeMessage';host.className='rc-runtime-message';const main=document.querySelector('.cp-main')||document.body;main.prepend(host)}
    host.innerHTML=`<div class="state-banner error"><strong>Something didn’t load.</strong><span>${String(message||'Please retry.')}</span><button type="button" class="btn secondary small" onclick="location.reload()">Retry</button></div>`;
  }
  window.addEventListener('error',e=>{if(e?.message)banner(e.message)});
  window.addEventListener('unhandledrejection',e=>banner(e?.reason?.message||'A background request failed.'));
  setTimeout(()=>{
    for(const sel of loadingSelectors){const el=document.querySelector(sel);if(!el)continue;const txt=(el.textContent||'').trim().toLowerCase();if(txt.includes('loading')){banner('The page is taking longer than expected.');break}}
  },12000);
})();
