"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Beverage {
  id: number;
  item?: string; // ✅ DB column (was name)
  name?: string; // fallback
  price: number;
  price_shot?: number | null;
  price_rocks?: number | null;
  price_mix?: number | null;
  price_glass?: number | null;
  price_bottle?: number | null;
}

interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface OrderItem {
  beverage_id: number;
  serving: string;
  qty: number;
}

export default function NewOrderPage() {
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [payment, setPayment] = useState("cash");
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Load clients and beverages
  useEffect(() => {
    async function load() {
      const { data: b, error: be } = await supabase.from("beverages").select("*");
      const { data: c, error: ce } = await supabase.from("clients").select("*");

      console.log("📦 Beverages loaded:", b);
      console.log("👥 Clients loaded:", c);

      if (b) setBeverages(b);
      if (c) setClients(c);
      if (be) console.error("❌ Beverages load error:", be.message);
      if (ce) console.error("❌ Clients load error:", ce.message);
    }
    load();
  }, []);

  // Recalculate subtotal and total
  useEffect(() => {
    let s = 0;
    for (const it of items) {
      const bev = beverages.find((b) => b.id === it.beverage_id);
      if (!bev) continue;

      const rawPrice =
        it.serving === "shot"
          ? bev.price_shot ?? bev.price
          : it.serving === "rocks"
          ? bev.price_rocks ?? bev.price
          : it.serving === "mix"
          ? bev.price_mix ?? bev.price
          : it.serving === "glass"
          ? bev.price_glass ?? bev.price
          : bev.price_bottle ?? bev.price;

      const price = Number(rawPrice) || 0;
      s += price * it.qty;
    }

    const d = (s * discount) / 100;
    const t = (s * tax) / 100;
    setSubtotal(s);
    setTotal(s - d + t);
  }, [items, discount, tax, beverages]);

  // Add beverage item
  function addItem() {
    if (!beverages.length) {
      alert("No beverages available.");
      return;
    }
    setItems([
      ...items,
      { beverage_id: beverages[0].id, serving: "shot", qty: 1 },
    ]);
  }

  function updateItem(i: number, field: keyof OrderItem, val: any) {
    const copy = [...items];
    (copy[i] as any)[field] = val;
    setItems(copy);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  // Save order + related items
  async function save() {
    try {
      if (!client) {
        alert("Please select a client first.");
        return;
      }

      if (!items.length) {
        alert("Add at least one beverage to the order.");
        return;
      }

      const orderNumber = `ORD-${Date.now()}`;

      // 1️⃣ Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            order_number: orderNumber,
            client_id: client.id,
            client_name: client.name,
            client_email: client.email,
            customer_phone: client.phone,
            subtotal,
            discount_amount: (subtotal * discount) / 100,
            tax_amount: (subtotal * tax) / 100,
            total,
            payment_method: payment,
            payment_status: "pending",
            status: "pending",
          },
        ])
        .select("id")
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.id;

      // 2️⃣ Build and insert order_items
      const itemRows = items.map((it) => {
        const bev = beverages.find((b) => b.id === it.beverage_id);
        const rawPrice =
          it.serving === "shot"
            ? bev?.price_shot ?? bev?.price
            : it.serving === "rocks"
            ? bev?.price_rocks ?? bev?.price
            : it.serving === "mix"
            ? bev?.price_mix ?? bev?.price
            : it.serving === "glass"
            ? bev?.price_glass ?? bev?.price
            : bev?.price_bottle ?? bev?.price;

        const price = Number(rawPrice) || 0;
        const totalLine = price * it.qty;

        return {
          order_id: orderId,
          beverage_id: it.beverage_id,
          quantity: it.qty,
          price,
          total: totalLine,
          serving: it.serving,
          price_used: price,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemRows);

      if (itemsError) throw itemsError;

      alert("✅ Order saved successfully!");
      setItems([]);
      setClient(null);
      setSubtotal(0);
      setTotal(0);
    } catch (err: any) {
      console.error("❌ Error saving order:", err.message);
      alert("❌ Error saving order: " + err.message);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">➕ New Order</h1>

      {/* Client selection */}
      <div className="mb-4">
        <label className="block font-medium">Client</label>
        <select
          value={client?.id || ""}
          onChange={(e) => {
            const c = clients.find((c) => c.id === Number(e.target.value));
            if (c) setClient(c);
          }}
          className="border p-2 w-full rounded"
        >
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items Section */}
      <h2 className="font-medium mb-2">Items</h2>
      {items.map((it, i) => {
        const bev = beverages.find((b) => b.id === it.beverage_id);
        const price =
          it.serving === "shot"
            ? bev?.price_shot ?? bev?.price
            : it.serving === "rocks"
            ? bev?.price_rocks ?? bev?.price
            : it.serving === "mix"
            ? bev?.price_mix ?? bev?.price
            : it.serving === "glass"
            ? bev?.price_glass ?? bev?.price
            : bev?.price_bottle ?? bev?.price;

        return (
          <div key={i} className="flex flex-wrap gap-2 mb-2 items-center">
            {/* Beverage dropdown */}
            <select
              value={it.beverage_id}
              onChange={(e) =>
                updateItem(i, "beverage_id", Number(e.target.value))
              }
              className="border p-2 w-64 rounded"
            >
              <option value="">Select beverage</option>
              {beverages.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.item || b.name}
                </option>
              ))}
            </select>

            {/* Serving */}
            <select
              value={it.serving}
              onChange={(e) => updateItem(i, "serving", e.target.value)}
              className="border p-2 rounded"
            >
              <option value="shot">Shot</option>
              <option value="rocks">On the Rocks</option>
              <option value="mix">Mix</option>
              <option value="glass">Glass</option>
              <option value="bottle">Bottle</option>
            </select>

            {/* Quantity */}
            <input
              type="number"
              min={1}
              value={it.qty}
              onChange={(e) =>
                updateItem(i, "qty", parseInt(e.target.value) || 1)
              }
              className="border p-2 w-20 text-center rounded"
            />

            {/* Price */}
            <span className="w-24 text-right font-medium">
              ${(Number(price) || 0).toFixed(2)}
            </span>

            {/* Remove */}
            <button
              onClick={() => removeItem(i)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              ✖
            </button>
          </div>
        );
      })}

      {/* Add new beverage */}
      <button
        onClick={addItem}
        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded mt-2 mb-4"
      >
        ➕ Add Beverage
      </button>

      {/* Discounts and Tax */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block">Discount (%)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block">Tax (%)</label>
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
            className="border p-2 w-full rounded"
          />
        </div>
      </div>

      {/* Payment */}
      <div className="mb-4">
        <label className="block">Payment Method</label>
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="online">Online</option>
        </select>
      </div>

      {/* Totals */}
      <div className="mt-6 border-t pt-4 space-y-1">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Total: ${total.toFixed(2)}</p>
      </div>

      {/* Save */}
      <button
        onClick={save}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700"
      >
        💾 Save Order
      </button>
    </div>
  );
}
