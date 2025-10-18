"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditBeveragePage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price_bottle: 0,
    price_shot: 0,
    price_rocks: 0,
    price_mix: 0,
    price_glass: 0,
    stock_bottles: 0,
    reorder_threshold: 5,
    bottle_volume_ml: 750,
    shot_size_ml: 44,
    stock_shots: 0,
    image_url: "",
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load existing beverage
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("beverages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("❌ Error loading beverage: " + error.message);
        return;
      }

      if (data) setForm(data);
    }

    load();
  }, [id]);

  function handleChange(e: any) {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    // auto recalc shots
    if (
      name === "bottle_volume_ml" ||
      name === "shot_size_ml" ||
      name === "stock_bottles"
    ) {
      const volume = parseFloat(updated.bottle_volume_ml) || 0;
      const shot = parseFloat(updated.shot_size_ml) || 44;
      const bottles = parseFloat(updated.stock_bottles) || 0;
      updated.stock_shots =
        bottles > 0 && shot > 0 ? Math.floor((bottles * volume) / shot) : 0;
    }

    setForm(updated);
  }

  async function fetchMixSuggestions(drinkName: string) {
    try {
      setLoading(true);
      setSuggestions([]);

      const res = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drinkName}`
      );
      const data = await res.json();

      if (data.drinks && data.drinks.length > 0) {
        const matches = data.drinks.slice(0, 5).map((d: any) => d.strDrink);
        setSuggestions(matches);
      } else {
        // fallback basic AI suggestions
        setSuggestions([
          "Mix with Coke or Sprite",
          "Serve On the Rocks",
          "Try a Whisky Sour",
        ]);
      }
    } catch (err) {
      console.error("Error fetching mix ideas:", err);
      setSuggestions(["Mix with cola", "Add lime juice", "Try ginger ale"]);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    try {
      const { error } = await supabase
        .from("beverages")
        .update(form)
        .eq("id", id);

      if (error) throw error;

      alert("✅ Beverage updated successfully!");
      router.push("/beverages");
    } catch (err: any) {
      alert("❌ Error updating beverage: " + err.message);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🍸 Edit Beverage</h1>

      {[
        { label: "Name", name: "name" },
        { label: "Category", name: "category" },
        { label: "Description", name: "description" },
      ].map((f) => (
        <div key={f.name} className="mb-3">
          <label className="block font-medium">{f.label}</label>
          <input
            type="text"
            name={f.name}
            value={(form as any)[f.name]}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label>Price (Bottle)</label>
          <input
            type="number"
            name="price_bottle"
            value={form.price_bottle}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Price (Shot)</label>
          <input
            type="number"
            name="price_shot"
            value={form.price_shot}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Price (Rocks)</label>
          <input
            type="number"
            name="price_rocks"
            value={form.price_rocks}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Price (Mix)</label>
          <input
            type="number"
            name="price_mix"
            value={form.price_mix}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Price (Glass)</label>
          <input
            type="number"
            name="price_glass"
            value={form.price_glass}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div>
          <label>Bottle Volume (ml)</label>
          <input
            type="number"
            name="bottle_volume_ml"
            value={form.bottle_volume_ml}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Shot Size (ml)</label>
          <input
            type="number"
            name="shot_size_ml"
            value={form.shot_size_ml}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label>Stock (Bottles)</label>
          <input
            type="number"
            name="stock_bottles"
            value={form.stock_bottles}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
      </div>

      <div className="mt-4">
        <label>Calculated Stock (Shots)</label>
        <input
          type="number"
          readOnly
          value={form.stock_shots}
          className="border p-2 w-full bg-gray-100"
        />
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => fetchMixSuggestions(form.name)}
          disabled={!form.name || loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Loading..." : "🔍 Get Mix Suggestions"}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-4 bg-gray-50 p-3 border rounded">
          <h3 className="font-semibold mb-2">AI / CocktailDB Suggestions:</h3>
          <ul className="list-disc ml-6">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={save}
        className="bg-blue-600 text-white px-6 py-2 rounded mt-6"
      >
        💾 Save Changes
      </button>
    </div>
  );
}
