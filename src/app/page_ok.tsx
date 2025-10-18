"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRealtime } from "@/lib/useRealtime";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    region: "All",
    category: "All",
    startDate: "",
    endDate: "",
  });

  async function loadData() {
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });
    if (orderData) setOrders(orderData);

    const { data: invData } = await supabase.from("inventory").select("*");
    if (invData) setInventory(invData);
  }

  useEffect(() => {
    loadData();
  }, []);

  useRealtime("orders", loadData);
  useRealtime("inventory", loadData);

  // 🛠️ Apply filters
  const filteredOrders = orders.filter((o) => {
    const matchRegion = filters.region === "All" || o.region === filters.region;
    const matchCategory =
      filters.category === "All" || o.category === filters.category;
    const matchDate =
      (!filters.startDate ||
        new Date(o.order_date) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(o.order_date) <= new Date(filters.endDate));
    return matchRegion && matchCategory && matchDate;
  });

  // 🥇 Top Sellers
  const topSellers = filteredOrders.reduce((acc: any, order) => {
    const item = order.order_item;
    acc[item] = (acc[item] || 0) + order.quantity;
    return acc;
  }, {});
  const topSellersList = Object.entries(topSellers)
    .map(([item, qty]) => ({ item, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // ⚠️ Low Stock Alerts
  const lowStock = inventory.filter((i) => i.qty < i.threshold);

  // 💵 Revenue by Date
  const revenueByDate: Record<string, number> = {};
  filteredOrders.forEach((order) => {
    const date = new Date(order.order_date).toLocaleDateString();
    revenueByDate[date] = (revenueByDate[date] || 0) + Number(order.total);
  });
  const revenueData = Object.entries(revenueByDate).map(([date, total]) => ({
    date,
    total,
  }));

  // 🍹 Orders per Category
  const categoryTotals: Record<string, number> = {};
  filteredOrders.forEach((order) => {
    const cat = order.category || "Uncategorized";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + order.quantity;
  });
  const categoryData = Object.entries(categoryTotals).map(([category, qty]) => ({
    category,
    qty,
  }));

  // 🌍 Regional Sales
  const regionTotals: Record<string, number> = {};
  filteredOrders.forEach((order) => {
    const region = order.region || "Unknown";
    regionTotals[region] = (regionTotals[region] || 0) + order.quantity;
  });
  const regionData = Object.entries(regionTotals).map(([region, qty]) => ({
    region,
    qty,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard</h1>

      {/* 🔎 Filter Panel */}
      <section className="mb-6 p-4 bg-white shadow rounded">
        <h2 className="text-lg font-semibold mb-3">🔎 Filters</h2>
        <div className="flex flex-wrap gap-4">
          {/* Region filter */}
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="All">All Regions</option>
            {[...new Set(orders.map((o) => o.region || "Unknown"))].map(
              (r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              )
            )}
          </select>

          {/* Category filter */}
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="p-2 border rounded"
          >
            <option value="All">All Categories</option>
            {[...new Set(orders.map((o) => o.category || "Uncategorized"))].map(
              (c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              )
            )}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="p-2 border rounded"
          />
        </div>
      </section>

      {/* 🥇 Top Sellers */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">🥇 Top Sellers</h2>
        <ul className="space-y-2">
          {topSellersList.length > 0 ? (
            topSellersList.map((s, i) => (
              <li key={i} className="p-2 bg-gray-100 rounded">
                {s.item} — {s.qty} sold
              </li>
            ))
          ) : (
            <li className="text-gray-500">No sales yet</li>
          )}
        </ul>
      </section>

      {/* ⚠️ Low Stock Alerts */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">⚠️ Low Stock Alerts</h2>
        <ul className="space-y-2">
          {lowStock.length > 0 ? (
            lowStock.map((i, idx) => (
              <li key={idx} className="p-2 bg-red-100 rounded">
                {i.beverage_id} — only {i.qty} left (threshold: {i.threshold})
              </li>
            ))
          ) : (
            <li className="text-gray-500">All stock levels normal</li>
          )}
        </ul>
      </section>

      {/* 💵 Revenue Trends */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">💵 Revenue Trends</h2>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No revenue data yet</p>
        )}
      </section>

      {/* 🍹 Orders by Category */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">🍹 Orders by Category</h2>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No category data yet</p>
        )}
      </section>

      {/* 🌍 Regional Sales */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">🌍 Regional Sales</h2>
        {regionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No regional data yet</p>
        )}
      </section>
    </div>
  );
}


