import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if(req.method!=="POST") return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{...cors,"Content-Type":"application/json"}});
  try{
    const names:string[]=[];
    for(let skip=0;skip<650;skip+=20){
      const r=await fetch(`https://members-api.parliament.uk/api/Location/Constituency/Search?skip=${skip}&take=20`,{headers:{Accept:"application/json"}});
      if(!r.ok) throw new Error(`UK Parliament constituency service returned ${r.status}`);
      const j=await r.json();
      for(const item of (j.items||[])){const v=item?.value||{};const name=v?.name||v?.constituency?.name||v?.currentRepresentation?.constituency?.name||item?.name;if(name)names.push(String(name).trim())}
      if((j.items||[]).length<20) break;
    }
    const constituencies=[...new Set(names.filter(Boolean))].sort((a,b)=>a.localeCompare(b,"en-GB"));
    return new Response(JSON.stringify({count:constituencies.length,source:"UK Parliament Members API",constituencies}),{headers:{...cors,"Content-Type":"application/json","Cache-Control":"public, max-age=86400"}});
  }catch(error){return new Response(JSON.stringify({error:error instanceof Error?error.message:String(error)}),{status:500,headers:{...cors,"Content-Type":"application/json"}})}
});
