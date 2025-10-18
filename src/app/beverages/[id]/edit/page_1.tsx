"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewBeveragePage() {
  const [form, setForm] = useState<any>({
    name: "",
    category: "",
    price: 0,
    description: "",
    image_url: "",
    quantity: 0,
    price_shot: null,
    price_rocks: null,
    price_mix: null,
    price_glass: null,
    price_bottle: null,
  });

  function updateField(field: string, val: any) {
    setForm((f: any) => ({ ...f, [field]: val }));
  }

  async function save() {
    try {
      const { error } = await supabase.from("beverages").insert([form]);
      if (error) throw error;

      alert("✅ Beverage added successfully");
      setForm({
        name: "",
        category: "",
        price: 0,
        description: "",
        image_url: "",
        quantity: 0,
        price_shot: null,
        price_rocks: null,
        price_mix: null,
        price_glass: null,
        price_bottle: null,
      });
    } catch (err: any) {
      console.error("❌ Error adding beverage:", err.message);
      alert("❌ Error: " + err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">➕ Add New Beverage</h1>

      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="border p-2"
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Base Price"
          value={form.price}
          onChange={(e) => updateField("price", parseFloat(e.target.value))}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => updateField("quantity", parseInt(e.target.value))}
          className="border p-2"
        />

        <input
          type="number"
          placeholder="Price Shot (optional)"
          value={form.price_shot ?? ""}
          onChange={(e) =>
            updateField("price_shot", parseFloat(e.target.value) || null)
          }
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Price Rocks (optional)"
          value={form.price_rocks ?? ""}
          onChange={(e) =>
            updateField("price_rocks", parseFloat(e.target.value) || null)
          }
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Price Mix (optional)"
          value={form.price_mix ?? ""}
          onChange={(e) =>
            updateField("price_mix", parseFloat(e.target.value) || null)
          }
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Price Glass (optional)"
          value={form.price_glass ?? ""}
          onChange={(e) =>
            updateField("price_glass", parseFloat(e.target.value) || null)
          }
          className="border p-2"
        />
        <input
          placeholder="Price Bottle (optional)"
          value={form.price_bottle ?? ""}
          onChange={(e) =>
            updateField("price_bottle", parseFloat(e.target.value) || null)
          }
          className="border p-2 col-span-2"
        />

        <input
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) => updateField("image_url", e.target.value)}
          className="border p-2 col-span-2"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="border p-2 col-span-2"
        />
      </div>

      <button
        onClick={save}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        💾 Save Beverage
      </button>
    </div>
  );
}

