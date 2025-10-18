// supabase/functions/find-similar-insights/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const MODEL = "text-embedding-3-small";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { query } = await req.json();
  const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

  // 1. Create embedding for query
  const res = await fetch(EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      input: query,
      model: MODEL,
    }),
  });
  const json = await res.json();
  const embedding = json.data[0].embedding;

  // 2. Query history table
  const { data, error } = await supabase.rpc("match_ai_insights", {
    query_embedding: embedding,
    match_threshold: 0.75,
    match_count: 3,
  });

  if (error) {
    console.error(error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ matches: data }), {
    headers: { "Content-Type": "application/json" },
  });
});
