(async()=>{
'use strict';
const root=document.getElementById('publicSiteRoot');
let sb=window.cpSupabase;
if(!sb&&window.supabase?.createClient){sb=window.supabase.createClient('https://peatzuhtfakigpqyglzt.supabase.co','sb_publishable_PkB4POQES8kc-5MriSQ_NA_LO8vPR8c')}
if(!sb){root.innerHTML='<div class="public-state"><h1>Campaign unavailable</h1><p>The campaign data service could not be loaded. Refresh this page and try again.</p></div>';return;}
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const slugify=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const params=new URLSearchParams(location.search);
const parts=location.pathname.split('/').filter(Boolean),i=parts.lastIndexOf('site');
const isGithub=location.hostname.endsWith('github.io');
const directSlug=isGithub?(parts.length>1?parts[parts.length-1]:''):(parts.length?parts[parts.length-1]:'');
const slug=params.get('site')||(i>=0?parts[i+1]:directSlug);
function fail(msg){root.innerHTML=`<div class="public-state"><h1>Campaign unavailable</h1><p>${esc(msg)}</p></div>`}
if(!slug){fail('No campaign area was specified.');return}
const rr=await sb.rpc('public_rapid_campaign_site',{p_slug:slug,p_hostname:location.hostname});
if(rr.error||!rr.data){fail('This campaign microsite is not currently live.');return}
const {site,rollout}=rr.data,pkg=rollout.package||{},brand={...(pkg.branding||{}),...(site.branding||{})};
const primary=brand.primary||brand.navy||'#08254a',secondary=brand.secondary||brand.blue||'#1476d4',hero=brand.hero_image||brand.hero||'',logo=brand.logo_url||brand.logo||'';
const points=Array.isArray(site.key_points)?site.key_points:[];
const attribution={};['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'].forEach(k=>{const v=params.get(k);if(v)attribution[k]=v});
attribution.landing_path=location.pathname;attribution.area=site.area;attribution.campaign=rollout.title;
let sid=sessionStorage.getItem('rapid_campaign_session');if(!/^[0-9a-f-]{36}$/i.test(sid||'')){sid=crypto.randomUUID();sessionStorage.setItem('rapid_campaign_session',sid)}
sb.rpc('public_track_rapid_campaign_visit',{p_site:site.id,p_session_id:sid,p_full_url:location.href,p_referrer:document.referrer||'',p_attribution:attribution}).catch(()=>{});
const variables={area:site.area||'',postcode:site.postcode||'',council:site.council||'',region:site.region||'',...(site.settings?.variables||{})};
const formFields=site.settings?.form_fields||pkg.settings?.form_fields||{name:true,email:true,postcode:true,phone:false};
const replaceVars=value=>String(value??'').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,(all,key)=>Object.prototype.hasOwnProperty.call(variables,key)?String(variables[key]??''):all);
const headline=replaceVars(site.headline||site.title||rollout.title),supporting=replaceVars(site.supporting_copy||pkg.supporting_copy||''),cta=replaceVars(pkg.cta||'Back this campaign');
document.title=`${site.area} | ${replaceVars(rollout.title)}`;
root.innerHTML=`<style>:root{--rc-primary:${esc(primary)};--rc-secondary:${esc(secondary)}}</style>
<header class="rc-header"><div class="pub-container"><div class="rc-brand">${logo?`<img src="${esc(logo)}" alt="${esc(rollout.title)}">`:`<strong>${esc(rollout.title)}</strong>`}</div><span class="rc-header-area">${esc(site.area)}</span></div></header>
<main>
<section class="rc-hero"${hero?` style="background-image:url('${esc(hero)}')"`:''}><div class="pub-container"><div class="rc-hero-content"><div class="rc-kicker">${esc(site.area)}</div><h1>${esc(headline)}</h1><p>${esc(supporting)}</p><a class="pub-btn" href="#support">${esc(cta)}</a></div></div></section>
${points.length?`<section class="pub-section"><div class="pub-container"><div class="pub-grid">${points.map(p=>`<article><h3>${esc(replaceVars(typeof p==='string'?p:(p.title||'')))}</h3>${typeof p==='object'&&p.copy?`<p>${esc(replaceVars(p.copy))}</p>`:''}</article>`).join('')}</div></div></section>`:''}
<section class="pub-section alt" id="support"><div class="pub-container support-wrap"><div><div class="rc-kicker" style="color:var(--rc-primary)">${esc(site.area)}</div><h2>${esc(cta)}</h2><p class="pub-lead">Add your details to support this campaign in ${esc(site.area)}.</p></div><form id="supportForm" class="pub-action-form"><div class="two">${formFields.name!==false?'<input name="first_name" placeholder="First name"><input name="last_name" placeholder="Last name">':''}${formFields.email!==false?'<input class="full" name="email" type="email" placeholder="Email address">':''}${formFields.postcode!==false?'<input class="full" name="postcode" placeholder="Postcode">':''}${formFields.phone?'<input class="full" name="phone" placeholder="Phone number">':''}</div><label class="form-note"><input type="checkbox" name="consent"> I would like to receive campaign updates by email.</label><button class="pub-btn" type="submit">${esc(cta)}</button><div id="supportMsg"></div></form></div></section>
</main><footer class="pub-footer"><div class="pub-container"><strong>${esc(rollout.title)}</strong><small>${esc(site.area)}</small></div></footer>`;
const form=document.getElementById('supportForm'),msg=document.getElementById('supportMsg');
form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form),btn=form.querySelector('button');btn.disabled=true;const r=await sb.rpc('public_central_campaign_support',{p_site:site.id,p_first_name:String(fd.get('first_name')||''),p_last_name:String(fd.get('last_name')||''),p_email:String(fd.get('email')||''),p_phone:String(fd.get('phone')||''),p_postcode:String(fd.get('postcode')||''),p_consent_email:fd.get('consent')==='on',p_attribution:{...attribution,session_id:sid}});if(r.error){msg.textContent=r.error.message;msg.className='submit-message error'}else{msg.textContent='Thank you — your support has been recorded.';msg.className='submit-message success';form.reset()}btn.disabled=false};
})();