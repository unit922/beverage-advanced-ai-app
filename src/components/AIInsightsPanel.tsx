"use client";

import { useState } from "react";

interface AIInsightsPanelProps {
  orders?: any[];
  beverages?: any[];
  region?: string;
}

export default function AIInsightsPanel({
  orders = [],
  beverages = [],
  region,
}: AIInsightsPanelProps) {
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const url =
        process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("supabase.co")
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(
              ".co",
              ".co/functions/v1/ai-insights"
            )}`
          : "http://localhost:54321/functions/v1/ai-insights";

      console.log("🛰️ Fetching AI insights from:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders,
          beverages,
          region: region || "Caribbean",
        }),
      });

      if (!res.ok) {
        console.warn("⚠️ AI function unavailable, switching to offline mode.");
        setAiInsights(generateOfflineInsights(orders, beverages, region));
        return;
      }

      const data = await res.json();
      setAiInsights(data.insights || "No insights available from AI.");
    } catch (err: any) {
      console.error("❌ AIInsights fetch failed:", err);
      setAiInsights(generateOfflineInsights(orders, beverages, region));
    } finally {
      setLoading(false);
    }
  }

  // 🧮 Local AI Simulation
  function generateOfflineInsights(
    orders: any[] = [],
    beverages: any[] = [],
    region?: string
  ): string {
    try {
      const totalOrders = Array.isArray(orders) ? orders.length : 0;
      const totalRevenue = (Array.isArray(orders) ? orders : []).reduce(
        (sum, o) => sum + (o?.total || 0),
        0
      );
      const topDrink =
        Array.isArray(beverages) && beverages.length > 0
          ? [...beverages].sort((a, b) => (b.price || 0) - (a.price || 0))[0]
              ?.name
          : "No data";

      return `📊 Offline AI Simulation:
Region: ${region || "unknown"}
Total Orders: ${totalOrders}
Estimated Revenue: $${totalRevenue.toFixed(2)}
Top Beverage: ${topDrink}
Suggestion: Promote ${topDrink} — it’s trending locally!`;
    } catch (error) {
      console.error("Error in generateOfflineInsights:", error);
      return "⚠️ Unable to generate offline insights.";
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md">
      <h2 className="text-lg font-semibold mb-3">🧠 AI Insights Panel</h2>

      <button
        onClick={load}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-3"
      >
        {loading ? "🔄 Loading AI Insights..." : "⚡ Generate AI Insights"}
      </button>

      <div className="border-t pt-3 text-gray-800 whitespace-pre-wrap">
        {aiInsights || "No insights yet. Click the button to generate insights."}
      </div>
    </div>
  );
}
