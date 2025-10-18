"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRealtime } from "@/lib/useRealtime";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);

  async function loadInventory() {
    const { data } = await supabase.from("beverages").select("*");
    if (data) setItems(data);
  }

  useEffect(() => {
    loadInventory();
  }, []);

  // Realtime sync
  useRealtime("inventory", () => {
    loadInventory();
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📦 Inventory</h1>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Beverage</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Category</th>
            <th className="p-2">Price</th>
            <th className="p-2">Description</th>
</tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{i.name}</td>
              <td className="p-2">{i.quantity}</td>
              <td className="p-2">{i.category}</td>
              <td className="p-2">{i.price}</td> 
              <td className="p-2">{i.description}</td> 


</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
