"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Beverage {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  price_shot?: number | null;
  price_rocks?: number | null;
  price_mix?: number | null;
  price_glass?: number | null;
  price_bottle?: number | null;
}

export default function InventoryPage() {
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("beverages").select("*");
    if (error) {
      console.error("❌ Error loading beverages:", error.message);
    } else {
      setBeverages(data || []);
    }
    setLoading(false);
  }

  async function remove(id: number) {
    if (!confirm("Delete this beverage?")) return;
    const { error } = await supabase.from("beverages").delete().eq("id", id);
    if (error) {
      alert("❌ Error deleting beverage: " + error.message);
    } else {
      alert("✅ Beverage deleted");
      load();
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📦 Inventory</h1>

      {loading ? (
        <p>Loading...</p>
      ) : beverages.length === 0 ? (
        <p>No beverages found.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Base Price</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Shot</th>
              <th className="border p-2">Rocks</th>
              <th className="border p-2">Mix</th>
              <th className="border p-2">Glass</th>
              <th className="border p-2">Bottle</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {beverages.map((b) => (
              <tr key={b.id}>
                <td className="border p-2">{b.name}</td>
                <td className="border p-2">{b.category}</td>
                <td className="border p-2">${b.price?.toFixed(2)}</td>
                <td className="border p-2">{b.quantity}</td>
                <td className="border p-2">
                  {b.price_shot != null ? `$${b.price_shot.toFixed(2)}` : "-"}
                </td>
                <td className="border p-2">
                  {b.price_rocks != null ? `$${b.price_rocks.toFixed(2)}` : "-"}
                </td>
                <td className="border p-2">
                  {b.price_mix != null ? `$${b.price_mix.toFixed(2)}` : "-"}
                </td>
                <td className="border p-2">
                  {b.price_glass != null ? `$${b.price_glass.toFixed(2)}` : "-"}
                </td>
                <td className="border p-2">
                  {b.price_bottle != null
                    ? `$${b.price_bottle.toFixed(2)}`
                    : "-"}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => remove(b.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    ✖ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
