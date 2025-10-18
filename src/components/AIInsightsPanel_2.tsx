"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import AIComparisonChart from "./AIComparisonChart";

export default function AIInsightsPanel() {
  const [insight, setInsight] = useState<any>(null);

  async function fetchInsights() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-insights`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ mode: "dashboard" }),
      }
    );
    const data = await res.json();
    setInsight(data);
  }

  useEffect(() => {
    fetchInsights();
  }, []);

  if (!insight) return <p className="text-gray-500">Loading AI insights…</p>;

  // Mock structure: adapt if your function returns different keys
  const currentData = insight.current_trend || [];
  const historicalData = insight.historical_trend || [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">🤖 AI Summary</h2>
        <p className="text-gray-700">{insight.summary}</p>
      </div>

      {/* Comparison Chart */}
      <AIComparisonChart current={currentData} historical={historicalData} label="Sales Volume" />

      {/* Actions */}
      <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">✅ Recommended Actions</h2>
        <ul className="list-disc pl-5 space-y-1">
          {insight.actions?.map((a: string, i: number) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
