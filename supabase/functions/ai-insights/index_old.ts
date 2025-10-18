import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  // ✅ Validate JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  // ✅ Example AI response
  const { query } = await req.json();
  const insights = {
    user: user.email,
    query,
    insights: ["Cocktails are trending", "Gin demand rising"],
  };

  // After fetching live orders/inventory
// Add: Fetch top 3 similar historical insights
const { data: matches } = await supabase.rpc("match_ai_insights", {
  query_embedding: embedding,   // embedding for "current week"
  match_threshold: 0.7,
  match_count: 3,
});

const historySummaries = (matches || []).map((m: any) => ({
  period: `${m.period_start} → ${m.period_end}`,
  summary: m.summary,
  similarity: m.similarity,
}));

// Modify AI prompt:
aiPrompt = `
You are Beverage AI Advisor. Compare current data to similar past periods.

LIVE DATA:
Orders (last ${N_DAYS} days): ${JSON.stringify(orders.slice(-200))}
Inventory snapshot: ${JSON.stringify(inventory)}
Beverage catalog: ${JSON.stringify(beverages)}

HISTORICAL SIMILAR WEEKS:
${JSON.stringify(historySummaries)}

TASK:
1. Summarize current performance (2-3 sentences).
2. Compare with historical matches: highlight similarities & differences.
3. Give 3 recommended actions for the next 7 days.
Return JSON { summary: string, comparison: string, actions: string[] }
`;


return new Response(JSON.stringify(insights), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
