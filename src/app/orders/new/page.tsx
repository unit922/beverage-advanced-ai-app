"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Beverage {
  id: number;
  name: string;
  category: string;
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

const MIXABLE_CATEGORIES = ["whisky", "whiskey", "rum", "vodka", "gin", "tequila"];

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

  const [upsells, setUpsells] = useState<Beverage[]>([]);
  const [loadingUpsell, setLoadingUpsell] = useState(false);

  // ✅ Load beverages + clients
  useEffect(() => {
    async function load() {
      const { data: b } = await supabase.from("beverages").select("*");
      const { data: c } = await supabase.from("clients").select("*");
      if (b) setBeverages(b);
      if (c) setClients(c);
    }
    load();
  }, []);

  // ✅ Recalculate totals
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

      s += (Number(rawPrice) || 0) * it.qty;
    }

    const d = (s * discount) / 100;
    const t = (s * tax) / 100;
    setSubtotal(s);
    setTotal(s - d + t);
  }, [items, discount, tax, beverages]);

  // ✅ Local AI-like upsell simulation (only for mixable drinks)
  useEffect(() => {
    if (!items.length) {
      setUpsells([]);
      return;
    }

    // Check if any selected drink is mixable
    const selectedBeverages = items
      .map((it) => beverages.find((b) => b.id === it.beverage_id))
      .filter(Boolean) as Beverage[];

    const mixableSelected = selectedBeverages.some((b) =>
      MIXABLE_CATEGORIES.includes(b.category.toLowerCase())
    );

    if (!mixableSelected) {
      setUpsells([]);
      return;
    }

    setLoadingUpsell(true);

    setTimeout(() => {
      const selectedNames = selectedBeverages.map((b) => b.name);
      const related = beverages.filter(
        (b) =>
          MIXABLE_CATEGORIES.includes(b.category.toLowerCase()) &&
          !selectedNames.includes(b.name)
      );

      const randomUpsells = beverages
        .filter(
          (b) =>
            MIXABLE_CATEGORIES.includes(b.category.toLowerCase()) &&
            !selectedNames.includes(b.name)
        )
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      setUpsells(related.length ? related.slice(0, 3) : randomUpsells);
      setLoadingUpsell(false);
    }, 700);
  }, [items, beverages]);

  function addItem() {
    if (!beverages.length) return;
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

  async function save() {
    try {
      if (!client) {
        alert("Please select a client");
        return;
      }

      const orderNumber = `ORD-${Date.now()}`;
      const { error } = await supabase.from("orders").insert([
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
          order_item: JSON.stringify(items),
        },
      ]);

      if (error) throw error;

      alert("✅ Order saved successfully!");
      setItems([]);
      setSubtotal(0);
      setTotal(0);
    } catch (err: any) {
      alert("❌ Error saving order: " + err.message);
    }
  }

  return (
    <div className="p-6">
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
          className="border p-2 w-full"
        >
          <option value="">Select client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Order items */}
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
          <div key={i} className="flex gap-2 mb-2 items-center">
            <select
              value={it.beverage_id}
              onChange={(e) =>
                updateItem(i, "beverage_id", Number(e.target.value))
              }
              className="border p-2 w-48"
            >
              {beverages.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              value={it.serving}
              onChange={(e) => updateItem(i, "serving", e.target.value)}
              className="border p-2 w-32"
            >
              <option value="shot">Shot</option>
              <option value="rocks">On the Rocks</option>
              <option value="mix">Mix</option>
              <option value="glass">Glass</option>
              <option value="bottle">Bottle</option>
            </select>

            <input
              type="number"
              value={it.qty}
              onChange={(e) =>
                updateItem(i, "qty", parseInt(e.target.value) || 1)
              }
              className="border p-2 w-16 text-center"
            />

            <span className="w-20 text-right">
              ${(Number(price) || 0).toFixed(2)}
            </span>

            <button
              onClick={() => removeItem(i)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              ✖
            </button>
          </div>
        );
      })}

      <button
        onClick={addItem}
        className="bg-gray-300 px-3 py-1 rounded mt-2 mb-4"
      >
        ➕ Add Beverage
      </button>

      {/* Discount / Tax / Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
        <div>
          <label className="block">Discount (%)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block">Tax (%)</label>
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block">Payment Method</label>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      {/* Order Preview */}
      <div className="mt-6 border-t pt-4 bg-white p-4 rounded shadow-sm">
        <h3 className="font-semibold mb-2">🧾 Order Preview</h3>
        <p>Client: {client?.name || "—"}</p>
        <p>Payment: {payment}</p>

        <table className="w-full mt-2 text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Beverage</th>
              <th className="border px-2 py-1">Serving</th>
              <th className="border px-2 py-1">Qty</th>
              <th className="border px-2 py-1">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
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
                <tr key={idx}>
                  <td className="border px-2 py-1">{bev?.name}</td>
                  <td className="border px-2 py-1 text-center">
                    {it.serving}
                  </td>
                  <td className="border px-2 py-1 text-center">{it.qty}</td>
                  <td className="border px-2 py-1 text-right">
                    ${(Number(price) * it.qty || 0).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-2 text-right">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Discount: {discount}%</p>
          <p>Tax: {tax}%</p>
          <p className="font-semibold text-lg">Total: ${total.toFixed(2)}</p>
        </div>
      </div>

      {/* 🔮 Local AI Mix Suggestions */}
      {upsells.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-semibold mb-2">
            🍹 Mix Ideas & Upsell Suggestions (Local AI)
          </h3>
          {loadingUpsell && <p className="text-gray-500">Analyzing...</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {upsells.map((u) => (
              <div
                key={u.id}
                className="p-3 border rounded bg-white flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.category}</p>
                </div>
                <button
                  onClick={() =>
                    setItems([
                      ...items,
                      { beverage_id: u.id, serving: "mix", qty: 1 },
                    ])
                  }
                  className="bg-green-500 text-white text-sm px-3 py-1 rounded"
                >
                  ➕ Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={save}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-6"
      >
        💾 Save Order
      </button>
    </div>
  );
}
