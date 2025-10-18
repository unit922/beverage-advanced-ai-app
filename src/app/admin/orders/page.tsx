"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Beverage = {
  id: number;
  name: string;
  category: string;
  bottle_price: number;
};

type OrderItem = {
  beverage_id: number;
  option: "bottle" | "on_the_rock" | "shot" | "mix";
  qty: number;
  unit_price: number;
};

export default function OrdersPage() {
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load inventory
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("inventory")
        .select("id, name, category, bottle_price");
      if (!error && data) setBeverages(data);
    }
    load();
  }, []);

  // Helper: pricing logic for options
  function getPrice(bottle_price: number, option: string) {
    switch (option) {
      case "bottle":
        return bottle_price;
      case "on_the_rock":
        return Math.round((bottle_price / 20) * 100) / 100; // ~1/20 of bottle
      case "shot":
        return Math.round((bottle_price / 25) * 100) / 100; // ~1/25 of bottle
      case "mix":
        return Math.round((bottle_price / 15) * 100) / 100; // ~1/15 of bottle
      default:
        return 0;
    }
  }

  // Add item
  function addItem(beverage: Beverage, option: OrderItem["option"]) {
    const unit_price = getPrice(beverage.bottle_price, option);
    setItems([
      ...items,
      { beverage_id: beverage.id, option, qty: 1, unit_price },
    ]);
  }

  // Update qty
  function updateQty(i: number, qty: number) {
    const updated = [...items];
    updated[i].qty = qty;
    setItems(updated);
  }

  // Submit order
  async function submitOrder() {
    if (items.length === 0) return;
    setLoading(true);

    const total = items.reduce(
      (sum, it) => sum + it.qty * it.unit_price,
      0
    );

    try {
      // Insert order
      const order_nr = "ORD-" + Date.now();
      const { data: order, error } = await supabase
        .from("orders")
        .insert([{ order_nr, total }])
        .select()
        .single();

      if (error) throw error;

      // Insert items
      const orderItems = items.map((it) => ({
        order_id: order.id,
        ...it,
      }));

      const { error: itemError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemError) throw itemError;

      alert("✅ Order placed successfully!");
      setItems([]);
    } catch (err: any) {
      alert("⚠️ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🛒 New Order</h1>

      {/* Beverages List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {beverages.map((bev) => (
          <div
            key={bev.id}
            className="p-4 border rounded shadow bg-white space-y-2"
          >
            <h3 className="font-bold">{bev.name}</h3>
            <p className="text-sm text-gray-600">{bev.category}</p>
            <div className="flex gap-2 flex-wrap">
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded"
                onClick={() => addItem(bev, "bottle")}
              >
                Bottle
              </button>
              <button
                className="px-2 py-1 bg-green-600 text-white rounded"
                onClick={() => addItem(bev, "on_the_rock")}
              >
                On the Rock
              </button>
              <button
                className="px-2 py-1 bg-yellow-600 text-white rounded"
                onClick={() => addItem(bev, "shot")}
              >
                Shot
              </button>
              <button
                className="px-2 py-1 bg-pink-600 text-white rounded"
                onClick={() => addItem(bev, "mix")}
              >
                Mix
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-bold mb-2">🧾 Order Items</h2>
        {items.length === 0 ? (
          <p>No items yet</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Beverage</th>
                <th className="p-2 border">Option</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Unit Price</th>
                <th className="p-2 border">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const bev = beverages.find((b) => b.id === it.beverage_id);
                return (
                  <tr key={i}>
                    <td className="p-2 border">{bev?.name}</td>
                    <td className="p-2 border">{it.option}</td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={it.qty}
                        onChange={(e) =>
                          updateQty(i, Number(e.target.value))
                        }
                        className="w-16 border rounded px-1"
                        min={1}
                      />
                    </td>
                    <td className="p-2 border">{it.unit_price}</td>
                    <td className="p-2 border">
                      {(it.qty * it.unit_price).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {items.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              disabled={loading}
              onClick={submitOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Saving..." : "Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
