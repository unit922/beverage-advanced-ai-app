"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewClientPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("clients").insert([form]);
    if (error) alert("⚠️ Error: " + error.message);
    else alert("✅ Client added!");
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">👤 New Client</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded w-full"
        >
          Save Client
        </button>
      </form>
    </div>
  );
}
