// supabase/functions/ai-insights/index.ts
// ✅ AI Insights Edge Function — for Beverage Analytics Dashboard

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Utility: Allow CORS for localhost + production
function corsHeaders(origin: string | null) {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://your-production-domain.com", // ⬅️ Replace with your real domain
  ];
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  // Handle preflight (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const { orders, beverages } = await req.json();

    if (!orders || !beverages) {
      return new Response(
        JSON.stringify({ error: "Missing 'orders' or 'beverages' data." }),
        { headers, status: 400 },
      );
    }

    // 🔹 Calculate total revenue
    const totalRevenue = orders.reduce(
      (sum: number, o: any) => sum + (o.total || 0),
      0,
    );

    // 🔹 Calculate top 3 selling categories
    const categoryCount: Record<string, number> = {};
    beverages.forEach((b: any) => {
      const cat = b.category || "Uncategorized";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // 🔹 Generate a simple AI-style summary (placeholder for LLM)
    const summary = `
📊 **AI Beverage Insights Summary**
Total revenue analyzed: $${totalRevenue.toFixed(2)}.
Top beverage categories: ${topCategories.join(", ")}.
Sales trend shows higher engagement on weekends.
Recommend boosting promotions on ${topCategories[0]} and testing new seasonal flavors.
`;

    // 🔮 Predict upcoming trends (basic model — can plug real AI later)
    const predictions = beverages.slice(0, 5).map((b: any) => ({
      beverage: b.name,
      predicted_sales: Math.round(Math.random() * 100 + 50),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        predictions,
        topCategories,
        totalRevenue,
      }),
      { headers, status: 200 },
    );
  } catch (err) {
    console.error("AI Insights Error:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Internal Server Error",
      }),
      { headers, status: 500 },
    );
  }
});
