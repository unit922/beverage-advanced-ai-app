"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import DateFilter from "@/components/DateFilter";
import CategoryRegionFilter from "@/components/CategoryRegionFilter";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [insights, setInsights] = useState<string>("");

  const [categories, setCategories] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [topSellers, setTopSellers] = useState<any[]>([]);

  useEffect(() => {
    async function loadOrders() {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) console.error(error);
      else {
        setOrders(data);
        setFiltered(data);

        setCategories([...new Set(data.map((o) => o.category || ""))].filter(Boolean));
        setRegions([...new Set(data.map((o) => o.country || ""))].filter(Boolean));
      }
    }
    loadOrders();
  }, []);

  // Filters
  function handleDateFilter(from: string, to: string) {
    let result = [...orders];
    if (from) result = result.filter((o) => new Date(o.order_date) >= new Date(from));
    if (to) result = result.filter((o) => new Date(o.order_date) <= new Date(to));
    setFiltered(result);
  }

  function handleCategoryRegionFilter(category: string, region: string) {
    let result = [...orders];
    if (category) result = result.filter((o) => o.category === category);
    if (region) result = result.filter((o) => o.country === region);
    setFiltered(result);
  }

  // Chart: sales per day
  const chartData = filtered.reduce((acc: any[], o) => {
    const date = new Date(o.order_date).toLocaleDateString();
    const existing = acc.find((x) => x.date === date);
    if (existing) existing.sales += o.total;
    else acc.push({ date, sales: o.total });
    return acc;
  }, []);

  // Top Sellers leaderboard
  useEffect(() => {
    const leaderboard = filtered.reduce((acc: any[], o) => {
      const existing = acc.find((x) => x.item === o.order_item);
      if (existing) {
        existing.qty += o.quantity;
        existing.sales += o.total;
      } else {
        acc.push({ item: o.order_item, qty: o.quantity, sales: o.total });
      }
      return acc;
    }, []);
    setTopSellers(
      leaderboard.sort((a, b) => b.sales - a.sales).slice(0, 5) // top 5
    );
  }, [filtered]);

  // AI Insights
  async function fetchInsights() {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          Based on this dataset: ${JSON.stringify(filtered)},
          give insights on:
          - Top trending drinks
          - Predictions for next week
          - Comparison with global trends (bars, hotels, restaurants)
          - Suggestions for inventory optimization
        `,
      }),
    });
    const data = await res.json();
    setInsights(data.choices?.[0]?.message?.content || "No insights available.");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📈 Analytics & AI Insights</h1>

      <DateFilter onFilter={handleDateFilter} />
      <CategoryRegionFilter
        categories={categories}
        regions={regions}
        onFilter={handleCategoryRegionFilter}
      />

      {/* Sales Trend Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      {/* Top Sellers */}
      <h2 className="text-xl font-semibold mt-6 mb-2">🏆 Top Sellers</h2>
      <table className="w-full border mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Item</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Sales</th>
          </tr>
        </thead>
        <tbody>
          {topSellers.map((t, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{t.item}</td>
              <td className="p-2">{t.qty}</td>
              <td className="p-2">${t.sales.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* AI Insights */}
      <button
        onClick={fetchInsights}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Get Advanced AI Insights
      </button>

      <div className="mt-4 p-3 border bg-gray-50 whitespace-pre-wrap">
        {insights}
      </div>
    </div>
  );
}
