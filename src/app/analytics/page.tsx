"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Order {
  id: number;
  client_name: string;
  total: number;
  order_item: string;
  created_at: string;
}
interface Beverage {
  id: number;
  name: string;
  category: string;
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: o } = await supabase.from("orders").select("*");
      const { data: b } = await supabase.from("beverages").select("*");
      if (o) setOrders(o);
      if (b) setBeverages(b);
    }
    load();
  }, []);

  async function generateAISummary() {
    setLoading(true);
    setAiSummary("🔍 Generating AI business insights...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ orders, beverages }),
        }
      );
      const data = await res.json();
      setAiSummary(data.aiText || "No insights generated.");
    } catch (err: any) {
      console.error(err);
      setAiSummary("⚠️ Failed to fetch AI insights.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 AI Analytics</h1>

      <button
        onClick={generateAISummary}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? "⏳ Analyzing..." : "🔮 Generate AI Insights"}
      </button>

      {aiSummary && (
        <div className="bg-blue-50 p-4 rounded border">
          <h3 className="font-semibold mb-2">AI Summary</h3>
          <p className="whitespace-pre-line">{aiSummary}</p>
        </div>
      )}
    </div>
  );
}
