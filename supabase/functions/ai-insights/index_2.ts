import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    }});
  }
  try {
    const { query } = await req.json().catch(()=>({query:'trending'}));
    const insights = { success:true, query, trends: ['Mojito','Whiskey cocktails'], prediction: 'low-alcohol cocktails rising' };
    return new Response(JSON.stringify(insights), { headers: { 'Content-Type':'application/json','Access-Control-Allow-Origin':'*' }});
  } catch(err:any){
    return new Response(JSON.stringify({ error: err.message }), { status:500, headers:{ 'Content-Type':'application/json','Access-Control-Allow-Origin':'*' }});
  }
});
