(function(){
let started=false;
async function init(){
 if(started||!window.CP_ADMIN)return;started=true;
 const {sb}=window.CP_ADMIN,$=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 let cache=[],bulkResults=[];
 const msg=(t,e=false)=>$('adminGeographyMessage').innerHTML=t?`<div class="state-banner ${e?'error':'success'}">${esc(t)}</div>`:'';
 const normalise=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
 const format=s=>{const p=normalise(s);return p.length>3?`${p.slice(0,-3)} ${p.slice(-3)}`:p};
 async function invoke(postcodes){const clean=[...new Set(postcodes.map(format).filter(Boolean))];if(!clean.length)return {results:[],errors:[]};const {data,error}=await sb.functions.invoke('postcode-lookup',{body:{postcodes:clean}});if(error)throw new Error(error.message||'Postcode lookup failed');if(data?.error)throw new Error(data.error);return data||{results:[],errors:[]}}
 function renderResult(box,r){box.innerHTML=r?`<div class="geo-result-card" style="margin-top:14px"><h3>${esc(r.postcode)}</h3><div class="geo-result-grid"><div><span>Parliamentary constituency</span><strong>${esc(r.parliamentary_constituency||'—')}</strong></div><div><span>Ward</span><strong>${esc(r.ward||'—')}</strong></div><div><span>Local authority</span><strong>${esc(r.local_authority||'—')}</strong></div><div><span>Region</span><strong>${esc(r.region||'—')}</strong></div></div></div>`:''}
 function renderTable(){const q=$('geoSearch').value.trim().toLowerCase(),rows=cache.filter(r=>!q||[r.postcode,r.parliamentary_constituency,r.ward,r.local_authority,r.region].some(v=>String(v||'').toLowerCase().includes(q)));$('geoTableBody').innerHTML=rows.length?rows.slice(0,300).map(r=>`<tr><td><strong>${esc(r.postcode)}</strong></td><td>${esc(r.parliamentary_constituency||'—')}</td><td>${esc(r.ward||'—')}</td><td>${esc(r.local_authority||'—')}</td><td>${esc(r.region||'—')}</td></tr>`).join(''):'<tr><td colspan="5" class="muted">No cached postcode geography yet.</td></tr>'}
 function renderKpis(){$('geoCached').textContent=cache.length;$('geoConstituencies').textContent=new Set(cache.map(r=>r.parliamentary_constituency).filter(Boolean)).size;$('geoWards').textContent=new Set(cache.map(r=>r.ward).filter(Boolean)).size;$('geoAuthorities').textContent=new Set(cache.map(r=>r.local_authority).filter(Boolean)).size}
 async function loadCache(){const {data,error}=await sb.from('postcode_geography_cache').select('postcode,postcode_compact,parliamentary_constituency,ward,local_authority,region,resolved_at').order('resolved_at',{ascending:false}).limit(1000);if(error)throw error;cache=data||[];renderKpis();renderTable()}
 $('geoLookup').onclick=async()=>{const pc=$('geoPostcode').value.trim();if(!pc)return;const b=$('geoLookup');b.disabled=true;b.textContent='Looking up…';msg('');try{const d=await invoke([pc]);const r=d.results?.[0];if(!r){renderResult($('geoSingleResult'),null);msg('That postcode could not be resolved.',true)}else{renderResult($('geoSingleResult'),r);await loadCache()}}catch(e){msg(e.message,true)}finally{b.disabled=false;b.textContent='Look up'}};
 $('geoPostcode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('geoLookup').click()}});
 $('geoBulkLookup').onclick=async()=>{const pcs=$('geoBulkInput').value.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean);if(!pcs.length)return;const b=$('geoBulkLookup');b.disabled=true;b.textContent='Resolving…';msg('');try{const d=await invoke(pcs);bulkResults=d.results||[];$('geoBulkSummary').textContent=`${bulkResults.length} resolved${d.errors?.length?` · ${d.errors.length} not found`:''}.`;$('geoBulkDownload').disabled=!bulkResults.length;await loadCache()}catch(e){msg(e.message,true)}finally{b.disabled=false;b.textContent='Resolve postcodes'}};
 $('geoBulkDownload').onclick=()=>{if(!bulkResults.length)return;const cols=['postcode','parliamentary_constituency','ward','local_authority','region','latitude','longitude'],csv=[cols.join(','),...bulkResults.map(r=>cols.map(k=>`"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\r\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='rapid-campaign-postcode-geography.csv';a.click();URL.revokeObjectURL(a.href)};
 $('geoSearch').oninput=renderTable;
 try{await loadCache()}catch(e){msg(e.message,true)}
}
if(window.CP_ADMIN)init().catch(console.error);else window.addEventListener('cp-admin-ready',()=>init().catch(console.error),{once:true});
})();
