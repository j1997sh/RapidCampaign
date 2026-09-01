import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const clean=(v:unknown)=>String(v??"").trim();
const extractName=(item:any)=>{
  if(!item) return "";
  if(typeof item==="string") return clean(item);
  if(typeof item.value==="string") return clean(item.value);
  if(typeof item.name==="string") return clean(item.name);
  if(item.value&&typeof item.value==="object"){
    if(typeof item.value.name==="string") return clean(item.value.name);
    if(typeof item.value.constituency?.name==="string") return clean(item.value.constituency.name);
    if(typeof item.value.currentRepresentation?.constituency?.name==="string") return clean(item.value.currentRepresentation.constituency.name);
  }
  return "";
};
Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if(req.method!=="POST") return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{...cors,"Content-Type":"application/json"}});
  try{
    const names:string[]=[];
    for(let skip=0;skip<700;skip+=20){
      const r=await fetch(`https://members-api.parliament.uk/api/Location/Constituency/Search?skip=${skip}&take=20`,{headers:{Accept:"application/json"}});
      if(!r.ok) throw new Error(`UK Parliament constituency service returned ${r.status}`);
      const j=await r.json(),items=Array.isArray(j.items)?j.items:[];
      for(const item of items){const n=extractName(item);if(n) names.push(n)}
      if(items.length<20) break;
    }
    const unique=[...new Set(names)].filter(Boolean).sort((a,b)=>a.localeCompare(b,"en-GB"));
    return new Response(JSON.stringify({count:unique.length,source:"UK Parliament Members API",constituencies:unique}),{headers:{...cors,"Content-Type":"application/json","Cache-Control":"public, max-age=86400"}});
  }catch(error){return new Response(JSON.stringify({error:error instanceof Error?error.message:String(error)}),{status:500,headers:{...cors,"Content-Type":"application/json"}})}
});
