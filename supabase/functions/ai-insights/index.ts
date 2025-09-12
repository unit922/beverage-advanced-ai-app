// supabase/functions/ai-insights/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  try {
    const { query, orders } = await req.json();

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`, // safe in Edge env
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",  // or DeepSeek model endpoint
        messages: [
          {
            role: "system",
            content: "You are an expert in hospitality, F&B, and beverage trends.",
          },
          {
            role: "user",
            content: `
              Based on these orders: ${JSON.stringify(orders)},
              and the following request: ${query},
              provide:
              - Top trending drinks (local + global)
              - Cocktail & regional recommendations
              - Predictions for next week
              - Comparison with competitors (bars, hotels, resorts)
              - Suggestions for inventory optimization
            `,
          },
        ],
      }),
    });

    const data = await aiRes.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
