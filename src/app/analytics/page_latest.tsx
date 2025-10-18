"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AIInsightsPanel from "@/components/AIInsightsPanel";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

interface Order {
  id: number;
  client_name: string;
  total: number;
  order_date: string;
}

interface Beverage {
  id: number;
  name: string;
  category: string;
  price_bottle?: number;
  price_shot?: number;
  price_mix?: number;
  price_rocks?: number;
}

interface Forecast {
  beverage: string;
  predicted_sales: number;
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [predictions, setPredictions] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterClient, setFilterClient] = useState<string[]>([]);

  // 🔹 Load data
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: o } = await supabase
        .from("orders")
        .select("id, client_name, total, order_date")
        .order("order_date", { ascending: true });
      const { data: b } = await supabase
        .from("beverages")
        .select("id, name, category, price_bottle, price_shot, price_mix, price_rocks");

      if (o) setOrders(o);
      if (b) setBeverages(b);
      setLoading(false);
    }
    load();
  }, []);

  // 🔹 Derived chart data
  const salesByDate = orders.reduce<Record<string, number>>((acc, o) => {
    const date = o.order_date?.split("T")[0];
    if (!date) return acc;
    acc[date] = (acc[date] || 0) + o.total;
    return acc;
  }, {});
  const chartData = Object.entries(salesByDate).map(([date, total]) => ({ date, total }));

  const beverageByCategory = beverages.reduce<Record<string, number>>((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(beverageByCategory).map(([category, count]) => ({
    category,
    count,
  }));

  // 🔹 AI analysis + forecasting
  async function getAIInsights() {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-insights`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orders, beverages }),
        }
      );
      const json = await res.json();
      setAiSummary(json.summary || "");
      setPredictions(json.predictions || []);
    } catch (err) {
      console.error("AI Insights Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Multi-select filtering (future-ready)
  const filteredOrders = orders.filter(
    (o) =>
      (filterClient.length === 0 || filterClient.includes(o.client_name)) &&
      (filterCategory.length === 0 ||
        beverages.some(
          (b) =>
            filterCategory.includes(b.category) &&
            o.client_name.toLowerCase().includes(b.name?.toLowerCase() ?? "")
        ))
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 AI-Powered Analytics Dashboard</h1>

      {/* FILTER CONTROLS */}
      <div className="flex gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Client</label>
          <select
            multiple
            value={filterClient}
            onChange={(e) =>
              setFilterClient(Array.from(e.target.selectedOptions, (opt) => opt.value))
            }
            className="border p-2 w-48 h-28"
          >
            {[...new Set(orders.map((o) => o.client_name))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Filter by Category</label>
          <select
            multiple
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(Array.from(e.target.selectedOptions, (opt) => opt.value))
            }
            className="border p-2 w-48 h-28"
          >
            {[...new Set(beverages.map((b) => b.category))].map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SALES CHART */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-8">
        <h2 className="font-semibold mb-2">💰 Sales Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#0070f3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CATEGORY CHART */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-8">
        <h2 className="font-semibold mb-2">🍸 Beverages by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI INSIGHTS */}
      <div className="bg-white shadow-md rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">🤖 AI Insights & Predictions</h2>
          <button
            onClick={getAIInsights}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            {loading ? "Analyzing..." : "🔍 Analyze"}
          </button>
        </div>
        {aiSummary ? (
          <p className="text-gray-700 mb-4">{aiSummary}</p>
        ) : (
          <p className="text-gray-500 mb-4">Click “Analyze” to generate insights.</p>
        )}

        {predictions.length > 0 && (
          <>
            <h3 className="font-medium mb-2">🔮 Predicted Bestsellers</h3>
            <ul className="list-disc ml-6 text-gray-700">
              {predictions.map((p, i) => (
                <li key={i}>
                  {p.beverage}: {p.predicted_sales} units forecasted
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <AIInsightsPanel />
    </div>
  );
}
