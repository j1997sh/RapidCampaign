
(function(){
let started=false;
async function init(){
 if(started||!window.CP_ADMIN)return;
 started=true;
 const {sb,orgId}=window.CP_ADMIN;const byId=id=>document.getElementById(id);const centralCampaignTitle=byId('centralCampaignTitle');const centralCampaignMeta=byId('centralCampaignMeta');const centralCampaignMessage=byId('centralCampaignMessage');const downloadCentralCampaignTemplate=byId('downloadCentralCampaignTemplate');const centralCampaignCsv=byId('centralCampaignCsv');const editCentralCampaignMaster=byId('editCentralCampaignMaster');const duplicateCentralCampaignRollout=byId('duplicateCentralCampaignRollout');const exportCentralCampaignSupporters=byId('exportCentralCampaignSupporters');const manageCentralCampaignCreatives=byId('manageCentralCampaignCreatives');const createFacebookAds=byId('createFacebookAds');const deleteCentralCampaignRollout=byId('deleteCentralCampaignRollout');const centralCampaignKpis=byId('centralCampaignKpis');const openFacebookSetup=byId('openFacebookSetup');const campaignReadiness=byId('campaignReadiness');const centralCampaignRolloutState=byId('centralCampaignRolloutState');const bulkPublishCentralSites=byId('bulkPublishCentralSites');const bulkDraftCentralSites=byId('bulkDraftCentralSites');const pauseCentralCampaign=byId('pauseCentralCampaign');const pauseCentralCampaignLabel=byId('pauseCentralCampaignLabel');const pauseCentralCampaignCopy=byId('pauseCentralCampaignCopy');const endCentralCampaign=byId('endCentralCampaign');const archiveCentralCampaign=byId('archiveCentralCampaign');const centralSiteSearch=byId('centralSiteSearch');const centralSiteStatusFilter=byId('centralSiteStatusFilter');const centralCampaignSites=byId('centralCampaignSites');const centralTopAreas=byId('centralTopAreas');const centralBottomAreas=byId('centralBottomAreas');const centralCampaignSupporters=byId('centralCampaignSupporters');const centralCampaignPreviewPanel=byId('centralCampaignPreviewPanel');const centralCampaignPreviewLabel=byId('centralCampaignPreviewLabel');const closeCentralCampaignPreview=byId('closeCentralCampaignPreview');const centralCampaignPreviewFrame=byId('centralCampaignPreviewFrame');const facebookAdsDialog=byId('facebookAdsDialog');const facebookAdsForm=byId('facebookAdsForm');const fbCampaignPattern=byId('fbCampaignPattern');const fbAdSetPattern=byId('fbAdSetPattern');const fbAdPattern=byId('fbAdPattern');const fbObjective=byId('fbObjective');const fbCta=byId('fbCta');const fbBody=byId('fbBody');const fbHeadline=byId('fbHeadline');const fbBudgetLevel=byId('fbBudgetLevel');const fbDailyBudget=byId('fbDailyBudget');const fbStart=byId('fbStart');const fbEnd=byId('fbEnd');const fbPageId=byId('fbPageId');const fbBaseUrl=byId('fbBaseUrl');const fbCountry=byId('fbCountry');const fbSpecialCategory=byId('fbSpecialCategory');const fbImagePattern=byId('fbImagePattern');const fbAudiencePattern=byId('fbAudiencePattern');const fbAudienceMap=byId('fbAudienceMap');const facebookSettingsMessage=byId('facebookSettingsMessage');const facebookAdsPreflight=byId('facebookAdsPreflight');const saveFacebookSettings=byId('saveFacebookSettings');const downloadAudienceNamingSheet=byId('downloadAudienceNamingSheet');const previewFacebookAds=byId('previewFacebookAds');const centralMasterDialog=byId('centralMasterDialog');const centralMasterForm=byId('centralMasterForm');const centralMasterTitle=byId('centralMasterTitle');const centralMasterCategory=byId('centralMasterCategory');const centralMasterSummary=byId('centralMasterSummary');const centralMasterHeadline=byId('centralMasterHeadline');const centralMasterCopy=byId('centralMasterCopy');const centralMasterPoints=byId('centralMasterPoints');const centralMasterApply=byId('centralMasterApply');
 const id=new URLSearchParams(location.search).get('id');
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const msg=(t,e=false)=>centralCampaignMessage.innerHTML=t?`<div class="state-banner ${e?'error':'success'}">${esc(t)}</div>`:'';
 let data=null,supporters=[],performance=[],creatives=[];

 function parseCSV(text){
   const rows=[];let row=[],field='',q=false;
   for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'){if(q&&n==='"'){field+='"';i++}else q=!q}else if(c===','&&!q){row.push(field);field=''}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&n==='\n')i++;row.push(field);field='';if(row.some(v=>v.trim()!==''))rows.push(row);row=[]}else field+=c}
   if(field.length||row.length){row.push(field);if(row.some(v=>v.trim()!==''))rows.push(row)}
   if(rows.length<2)return [];
   const heads=rows[0].map(x=>x.trim().toLowerCase());
   return rows.slice(1).map(r=>Object.fromEntries(heads.map((h,i)=>[h,(r[i]||'').trim()])));
 }
 function toRows(rows){
   return rows.map(x=>({
    area:x.area||x.place||x.ward||x.constituency||'',
    council:x.council||'',
    region:x.region||'',
    postcode:x.postcode||'',
    slug:x.slug||x.site_slug||'',
    domain:x.domain||'',
    title:x.title||'',
    headline:x.headline||'',
    supporting_copy:x.supporting_copy||x.copy||'',
    key_points:(x.key_points||'').split('|').map(v=>v.trim()).filter(Boolean)
   }));
 }

 function render(){
   const r=data.rollout,s=data.summary||{},allSites=data.sites||[],q=(centralSiteSearch?.value||'').toLowerCase(),sf=centralSiteStatusFilter?.value||'',sites=allSites.filter(x=>(!sf||x.status===sf)&&(!q||(`${x.area} ${x.slug} ${x.council||''}`).toLowerCase().includes(q)));
   centralCampaignTitle.textContent=r.title;
   if(window.manageCentralCampaignCreatives)manageCentralCampaignCreatives.href='creatives.html?rollout='+encodeURIComponent(id);
   centralCampaignMeta.textContent=[r.category,r.status].filter(Boolean).join(' · ');
   if(window.centralCampaignRolloutState)centralCampaignRolloutState.innerHTML=`<span class="status-chip ${r.status==='active'?'published':'draft'}">${esc(r.status)}</span>`;
  const paused=r.status==='paused',finalState=['ended','archived'].includes(r.status);
  pauseCentralCampaignLabel.textContent=paused?'Resume campaign':'Pause campaign';
  pauseCentralCampaignCopy.textContent=paused?'Return the campaign to active operation.':'Pause the campaign and live sites.';
  pauseCentralCampaign.disabled=finalState;
  bulkPublishCentralSites.disabled=finalState;
  bulkDraftCentralSites.disabled=finalState;
  endCentralCampaign.disabled=finalState;
  archiveCentralCampaign.disabled=r.status==='archived';
   centralCampaignKpis.innerHTML=[['Localised sites',s.sites||0],['Draft',s.draft||0],['Live',s.live||0],['Supporters',s.supporters||0]].map(x=>`<div class="admin-kpi"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
   centralCampaignSites.innerHTML=sites.length?`<div class="performance-table-wrap"><table class="performance-table central-campaign-sites-table"><thead><tr><th>Area</th><th>Slug</th><th>Domain</th><th>Status</th><th></th></tr></thead><tbody>${sites.map(s=>`<tr><td><strong>${esc(s.area)}</strong><small>${esc([s.council,s.region].filter(Boolean).join(' · '))}</small></td><td><code>${esc(s.slug)}</code></td><td>${esc(s.domain||'—')}</td><td><span class="status-chip ${s.status==='live'?'published':'draft'}">${esc(s.status)}</span><small>${Number(s.supporters||0)} supporter${Number(s.supporters||0)===1?'':'s'}</small></td><td><div class="button-row"><button class="btn light small" data-preview="${s.id}">Preview</button>${s.status==='draft'?`<button class="btn secondary small" data-site-status="${s.id}" data-to="live">Mark live</button>`:s.status==='live'?`<button class="btn secondary small" data-site-status="${s.id}" data-to="draft">Return to draft</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>`:'<div class="workspace-empty-state"><div><h3>No localised sites yet</h3><p>Upload a CSV of areas to generate centrally managed campaign microsites.</p></div></div>';
   centralCampaignSupporters.innerHTML=supporters.length?supporters.map(x=>`<tr><td><strong>${esc([x.first_name,x.last_name].filter(Boolean).join(' ')||'Unnamed')}</strong><small>${esc(x.email||x.phone||'')}</small></td><td>${esc(x.area||'—')}</td><td>${esc(x.postcode||'—')}</td><td>${x.consent_email?'Opted in':'Not opted in'}</td><td><div class="admin-journey-tags">${(x.tags||[]).slice(0,5).map(tag=>`<span class="admin-tag">${esc(tag)}</span>`).join('')}</div></td><td>${new Date(x.created_at).toLocaleDateString()}</td></tr>`).join(''):'<tr><td colspan="6" class="muted">No supporters captured yet.</td></tr>';
   const sorted=[...performance].sort((a,b)=>Number(b.supporters)-Number(a.supporters));const prow=x=>`<div class="stage13-performance-row"><span><strong>${esc(x.area)}</strong><small>${esc(x.status)}</small></span><b>${Number(x.supporters)} supporters</b></div>`;if(window.centralTopAreas){centralTopAreas.innerHTML=sorted.slice(0,5).map(prow).join('')||'<p class="muted">No data yet.</p>';centralBottomAreas.innerHTML=[...sorted].reverse().slice(0,5).map(prow).join('')||'<p class="muted">No data yet.</p>';}
   document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>preview(sites.find(x=>x.id===b.dataset.preview)));
   document.querySelectorAll('[data-site-status]').forEach(b=>b.onclick=async()=>{const rr=await sb.rpc('org_admin_set_central_campaign_site_status',{p_site:b.dataset.siteStatus,p_status:b.dataset.to});if(rr.error)return msg(rr.error.message,true);await load()});
   if(typeof renderReadiness==='function')renderReadiness();
 }
 function preview(s){
   if(!s)return;
   const b=s.branding||{},navy=b.primary||'#08254a',blue=b.secondary||'#1476d4',points=Array.isArray(s.key_points)?s.key_points:[];
   const doc=centralCampaignPreviewFrame.contentDocument;
   doc.open();doc.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;font-family:"Proxima Nova","Avenir Next",Arial,sans-serif;color:${navy}}.wrap{width:min(1060px,calc(100% - 40px));margin:auto}.nav{padding:20px 0;font-weight:900}.hero{background:linear-gradient(120deg,${navy},#24496f);color:white;padding:100px 0 84px}.hero h1{font-size:68px;line-height:.94;letter-spacing:-.05em;max-width:850px;margin:0 0 18px}.hero p{max-width:720px;font-size:20px;line-height:1.45}.btn{display:inline-block;background:${blue};padding:14px 18px;color:white;font-weight:900}.section{padding:64px 0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{border:1px solid #d7e0e8;padding:22px}.area{color:#6f8091;font-weight:800}@media(max-width:700px){.hero h1{font-size:44px}.grid{grid-template-columns:1fr}}</style></head><body><div class="nav"><div class="wrap">${esc(data.rollout.title)}</div></div><section class="hero"><div class="wrap"><div class="area">${esc(s.area)}</div><h1>${esc(s.headline||s.title)}</h1><p>${esc(s.supporting_copy||'')}</p><span class="btn">Back this campaign</span></div></section><section class="section"><div class="wrap"><div class="grid">${points.map(p=>`<div class="card"><strong>${esc(typeof p==='string'?p:p.title||'')}</strong></div>`).join('')}</div></div></section><section class="section alt"><div class="wrap"><h2>Back the campaign</h2><p class="lead">Add your name to support this campaign in ${esc(s.area)}.</p><form id="supportForm" style="max-width:680px;display:grid;grid-template-columns:1fr 1fr;gap:12px"><input name="first_name" placeholder="First name" style="padding:12px;border:1px solid #ccd8e3"><input name="last_name" placeholder="Last name" style="padding:12px;border:1px solid #ccd8e3"><input name="email" type="email" placeholder="Email address" style="padding:12px;border:1px solid #ccd8e3"><input name="postcode" placeholder="Postcode" style="padding:12px;border:1px solid #ccd8e3"><label style="grid-column:1/-1"><input name="consent" type="checkbox"> Keep me updated by email</label><button class="btn" type="submit" style="border:0;cursor:pointer">Back this campaign</button><div id="supportMsg" style="align-self:center;font-weight:800"></div></form></div></section></body></html>`);doc.close();
   const form=doc.getElementById('supportForm');
   if(form)form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form);const rr=await sb.rpc('public_central_campaign_support',{p_site:s.id,p_first_name:String(fd.get('first_name')||''),p_last_name:String(fd.get('last_name')||''),p_email:String(fd.get('email')||''),p_phone:'',p_postcode:String(fd.get('postcode')||''),p_consent_email:fd.get('consent')==='on',p_attribution:{source:'hq-preview',campaign:data.rollout.title,area:s.area}});const m=doc.getElementById('supportMsg');if(rr.error){m.textContent=rr.error.message;return}m.textContent='Thank you — your support has been recorded.';form.reset();await load()};
   centralCampaignPreviewLabel.textContent=`${s.area} · ${s.slug}`;
   centralCampaignPreviewPanel.hidden=false;
   centralCampaignPreviewPanel.scrollIntoView({behavior:'smooth',block:'start'});
 }
 async function load(){
   if(!id)return msg('Missing campaign ID. Return to Campaigns and open a campaign again.',true);
   const [r,sr,pr,ar,cr]=await Promise.all([
     sb.rpc('org_admin_central_campaign_rollout',{p_rollout:id}),
     sb.rpc('org_admin_central_campaign_supporters',{p_rollout:id}),
     sb.rpc('org_admin_central_campaign_rollout_performance',{p_rollout:id}),
     sb.rpc('org_admin_facebook_audiences',{p_org:orgId}),
     sb.rpc('org_admin_facebook_creatives',{p_rollout:id})
   ]);
   const error=r.error||sr.error||pr.error||ar.error||cr.error;
   if(error)return msg(error.message,true);
   data=r.data;supporters=sr.data||[];performance=pr.data||[];creatives=cr.data||[];
   facebookAudienceRefs=new Map();applyStoredFacebookAudiences(ar.data||[]);render();
 }
 downloadCentralCampaignTemplate.onclick=()=>{
   const csv='area,council,region,postcode,slug,domain,title,headline,supporting_copy,key_points\nChelmsford,Chelmsford City Council,East of England,CM1 1AA,stopthetaxinchelmsford,,Stop the Tax in Chelmsford,Stop the tax rise in Chelmsford,Back our campaign to stop the proposed tax rise.,Protect household budgets|Demand value for money|Back local services\nBasildon,Basildon Borough Council,East of England,SS14 1AA,stopthetaxinbasildon,,Stop the Tax in Basildon,Stop the tax rise in Basildon,Back our campaign to stop the proposed tax rise.,Protect household budgets|Demand value for money|Back local services\n';
   const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='central-campaign-localised-sites-template.csv';a.click();URL.revokeObjectURL(a.href);
 };
 centralCampaignCsv.onchange=async()=>{
   const f=centralCampaignCsv.files?.[0];if(!f)return;
   const rows=toRows(parseCSV(await f.text()));
   if(!rows.length)return msg('No valid CSV rows found.',true);
   const r=await sb.rpc('org_admin_import_central_campaign_sites',{p_rollout:id,p_rows:rows});
   if(r.error)return msg(r.error.message,true);
   msg(`${r.data.created} localised campaign site${r.data.created===1?'':'s'} created.${r.data.errors?` ${r.data.errors} row${r.data.errors===1?'':'s'} failed.`:''}`,!!r.data.errors);
   centralCampaignCsv.value='';await load();
 };
 centralSiteSearch.oninput=render;centralSiteStatusFilter.onchange=render;
 const bulk=async(status,label)=>{if(!confirm(`${label} every localised microsite?`))return;const r=await sb.rpc('org_admin_bulk_set_central_campaign_sites',{p_rollout:id,p_status:status});if(r.error)return msg(r.error.message,true);msg(`${r.data} microsite${Number(r.data)===1?'':'s'} updated.`);await load()};
 bulkPublishCentralSites.onclick=()=>bulk('live','Publish');bulkDraftCentralSites.onclick=()=>bulk('draft','Return to draft');
 pauseCentralCampaign.onclick=async()=>{const resume=data?.rollout?.status==='paused',next=resume?'active':'paused',question=resume?'Resume this campaign?':'Pause this campaign and its live microsites?';if(!confirm(question))return;const r=await sb.rpc('org_admin_set_central_campaign_rollout_status',{p_rollout:id,p_status:next});if(r.error)return msg(r.error.message,true);msg(resume?'Campaign resumed.':'Campaign paused.');await load()};
 endCentralCampaign.onclick=async()=>{if(!confirm('End this campaign? Historic supporter data will be retained.'))return;const r=await sb.rpc('org_admin_set_central_campaign_rollout_status',{p_rollout:id,p_status:'ended'});if(r.error)return msg(r.error.message,true);msg('Campaign ended. Historic data has been retained.');await load()};
 archiveCentralCampaign.onclick=async()=>{if(!confirm('Archive this campaign? Its microsites and historic supporter data will be retained.'))return;const r=await sb.rpc('org_admin_set_central_campaign_rollout_status',{p_rollout:id,p_status:'archived'});if(r.error)return msg(r.error.message,true);msg('Campaign archived.');await load()};
 editCentralCampaignMaster.onclick=()=>{const r=data.rollout,p=r.package||{};centralMasterTitle.value=r.title||'';centralMasterCategory.value=r.category||'';centralMasterSummary.value=r.summary||'';centralMasterHeadline.value=p.headline||'';centralMasterCopy.value=p.supporting_copy||'';centralMasterPoints.value=(p.key_points||[]).map(x=>typeof x==='string'?x:x.title||'').join('\n');centralMasterDialog.showModal()};
 document.querySelectorAll('[data-close-central-master]').forEach(x=>x.onclick=()=>centralMasterDialog.close());
 centralMasterForm.onsubmit=async e=>{e.preventDefault();const r=await sb.rpc('org_admin_update_central_campaign_master',{p_rollout:id,p_title:centralMasterTitle.value.trim(),p_category:centralMasterCategory.value.trim(),p_summary:centralMasterSummary.value.trim(),p_headline:centralMasterHeadline.value.trim(),p_supporting_copy:centralMasterCopy.value.trim(),p_key_points:centralMasterPoints.value.split('\n').map(x=>x.trim()).filter(Boolean),p_apply_to_sites:centralMasterApply.checked});if(r.error)return msg(r.error.message,true);centralMasterDialog.close();msg(centralMasterApply.checked?`${r.data.sites_updated} localised microsites updated from the master campaign.`:'Master campaign updated.');await load()};
 duplicateCentralCampaignRollout.onclick=async()=>{const title=prompt('Name for the duplicated campaign:',`${data.rollout.title} copy`);if(!title)return;const r=await sb.rpc('org_admin_duplicate_central_campaign_rollout',{p_rollout:id,p_new_title:title});if(r.error)return msg(r.error.message,true);location.href='campaign.html?id='+encodeURIComponent(r.data)};
 exportCentralCampaignSupporters.onclick=()=>{const heads=['first_name','last_name','email','phone','postcode','area','consent_email','source','tags','created_at'],cell=v=>`"${String(v??'').replace(/"/g,'""')}"`,csv=[heads.join(','),...supporters.map(x=>heads.map(k=>cell(k==='tags'?(x.tags||[]).join('|'):x[k])).join(','))].join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`${(data.rollout.title||'campaign').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-supporters.csv`;a.click();URL.revokeObjectURL(a.href)};

 const META_ADS_HEADERS=["Campaign ID","Campaign Name","Campaign Status","Special Ad Categories","Special Ad Category Country","Campaign Objective","Buying Type","Campaign Spend Limit","Campaign Daily Budget","Campaign Lifetime Budget","Campaign Bid Strategy","Tags","Campaign Is Using L3 Schedule","Campaign Start Time","Campaign Stop Time","Ad Set ID","Ad Set Run Status","Ad Set Name","Ad Set Time Start","Ad Set Time Stop","Ad Set Daily Budget","Ad Set Lifetime Budget","Link Object ID","Link","Application ID","Countries","Global Regions","Excluded Global Regions","Cities","Regions","Zip","Gender","Age Min","Age Max","Education Status","College Start Year","College End Year","Interested In","Relationship","Connections","Excluded Connections","Friends of Connections","Locales","Broad Category Clusters","Custom Audiences","Excluded Custom Audiences","Location Cluster IDs","Excluded Location Cluster IDs","Publisher Platforms","Device Platforms","Facebook Positions","Instagram Positions","Messenger Positions","Oculus Positions","Audience Network Positions","Optimization Goal","Billing Event","Bid Amount","Ad Set Bid Strategy","Beneficiary (financial ads in Taiwan)","Payer (financial ads in Taiwan)","Advertiser (Taiwan)","Payer (Taiwan)","Advertiser (financial ads in Australia)","Payer (financial ads in Australia)","Advertiser (Singapore)","Payer (Singapore)","Minimum ROAS","Ad Set Minimum Spend Limit","Ad Set Maximum Spend Limit","Advertiser (securities ads in India)","Payer (securities ads in India)","Beneficiary (selected locations)","Payer (selected locations)","Large Geo Areas","Excluded Large Geo Areas","Medium Geo Areas","Excluded Medium Geo Areas","Small Geo Areas","Excluded Small Geo Areas","Metro Areas","Excluded Metro Areas","Subcities","Excluded Subcities","Neighborhoods","Excluded Neighborhoods","Subneighborhoods","Excluded Subneighborhoods","Ad ID","Ad Status","Ad Name","Title","Body","Link Description","Display Link","Image Hash","Creative Type","URL Tags","Image File Name","Creative Optimization","Product 1 - Link","Product 1 - Name","Product 1 - Description","Product 1 - Image Hash","Product 2 - Link","Product 2 - Name","Product 2 - Description","Product 2 - Image Hash","Product 3 - Link","Product 3 - Name","Product 3 - Description","Product 3 - Image Hash","Call to Action","Story ID"];
 let facebookAudienceRefs=new Map(),storedFacebookAudiences=[];
 const areaKey=s=>String(s||'').normalize('NFKD').replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
 const applyPattern=(pattern,site)=>String(pattern||'').replaceAll('{{AREA_KEY}}',areaKey(site.area).toUpperCase()).replaceAll('{{area_key}}',areaKey(site.area)).replaceAll('{{area}}',site.area||'').replaceAll('{{slug}}',site.slug||'');
 const applyMetaPattern=(pattern,site,settings,audience='')=>applyPattern(String(pattern||'').replaceAll('{{campaign}}',settings.campaignBase||'Campaign').replaceAll('{{objective}}',settings.objective||'').replaceAll('{{audience}}',audience||''),site).replace(/\s*\|\s*\|\s*/g,' | ').replace(/^\s*\|\s*|\s*\|\s*$/g,'').trim();
 const fbDate=v=>{if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return'';const z=n=>String(n).padStart(2,'0');return `${z(d.getMonth()+1)}/${z(d.getDate())}/${String(d.getFullYear()).slice(-2)} ${z(d.getHours())}:${z(d.getMinutes())}`;};
 const csvCell=v=>`"${String(v??'').replace(/"/g,'""')}"`;
 const cleanBase=v=>String(v||'').trim().replace(/\/$/,'');
 function facebookSettings(){return {campaignBase:data?.rollout?.title||'Campaign',campaignPattern:fbCampaignPattern.value.trim(),adSetPattern:fbAdSetPattern.value.trim(),adPattern:fbAdPattern.value.trim(),objective:fbObjective.value,cta:fbCta.value,body:fbBody.value.trim(),headline:fbHeadline.value.trim(),budgetLevel:fbBudgetLevel.value,budget:fbDailyBudget.value,start:fbStart.value,end:fbEnd.value,pageId:fbPageId.value.trim(),baseUrl:cleanBase(fbBaseUrl.value),country:fbCountry.value.trim().toUpperCase(),special:fbSpecialCategory.value,imagePattern:fbImagePattern.value.trim(),audiencePattern:fbAudiencePattern.value.trim()}}
 function facebookRows(settings){
   const creativeByKey=new Map((creatives||[]).map(c=>[String(c.area_key||areaKey(c.area)).toLowerCase(),c]));
   return (data?.sites||[]).map(site=>{
     const expectedAudience=applyPattern(settings.audiencePattern,site),audienceRef=facebookAudienceRefs.get(expectedAudience.toLowerCase())||facebookAudienceRefs.get(areaKey(site.area))||'';
     const audienceName=String(audienceRef).includes(':')?String(audienceRef).split(':').slice(1).join(':'):expectedAudience;
     const creative=creativeByKey.get(areaKey(site.area))||null;
     const link=site.domain?(/^https?:\/\//i.test(site.domain)?site.domain:`https://${site.domain}`):(settings.baseUrl?`${settings.baseUrl}/${site.slug}`:'');
     const campaignName=applyMetaPattern(settings.campaignPattern,site,settings,audienceName),adSetName=applyMetaPattern(settings.adSetPattern,site,settings,audienceName),adName=applyMetaPattern(settings.adPattern,site,settings,audienceName);
     const tags=`utm_source=facebook&utm_medium=paid_social&utm_campaign=${encodeURIComponent(campaignName)}&utm_content=${encodeURIComponent(site.slug)}&rc_area=${encodeURIComponent(site.area)}`;
     const row={};META_ADS_HEADERS.forEach(h=>row[h]='');
     Object.assign(row,{'Campaign Name':campaignName,'Campaign Status':'PAUSED','Special Ad Categories':settings.special,'Special Ad Category Country':settings.special==='issues_elections_politics'?settings.country:'','Campaign Objective':settings.objective,'Buying Type':'AUCTION','Campaign Daily Budget':settings.budgetLevel==='campaign'?settings.budget:'','Campaign Bid Strategy':'Highest volume or value','Campaign Start Time':fbDate(settings.start),'Campaign Stop Time':fbDate(settings.end),'Ad Set Run Status':'PAUSED','Ad Set Name':adSetName,'Ad Set Time Start':fbDate(settings.start),'Ad Set Time Stop':fbDate(settings.end),'Ad Set Daily Budget':settings.budgetLevel==='adset'?settings.budget:'','Link Object ID':settings.pageId,'Link':link,'Countries':settings.country,'Custom Audiences':audienceRef,'Optimization Goal':'LANDING_PAGE_VIEWS','Billing Event':'IMPRESSIONS','Ad Set Bid Strategy':settings.budgetLevel==='adset'?'Highest volume or value':'','Ad Status':'PAUSED','Ad Name':adName,'Title':applyPattern(settings.headline,site),'Body':applyPattern(settings.body,site),'Creative Type':'Page post ad','URL Tags':tags,'Image File Name':creative?.filename||applyPattern(settings.imagePattern,site),'Call to Action':settings.cta});
     return {site,expectedAudience,audienceRef,creative,row};
   })
 }
 function readinessRows(){
   const creativeByKey=new Map((creatives||[]).map(c=>[String(c.area_key||areaKey(c.area)).toLowerCase(),c]));
   return (data?.sites||[]).map(site=>({site,audience:facebookAudienceRefs.get(areaKey(site.area))||'',creative:creativeByKey.get(areaKey(site.area))||null}));
 }
 function renderReadiness(){
   if(!window.campaignReadiness||!data)return;
   const rows=readinessRows(),total=rows.length,live=rows.filter(x=>x.site.status==='live').length,aud=rows.filter(x=>x.audience).length,cre=rows.filter(x=>x.creative).length,ready=rows.filter(x=>x.audience&&x.creative).length;
   const issues=rows.filter(x=>!x.audience||!x.creative||x.site.status!=='live');
   campaignReadiness.innerHTML=`<div class="readiness-grid"><div><span>Microsites</span><strong>${total}</strong><small>${live} live</small></div><div><span>Audiences</span><strong>${aud}/${total}</strong><small>${Math.max(0,total-aud)} missing</small></div><div><span>Creatives</span><strong>${cre}/${total}</strong><small>${Math.max(0,total-cre)} missing</small></div><div class="${ready===total&&total?'ready-ok':''}"><span>Matched for Meta</span><strong>${ready}/${total}</strong><small>${ready===total&&total?'Assets complete':'Needs attention'}</small></div></div>${!total?`<div class="state-banner error">Import local areas to begin the rollout.</div>`:issues.length?`<div class="readiness-summary"><strong>${issues.length} area${issues.length===1?'':'s'} need attention</strong><span>Resolve these before the final Meta export.</span></div><div class="readiness-exceptions">${issues.slice(0,20).map(x=>`<div class="readiness-exception"><span><strong>${esc(x.site.area)}</strong><small>${esc(x.site.slug)}</small></span><span class="readiness-tags">${x.site.status!=='live'?`<b>Site ${esc(x.site.status)}</b>`:''}${!x.audience?'<b>Audience missing</b>':''}${!x.creative?'<b>Creative missing</b>':''}</span></div>`).join('')}${issues.length>20?`<small>Showing 20 of ${issues.length} areas requiring attention.</small>`:''}</div><div class="button-row readiness-actions"><a class="btn secondary small" href="audiences.html">Fix audiences</a><a class="btn secondary small" href="creatives.html?rollout=${encodeURIComponent(id)}">Fix creatives</a></div>`:`<div class="state-banner success">All ${total} areas have matched audiences and creatives. ${live===total?'Every microsite is live.':'Review microsite status before launch.'}</div>`}`;
 }
 function renderFacebookPreflight(){
   const s=facebookSettings(),rows=facebookRows(s),missingAudience=rows.filter(x=>!x.audienceRef).length,missingCreative=rows.filter(x=>!x.creative).length,missingLink=rows.filter(x=>!x.row.Link).length,total=rows.length,ready=rows.filter(x=>x.audienceRef&&x.creative&&x.row.Link).length;
   facebookAdsPreflight.innerHTML=`<div class="facebook-preflight-kpis"><div><span>Ads</span><strong>${total}</strong></div><div><span>Audiences matched</span><strong>${total-missingAudience}/${total}</strong></div><div><span>Creatives matched</span><strong>${total-missingCreative}/${total}</strong></div><div><span>Ready</span><strong>${ready}/${total}</strong></div></div>${missingAudience||missingCreative||missingLink?`<div class="state-banner error">${missingAudience?`${missingAudience} audience${missingAudience===1?'':'s'} missing. `:''}${missingCreative?`${missingCreative} creative${missingCreative===1?'':'s'} missing. `:''}${missingLink?`${missingLink} landing URL${missingLink===1?'':'s'} missing. `:''}You can export a draft, but incomplete rows need attention before Meta upload.</div>`:'<div class="state-banner success">Every microsite has a matched audience, uploaded creative and landing URL.</div>'}<div class="facebook-preflight-table"><table><thead><tr><th>Area</th><th>Campaign</th><th>Ad set</th><th>Ad</th><th>Audience</th><th>Creative</th></tr></thead><tbody>${rows.slice(0,12).map(x=>`<tr><td>${esc(x.site.area)}</td><td>${esc(x.row['Campaign Name'])}</td><td>${esc(x.row['Ad Set Name'])}</td><td>${esc(x.row['Ad Name'])}</td><td class="${x.audienceRef?'':'facebook-missing'}">${esc(x.audienceRef||x.expectedAudience+' — missing ID')}</td><td class="${x.creative?'':'facebook-missing'}"><code>${esc(x.creative?.filename||'Missing')}</code></td></tr>`).join('')}</tbody></table>${rows.length>12?`<small>Showing 12 of ${rows.length} ads.</small>`:''}</div>`;
 }
 function applyStoredFacebookAudiences(rows){
   storedFacebookAudiences=rows||[];
   storedFacebookAudiences.forEach(x=>{
     const ref=`${x.audience_id}:${x.audience_name}`;
     if(x.filename)facebookAudienceRefs.set(String(x.filename).toLowerCase(),ref);
     if(x.area_key)facebookAudienceRefs.set(String(x.area_key).toLowerCase(),ref);
     if(x.area)facebookAudienceRefs.set(areaKey(x.area),ref);
   });
 }
 async function loadFacebookAudienceMap(file){facebookAudienceRefs=new Map();applyStoredFacebookAudiences(storedFacebookAudiences);if(!file){renderFacebookPreflight();renderReadiness();return;}const rows=parseCSV(await file.text());rows.forEach(x=>{const filename=(x.filename||x.file||x.audience_file||'').trim().toLowerCase(),area=(x.area||x.constituency||x.ward||'').trim(),ref=(x.audience_ref||x.custom_audience||((x.audience_id||x.id)&&x.audience_name?`${x.audience_id||x.id}:${x.audience_name}`:'' )).trim();if(ref){if(filename)facebookAudienceRefs.set(filename,ref);if(area)facebookAudienceRefs.set(areaKey(area),ref)}});renderFacebookPreflight();renderReadiness();}
 function setFacebookForm(saved={}){
   const r=data.rollout,p=r.package||{};
   fbCampaignPattern.value=saved.campaignPattern||'{{campaign}}';
   fbAdSetPattern.value=saved.adSetPattern||'{{campaign}} | {{area}}';
   fbAdPattern.value=saved.adPattern||'{{campaign}} | {{area}} | 01';
   fbObjective.value=saved.objective||'Traffic';fbCta.value=saved.cta||'SIGN_UP';
   fbBody.value=saved.body||p.supporting_copy||'';fbHeadline.value=saved.headline||p.headline||`${r.title} in {{area}}`;
   fbBudgetLevel.value=saved.budgetLevel||'adset';fbDailyBudget.value=saved.budget||10;fbStart.value=saved.start||'';fbEnd.value=saved.end||'';
   fbPageId.value=saved.pageId||'';fbBaseUrl.value=saved.baseUrl||'';fbCountry.value=saved.country||'GB';fbSpecialCategory.value=saved.special||'issues_elections_politics';
   fbImagePattern.value=saved.imagePattern||'{{AREA_KEY}}CAMPAIGNIN{{AREA_KEY}}.jpg';fbAudiencePattern.value=saved.audiencePattern||'{{area}}';
 }
 async function persistFacebookSettings(showMessage=true){
   const settings=facebookSettings(),r=await sb.rpc('org_admin_update_facebook_export_settings',{p_rollout:id,p_settings:settings});
   if(r.error){if(showMessage)facebookSettingsMessage.innerHTML=`<div class="state-banner error">${esc(r.error.message)}</div>`;return false}
   data.rollout.package={...(data.rollout.package||{}),facebook_export:settings};
   if(showMessage)facebookSettingsMessage.innerHTML='<div class="state-banner success">Meta setup saved to this campaign.</div>';
   return true;
 }
 createFacebookAds.onclick=()=>{setFacebookForm(data?.rollout?.package?.facebook_export||{});facebookSettingsMessage.innerHTML='';facebookAdsDialog.showModal();renderFacebookPreflight();};
 if(window.openFacebookSetup)openFacebookSetup.onclick=()=>createFacebookAds.click();
 document.querySelectorAll('[data-close-facebook-ads]').forEach(x=>x.onclick=()=>facebookAdsDialog.close());
 fbAudienceMap.onchange=()=>loadFacebookAudienceMap(fbAudienceMap.files?.[0]);
 [fbCampaignPattern,fbAdSetPattern,fbAdPattern,fbObjective,fbCta,fbBody,fbHeadline,fbBudgetLevel,fbDailyBudget,fbStart,fbEnd,fbPageId,fbBaseUrl,fbCountry,fbSpecialCategory,fbImagePattern,fbAudiencePattern].forEach(x=>x.addEventListener('input',renderFacebookPreflight));
 previewFacebookAds.onclick=renderFacebookPreflight;
 saveFacebookSettings.onclick=()=>persistFacebookSettings(true);
 downloadAudienceNamingSheet.onclick=()=>{
   const settings=facebookSettings(),rows=facebookRows(settings),headers=['area','area_key','expected_audience_name','matched_audience_id','matched_audience_name','status'];
   const out=rows.map(x=>{const parts=String(x.audienceRef||'').split(':');return [x.site.area,areaKey(x.site.area),x.expectedAudience,parts[0]||'',parts.slice(1).join(':')||'',x.audienceRef?'matched':'create_or_map']});
   const csv=[headers.map(csvCell).join(','),...out.map(r=>r.map(csvCell).join(','))].join('\r\n');
   const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`${(data.rollout.title||'campaign').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-audience-naming-sheet.csv`;a.click();URL.revokeObjectURL(a.href);
 };
 facebookAdsForm.onsubmit=async e=>{e.preventDefault();const settings=facebookSettings();if(!settings.pageId)return facebookSettingsMessage.innerHTML='<div class="state-banner error">Facebook Page ID is required for Page post ads.</div>';if(!settings.baseUrl&&!((data?.sites||[]).every(x=>x.domain)))return facebookSettingsMessage.innerHTML='<div class="state-banner error">Add a landing page base URL, unless every microsite has its own domain.</div>';const rows=facebookRows(settings);if(!rows.length)return facebookSettingsMessage.innerHTML='<div class="state-banner error">Import at least one local area before generating a Meta CSV.</div>';const missing=rows.filter(x=>!x.audienceRef||!x.creative||!x.row.Link);if(missing.length&&!confirm(`${missing.length} of ${rows.length} rows are incomplete. Download a draft CSV anyway?`))return;await persistFacebookSettings(false);const csv=[META_ADS_HEADERS.map(csvCell).join(','),...rows.map(x=>META_ADS_HEADERS.map(h=>csvCell(x.row[h])).join(','))].join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`${(data.rollout.title||'facebook-campaign').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-meta-bulk-upload.csv`;a.click();URL.revokeObjectURL(a.href);msg(`${rows.length} Meta ad row${rows.length===1?'':'s'} generated.`);facebookAdsDialog.close();};

 closeCentralCampaignPreview.onclick=()=>centralCampaignPreviewPanel.hidden=true;
 deleteCentralCampaignRollout.onclick=async()=>{if(!confirm(`Delete ${data?.rollout?.title||'this rollout'}? This will permanently delete all generated microsites and their central supporter records.`))return;const r=await sb.rpc('org_admin_delete_central_campaign_rollout',{p_rollout:id});if(r.error)return msg(r.error.message,true);location.href='campaigns.html'};
 await load();
}
if(window.CP_ADMIN)init().catch(console.error);
else document.addEventListener('cp-admin-ready',()=>init().catch(console.error),{once:true});
})();
