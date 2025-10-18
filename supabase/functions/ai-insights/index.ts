// supabase/functions/ai-insights/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

/**
 * 🔮 AI-Driven Insights Function
 * Handles analytics, feedback, and order trends in one endpoint.
 */
serve(async (req: Request) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      },
    });
  }

  try {
    const body = await req.json();
    const orders = Array.isArray(body.orders) ? body.orders : [];
    const beverages = Array.isArray(body.beverages) ? body.beverages : [];
    const feedback = Array.isArray(body.feedback) ? body.feedback : [];
    const region = body.region || "Caribbean";

    console.log("📦 Received data:", {
      orders: orders.length,
      beverages: beverages.length,
      feedback: feedback.length,
      region,
    });

    // --- 📊 Summaries ---
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const topBeverage =
      beverages.sort((a, b) => (b.price || 0) - (a.price || 0))[0]?.name ||
      "No data";

    // --- 💬 Feedback Sentiment ---
    const positive =
      feedback.filter((f: any) => f.sentiment === "positive").length || 0;
    const neutral =
      feedback.filter((f: any) => f.sentiment === "neutral").length || 0;
    const negative =
      feedback.filter((f: any) => f.sentiment === "negative").length || 0;
    const totalFeedback = positive + neutral + negative;

    const posPct = totalFeedback ? (positive / totalFeedback) * 100 : 0;
    const negPct = totalFeedback ? (negative / totalFeedback) * 100 : 0;

    // --- 🔮 Insights Text ---
    let insights = `📈 Regional AI Insights (${region})\n`;
    insights += `Total Orders: ${totalOrders}\n`;
    insights += `Total Revenue: $${totalRevenue.toFixed(2)}\n`;
    insights += `Average Order Value: $${avgOrder.toFixed(2)}\n`;
    insights += `Top Beverage: ${topBeverage}\n`;

    if (feedback.length) {
      insights += `\n💬 Customer Sentiment:\n`;
      insights += `Positive: ${posPct.toFixed(1)}%\n`;
      insights += `Negative: ${negPct.toFixed(1)}%\n`;

      if (posPct > 60) {
        insights += `🟢 Strong satisfaction — focus on retaining loyal customers.\n`;
      } else if (negPct > 40) {
        insights += `🔴 Rising negative sentiment — review product quality or pricing.\n`;
      } else {
        insights += `🟡 Mixed reactions — explore feedback details further.\n`;
      }
    }

    insights += `\n🌍 Forecast (${region}): `;
    if (region.toLowerCase().includes("caribbean"))
      insights += "Rum and tropical cocktails are trending.";
    else if (region.toLowerCase().includes("europe"))
      insights += "Whisky, gin, and craft beers remain popular.";
    else if (region.toLowerCase().includes("america"))
      insights += "Cocktails and tequila-based drinks are rising fast.";
    else if (region.toLowerCase().includes("latin"))
      insights += "Fruit-based and rum-based cocktails are strong performers.";
    else insights += "Regional data not available, using global trends.";

    insights += `\n💡 Suggestion: Use these insights to plan promotions and stock management.`;

    return new Response(JSON.stringify({ insights }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // ✅ Safe for frontend
      },
    });
  } catch (error) {
    console.error("❌ AI Insights Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate AI insights",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
