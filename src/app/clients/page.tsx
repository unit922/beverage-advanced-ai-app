"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ClientPortal() {
  const [beverages, setBeverages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    supabase.from("beverages").select("*").then(({ data }) => {
      if (data) setBeverages(data);
    });
  }, []);

  const filtered = beverages.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFeedback = async () => {
    if (!feedback.trim()) return;
    const { error } = await supabase.from("feedback").insert([{ text: feedback }]);
    if (error) alert("Error: " + error.message);
    else {
      alert("✅ Feedback submitted");
      setFeedback("");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🍹 Client Portal</h1>

      <input
        type="text"
        placeholder="Search beverages..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((b) => (
          <div key={b.id} className="border p-4 rounded shadow bg-white">
            <h2 className="text-lg font-semibold">{b.name}</h2>
            <p className="text-sm text-gray-600">{b.category}</p>
            <div className="mt-2 text-sm">
              <p>💰 ${b.price_shot} / shot</p>
              <p>💰 ${b.price_rocks} / rocks</p>
              <p>💰 ${b.price_mix} / mix</p>
              <p>💰 ${b.price_glass} / glass</p>
              <p>💰 ${b.price_bottle} / bottle</p>
            </div>
            <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">
              🛒 Order
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">📝 Leave Feedback</h2>
        <textarea
          className="border p-2 w-full"
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button
          onClick={handleFeedback}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
}
