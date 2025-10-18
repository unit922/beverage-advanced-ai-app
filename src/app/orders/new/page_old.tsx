"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Beverage = {
  id: string;
  name: string;
  category: string;
  price_shot: number;
  price_rocks: number;
  price_mix: number;
  price_bottle: number;
};

export default function NewOrderPage() {
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [orderItems, setOrderItems] = useState<
    { beverageId: string; option: string; qty: number; price: number }[]
  >([]);
  const router = useRouter();

  // fetch beverages
  useEffect(() => {
    supabase.from("beverages").select("*").then(({ data }) => {
      if (data) setBeverages(data as Beverage[]);
    });
  }, []);

  const addItem = () => {
    setOrderItems([
      ...orderItems,
      { beverageId: "", option: "shot", qty: 1, price: 0 },
    ]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "beverageId" || field === "option") {
      const beverage = beverages.find((b) => b.id === updated[index].beverageId);
      if (beverage) {
        if (updated[index].option === "shot") updated[index].price = beverage.price_shot;
        if (updated[index].option === "rocks") updated[index].price = beverage.price_rocks;
        if (updated[index].option === "mix") updated[index].price = beverage.price_mix;
        if (updated[index].option === "bottle") updated[index].price = beverage.price_bottle;
      }
    }

    setOrderItems(updated);
  };

  const total = orderItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  const handleSubmit = async () => {
    const orderNumber = `ORD-${Date.now()}`;
    const { data: order, error } = await supabase
      .from("orders")
      .insert([{ order_number: orderNumber, total }])
      .select()
      .single();

    if (error) {
      alert("❌ Failed to save order: " + error.message);
      return;
    }

    for (const item of orderItems) {
      await supabase.from("order_items").insert([
        {
          order_id: order.id,
          beverage_id: item.beverageId,
          option: item.option,
          qty: item.qty,
          price: item.price,
        },
      ]);
    }

    alert("✅ Order created!");
    router.push("/admin/dashboard");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🆕 New Order</h1>
      {orderItems.map((item, idx) => (
        <div key={idx} className="flex gap-2 mb-3">
          <select
            value={item.beverageId}
            onChange={(e) => updateItem(idx, "beverageId", e.target.value)}
            className="border p-2 flex-1"
          >
            <option value="">Select beverage</option>
            {beverages.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={item.option}
            onChange={(e) => updateItem(idx, "option", e.target.value)}
            className="border p-2"
          >
            <option value="shot">Shot</option>
            <option value="rocks">On the Rocks</option>
            <option value="mix">Mix</option>
            <option value="bottle">Bottle</option>
          </select>

          <input
            type="number"
            value={item.qty}
            onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
            className="border p-2 w-16"
            min={1}
          />

          <span className="p-2">${item.price.toFixed(2)}</span>
        </div>
      ))}

      <button onClick={addItem} className="bg-blue-600 text-white px-3 py-2 rounded">
        ➕ Add Item
      </button>

      <div className="mt-4 font-bold">Total: ${total.toFixed(2)}</div>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        💾 Save Order
      </button>
    </div>
  );
}
