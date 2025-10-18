"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewOrderPage() {
  const [form, setForm] = useState({
    client_name: "",
    order_item: "",
    category: "",
    quantity: 1,
    total: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("orders").insert([form]);
    if (error) alert("⚠️ Error adding order: " + error.message);
    else alert("✅ Order saved!");
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">🛒 New Order</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Client name"
          value={form.client_name}
          onChange={(e) => setForm({ ...form, client_name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Beverage"
          value={form.order_item}
          onChange={(e) => setForm({ ...form, order_item: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: Number(e.target.value) })
          }
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Total"
          value={form.total}
          onChange={(e) => setForm({ ...form, total: Number(e.target.value) })}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded w-full"
        >
          Save Order
        </button>
      </form>
    </div>
  );
}
