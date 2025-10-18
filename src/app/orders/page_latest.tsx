"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Order {
  id: number;
  client_name: string;
  total: number;
  order_item: string; // stored as JSON in DB
  order_number?: string;
  payment_method?: string;
  created_at?: string;
}

interface Beverage {
  id: number;
  name: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      const { data: b } = await supabase.from("beverages").select("id, name");
      if (o) setOrders(o);
      if (b) setBeverages(b);
    }
    loadData();
  }, []);

  function getBeverageName(id: number): string {
    const b = beverages.find((bev) => bev.id === id);
    return b ? b.name : `#${id}`;
  }

  function parseItems(json: string) {
    try {
      const items = JSON.parse(json);
      return items.map(
        (it: any) =>
          `${getBeverageName(it.beverage_id)} (${it.serving}) × ${it.qty}`
      );
    } catch {
      return ["—"];
    }
  }

  // Optional: AI summary suggestion (mock local)
  async function generateAISummary(order: Order) {
    setAiSuggestion("🔮 Analyzing order insights...");
    // Mock delay (replace with Supabase Edge Function later)
    await new Promise((r) => setTimeout(r, 1200));
    setAiSuggestion(
      `💡 ${order.client_name} prefers ${
        order.payment_method || "cash"
      } orders with ${parseItems(order.order_item).length} items — consider offering bundle discounts.`
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">📋 Orders</h1>

      <table className="w-full border-collapse border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Order #</th>
            <th className="border p-2">Client</th>
            <th className="border p-2">Items</th>
            <th className="border p-2">Total ($)</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="border p-2">{o.order_number || o.id}</td>
              <td className="border p-2">{o.client_name}</td>
              <td className="border p-2 text-sm">
                {parseItems(o.order_item).map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </td>
              <td className="border p-2 text-right">
                ${(Number(o.total) || 0).toFixed(2)}
              </td>
              <td className="border p-2 text-sm">
                {o.created_at
                  ? new Date(o.created_at).toLocaleString()
                  : "—"}
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => {
                    setSelectedOrder(o);
                    generateAISummary(o);
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  🧾 View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🧾 Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[480px]">
            <h2 className="text-lg font-bold mb-3">
              🧾 Receipt — {selectedOrder.order_number}
            </h2>

            <p>
              <strong>Client:</strong> {selectedOrder.client_name}
            </p>
            <p>
              <strong>Payment:</strong>{" "}
              {selectedOrder.payment_method || "cash"}
            </p>
            <hr className="my-3" />

            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="text-left">
                  <th>Beverage</th>
                  <th>Serving</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {JSON.parse(selectedOrder.order_item).map((it: any, i: number) => (
                  <tr key={i}>
                    <td>{getBeverageName(it.beverage_id)}</td>
                    <td>{it.serving}</td>
                    <td>{it.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right">
              <p>
                <strong>Total:</strong> ${selectedOrder.total.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm">
                {new Date(selectedOrder.created_at || "").toLocaleString()}
              </p>
            </div>

            {aiSuggestion && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 text-sm rounded">
                {aiSuggestion}
              </div>
            )}

            <div className="text-right mt-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-300 px-4 py-1 rounded mr-2"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
