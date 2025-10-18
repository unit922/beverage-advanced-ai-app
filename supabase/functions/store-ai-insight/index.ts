// supabase/functions/store-ai-insight/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const MODEL = "text-embedding-3-small"; // good balance cost/quality

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const openaiKey = Deno.env.get("OPENAI_API_KEY")!;
  if (!openaiKey) return new Response("Missing key", { status: 500 });

  // 1. Fetch orders from last 7 days
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .gte("order_date", since.toISOString());

  // 2. Build summary string
  const summary = `Orders last 7 days: total ${orders?.length}, top item: ${
    orders?.[0]?.order_item || "N/A"
  }`;

  // 3. Create embedding
  const res = await fetch(EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      input: summary,
      model: MODEL,
    }),
  });
  const json = await res.json();
  const embedding = json.data[0].embedding;

  // 4. Insert into history
  await supabase.from("ai_insights_history").insert({
    period_start: since.toISOString(),
    period_end: new Date().toISOString(),
    metrics: { order_count: orders?.length || 0 },
    summary,
    embedding,
  });

  return new Response("✅ Insight stored", { status: 200 });
});
