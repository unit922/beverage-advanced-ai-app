"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ExportButtons from "@/components/ExportButtons";
import SearchFilter from "@/components/SearchFilter";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  useEffect(() => {
    async function loadInventory() {
      const { data, error } = await supabase.from("beverages").select("*");
      if (error) console.error(error);
      else {
        setItems(data);
        setFiltered(data);
      }
    }
    loadInventory();
  }, []);

  function handleSearch(term: string) {
    const lower = term.toLowerCase();
    setFiltered(
      items.filter(
        (i) =>
          i.name.toLowerCase().includes(lower) ||
          i.category.toLowerCase().includes(lower)
      )
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📦 Inventory</h1>
      <SearchFilter onSearch={handleSearch} placeholder="Search inventory..." />
      <ExportButtons data={filtered} filename="inventory" />
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Category</th>
            <th className="p-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((it, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{it.name}</td>
              <td className="p-2">{it.category}</td>
              <td className="p-2">{it.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
