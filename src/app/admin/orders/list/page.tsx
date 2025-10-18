"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id: number;
  order_nr: string;
  total: number;
  created_at: string;
};

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadOrders() {
    setLoading(true);

    let query = supabase
      .from("orders")
      .select("id, order_nr, total, created_at")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("order_nr", `%${search}%`);
    }

    const { data, error } = await query;
    if (!error && data) setOrders(data);

    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📑 Orders List</h1>

      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by Order Nr..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={loadOrders}
          className="px-4 py-1 bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="p-4">No orders found.</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Order Nr</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-2 border">{o.order_nr}</td>
                  <td className="p-2 border">{o.total.toFixed(2)}</td>
                  <td className="p-2 border">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
