"use client";
import { useUser } from "@/lib/useUser";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function NewBeverageForm() {
  const [form, setForm] = useState({ name: "", category: "", price: 0 });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("beverages").insert([form]);
    if (error) alert("⚠️ Error: " + error.message);
    else alert("✅ Beverage added!");
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">🍷 New Beverage</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Beverage name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded w-full"
        >
          Save Beverage
        </button>
      </form>
    </div>
  );
}

export default function ProtectedNewBeveragePage() {
  const { role } = useUser();

  // if (!role) return <p>Loading...</p>;
  // if (role !== "user") return <p>⛔ Access denied. Admins only.</p>;

  return <NewBeverageForm />;
}
