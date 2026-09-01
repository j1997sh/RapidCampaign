(async()=>{
'use strict';
const sb=window.cpSupabase,root=document.getElementById('publicSiteRoot');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const slugify=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const params=new URLSearchParams(location.search);
const parts=location.pathname.split('/').filter(Boolean),i=parts.lastIndexOf('site');
const slug=params.get('site')||(i>=0?parts[i+1]:'');
function fail(msg){root.innerHTML=`<div class="public-state"><h1>Campaign unavailable</h1><p>${esc(msg)}</p></div>`}
if(!slug){fail('No campaign area was specified.');return}
const rr=await sb.rpc('public_rapid_campaign_site',{p_slug:slug,p_hostname:location.hostname});
if(rr.error||!rr.data){fail('This campaign microsite is not currently live.');return}
const {site,rollout}=rr.data,pkg=rollout.package||{},brand={...(pkg.branding||{}),...(site.branding||{})};
const primary=brand.primary||brand.navy||'#08254a',secondary=brand.secondary||brand.blue||'#1476d4';
const points=Array.isArray(site.key_points)?site.key_points:[];
const attribution={};['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'].forEach(k=>{const v=params.get(k);if(v)attribution[k]=v});
attribution.landing_path=location.pathname;attribution.area=site.area;attribution.campaign=rollout.title;
let sid=sessionStorage.getItem('rapid_campaign_session');if(!/^[0-9a-f-]{36}$/i.test(sid||'')){sid=crypto.randomUUID();sessionStorage.setItem('rapid_campaign_session',sid)}
sb.rpc('public_track_rapid_campaign_visit',{p_site:site.id,p_session_id:sid,p_full_url:location.href,p_referrer:document.referrer||'',p_attribution:attribution}).catch(()=>{});
const headline=site.headline||site.title||rollout.title,supporting=site.supporting_copy||pkg.supporting_copy||'',cta=pkg.cta||'Back this campaign';
document.title=`${site.area} | ${rollout.title}`;
root.innerHTML=`<style>:root{--rc-primary:${esc(primary)};--rc-secondary:${esc(secondary)}}</style>
<header class="rc-header"><div class="pub-container"><strong>${esc(rollout.title)}</strong><span>${esc(site.area)}</span></div></header>
<main>
<section class="rc-hero"><div class="pub-container"><div class="rc-area">${esc(site.area)}</div><h1>${esc(headline)}</h1><p>${esc(supporting)}</p><a class="pub-btn" href="#support">${esc(cta)}</a></div></section>
${points.length?`<section class="pub-section"><div class="pub-container"><div class="pub-grid">${points.map(p=>`<article><h3>${esc(typeof p==='string'?p:(p.title||''))}</h3>${typeof p==='object'&&p.copy?`<p>${esc(p.copy)}</p>`:''}</article>`).join('')}</div></div></section>`:''}
<section class="pub-section alt" id="support"><div class="pub-container"><h2>${esc(cta)}</h2><p class="pub-lead">Add your name to support this campaign in ${esc(site.area)}.</p><form id="supportForm" class="pub-action-form"><div class="two"><input name="first_name" placeholder="First name"><input name="last_name" placeholder="Last name"><input class="full" name="email" type="email" placeholder="Email address"><input class="full" name="postcode" placeholder="Postcode"></div><label class="form-note"><input type="checkbox" name="consent"> I would like to receive campaign updates by email.</label><button class="pub-btn" type="submit">${esc(cta)}</button><div id="supportMsg"></div></form></div></section>
</main><footer class="pub-footer"><div class="pub-container"><strong>${esc(rollout.title)}</strong><small>${esc(site.area)}</small></div></footer>`;
const form=document.getElementById('supportForm'),msg=document.getElementById('supportMsg');
form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form),btn=form.querySelector('button');btn.disabled=true;const r=await sb.rpc('public_central_campaign_support',{p_site:site.id,p_first_name:String(fd.get('first_name')||''),p_last_name:String(fd.get('last_name')||''),p_email:String(fd.get('email')||''),p_phone:'',p_postcode:String(fd.get('postcode')||''),p_consent_email:fd.get('consent')==='on',p_attribution:{...attribution,session_id:sid}});if(r.error){msg.textContent=r.error.message;msg.className='submit-message error'}else{msg.textContent='Thank you — your support has been recorded.';msg.className='submit-message success';form.reset()}btn.disabled=false};
})();