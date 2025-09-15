"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ExportButtons from "@/components/ExportButtons";
import SearchFilter from "@/components/SearchFilter";
import DateFilter from "@/components/DateFilter";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  useEffect(() => {
    async function loadOrders() {
      const { data, error } = await supabase.from("orders").select("*");
      if (error) console.error(error);
      else {
        setOrders(data);
        setFiltered(data);
      }
    }
    loadOrders();
  }, []);

  function handleSearch(term: string) {
    const lower = term.toLowerCase();
    setFiltered(
      orders.filter(
        (o) =>
          o.client_name.toLowerCase().includes(lower) ||
          o.order_item.toLowerCase().includes(lower)
      )
    );
  }

  function handleDateFilter(from: string, to: string) {
    let result = [...orders];
    if (from) result = result.filter((o) => new Date(o.order_date) >= new Date(from));
    if (to) result = result.filter((o) => new Date(o.order_date) <= new Date(to));
    setFiltered(result);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🧾 Orders</h1>
      <div className="flex flex-col gap-2 md:flex-row md:gap-4">
        <SearchFilter onSearch={handleSearch} placeholder="Search orders..." />
        <DateFilter onFilter={handleDateFilter} />
      </div>
      <ExportButtons data={filtered} filename="orders" />
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Client</th>
            <th className="p-2">Item</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Total</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((o, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{o.client_name}</td>
              <td className="p-2">{o.order_item}</td>
              <td className="p-2">{o.quantity}</td>
              <td className="p-2">{o.total}</td>
              <td className="p-2">{o.order_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
