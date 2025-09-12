"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    async function loadInventory() {
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) console.error(error);
      else setInventory(data);
    }
    loadInventory();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📊 MultiTasking AI Dashboard</h1>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Category</th>
            <th className="p-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((bev, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{bev.name}</td>
              <td className="p-2">{bev.category}</td>
              <td className="p-2">{bev.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
