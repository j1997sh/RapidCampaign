import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const normalise=(value:string)=>value.toUpperCase().replace(/[^A-Z0-9]/g,"");
const formatPostcode=(compact:string)=>compact.length>3?`${compact.slice(0,-3)} ${compact.slice(-3)}`:compact;
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{...cors,"Content-Type":"application/json"}});
 try{
  const authHeader=req.headers.get("Authorization")||"",url=Deno.env.get("SUPABASE_URL")!,anonKey=Deno.env.get("SUPABASE_ANON_KEY")!,serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient=createClient(url,anonKey,{global:{headers:{Authorization:authHeader}}});
  const {data:admin,error:adminError}=await userClient.rpc("rapid_campaign_current_admin_context");
  if(adminError||!Array.isArray(admin)||!admin.length)return new Response(JSON.stringify({error:"Not authorised"}),{status:403,headers:{...cors,"Content-Type":"application/json"}});
  const body=await req.json().catch(()=>({})),rawPostcodes=Array.isArray(body.postcodes)?body.postcodes:body.postcode?[body.postcode]:[],requested=[...new Set(rawPostcodes.map((p:unknown)=>normalise(String(p||""))).filter(Boolean))].slice(0,500);
  if(!requested.length)return new Response(JSON.stringify({results:[],errors:[]}),{headers:{...cors,"Content-Type":"application/json"}});
  const adminClient=createClient(url,serviceKey),{data:cached}=await adminClient.from("postcode_geography_cache").select("*").in("postcode_compact",requested),cacheMap=new Map((cached||[]).map((r:any)=>[r.postcode_compact,r])),missing=requested.filter(p=>!cacheMap.has(p)),fresh:any[]=[],errors:any[]=[];
  for(let i=0;i<missing.length;i+=100){const batch=missing.slice(i,i+100).map(formatPostcode),response=await fetch("https://api.postcodes.io/postcodes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({postcodes:batch})});if(!response.ok)throw new Error(`Postcode service returned ${response.status}`);const payload=await response.json();for(const item of payload.result||[]){const compact=normalise(item.query||""),r=item.result;if(!r){errors.push({postcode:formatPostcode(compact),code:"not_found"});continue}const row={postcode:r.postcode||formatPostcode(compact),postcode_compact:compact,parliamentary_constituency:r.parliamentary_constituency||null,ward:r.admin_ward||null,local_authority:r.admin_district||null,region:r.region||r.country||null,latitude:r.latitude??null,longitude:r.longitude??null,source:"postcodes.io",raw:r,resolved_at:new Date().toISOString()};fresh.push(row);cacheMap.set(compact,row)}}
  if(fresh.length){const {error:upsertError}=await adminClient.from("postcode_geography_cache").upsert(fresh,{onConflict:"postcode"});if(upsertError)throw upsertError}
  return new Response(JSON.stringify({results:requested.map(p=>cacheMap.get(p)).filter(Boolean),errors}),{headers:{...cors,"Content-Type":"application/json"}})
 }catch(error){return new Response(JSON.stringify({error:error instanceof Error?error.message:String(error)}),{status:500,headers:{...cors,"Content-Type":"application/json"}})}
});
