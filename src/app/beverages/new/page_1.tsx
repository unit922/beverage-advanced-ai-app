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
    price_shot: 0,
    price_rocks: 0,
    price_mix: 0,
    price_glass: 0,
    price_bottle: 0,
    bottle_volume_ml: 750,
    shot_size_ml: 44,
  });

  function updateField(field: string, val: any) {
    setForm((f: any) => ({ ...f, [field]: val }));
  }

  async function save() {
    try {
      // ✅ fallback logic: auto-fill missing serving prices
      const fallbackPrice = parseFloat(form.price) || 0;
      const payload = {
        ...form,
        price_shot: form.price_shot && form.price_shot > 0 ? form.price_shot : fallbackPrice,
        price_rocks: form.price_rocks && form.price_rocks > 0 ? form.price_rocks : fallbackPrice,
        price_mix: form.price_mix && form.price_mix > 0 ? form.price_mix : fallbackPrice,
        price_glass: form.price_glass && form.price_glass > 0 ? form.price_glass : fallbackPrice,
        price_bottle: form.price_bottle && form.price_bottle > 0 ? form.price_bottle : fallbackPrice,
      };

      // ✅ calculate initial stock shots (bottle_volume_ml / shot_size_ml * quantity)
      const stock_shots = Math.floor(
        (payload.bottle_volume_ml / payload.shot_size_ml) * payload.quantity
      );

      payload.stock_bottles = payload.quantity;
      payload.stock_shots = stock_shots;

      const { error } = await supabase.from("beverages").insert([payload]);
      if (error) throw error;

      alert("✅ Beverage added successfully");
      setForm({
        name: "",
        category: "",
        price: 0,
        description: "",
        image_url: "",
        quantity: 0,
        price_shot: 0,
        price_rocks: 0,
        price_mix: 0,
        price_glass: 0,
        price_bottle: 0,
        bottle_volume_ml: 750,
        shot_size_ml: 44,
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
          placeholder="Quantity (bottles)"
          value={form.quantity}
          onChange={(e) => updateField("quantity", parseInt(e.target.value))}
          className="border p-2"
        />

        <input
          type="number"
          placeholder="Price Shot"
          value={form.price_shot}
          onChange={(e) => updateField("price_shot", parseFloat(e.target.value))}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Price Rocks"
          value={form.price_rocks}
          onChange={(e) => updateField("price_rocks", parseFloat(e.target.value))}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Price Mix"
          value={form.price_mix}
          onChange={(e) => updateField("price_mix", parseFloat(e.target.value))}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Price Glass"
          value={form.price_glass}
          onChange={(e) => updateField("price_glass", parseFloat(e.target.value))}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Price Bottle"
          value={form.price_bottle}
          onChange={(e) => updateField("price_bottle", parseFloat(e.target.value))}
          className="border p-2"
        />

        <input
          type="number"
          placeholder="Bottle Volume (ml)"
          value={form.bottle_volume_ml}
          onChange={(e) => updateField("bottle_volume_ml", parseInt(e.target.value))}
          className="border p-2"
        />
        <input
          type="number"
          placeholder="Shot Size (ml)"
          value={form.shot_size_ml}
          onChange={(e) => updateField("shot_size_ml", parseInt(e.target.value))}
          className="border p-2"
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
