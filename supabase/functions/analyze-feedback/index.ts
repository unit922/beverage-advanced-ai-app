import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.1/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    }});
  }
  try {
    const { feedback } = await req.json();
    if(!feedback || feedback.length===0) return new Response(JSON.stringify({ error:'No feedback'}), { status:400, headers:{ 'Content-Type':'application/json','Access-Control-Allow-Origin':'*' }});
    const prompt = `You are an AI for a beverage business. Analyze the following feedback:\n${feedback.map((f:any,i:number)=> (i+1)+'. '+f.text).join('\n')}\nRespond in JSON with summary, sentimentBreakdown, recommendations.`;
    const completion = await openai.chat.completions.create({ model:'gpt-4o-mini', messages:[{ role:'user', content: prompt }], temperature:0.3 });
    const aiText = completion.choices[0].message?.content ?? '{}';
    let insights;
    try { insights = JSON.parse(aiText); } catch { insights = { summary: aiText, sentimentBreakdown:{positive:0,neutral:0,negative:0}, recommendations:[] }; }
    // store
    const { error } = await supabase.from('feedback_analysis').insert({
      summary: insights.summary,
      sentiment_breakdown: insights.sentimentBreakdown,
      recommendations: insights.recommendations
    });
    if(error) console.error('insert failed', error);
    return new Response(JSON.stringify(insights), { headers:{ 'Content-Type':'application/json','Access-Control-Allow-Origin':'*' }});
  } catch(err:any){
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status:500, headers:{ 'Content-Type':'application/json','Access-Control-Allow-Origin':'*' }});
  }
});
