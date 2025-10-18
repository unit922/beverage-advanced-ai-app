"use client";
import { useEffect, useState } from "react";

type Beverage = {
  id: number;
  name: string;
  category: string;
  
};

type ServingOption = {
  id: number;
  option_name: string;
  price: number;
};

export default function ClientPortal() {
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [options, setOptions] = useState<Record<number, ServingOption[]>>({});
  const clientId = "demo-client-uuid"; // Replace with logged-in client

  async function load() {
    // Beverages
    const resB = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/beverages`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      }
    );
    const bevData = await resB.json();
    setBeverages(bevData);

    // Serving options per beverage
    const resO = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/serving_options`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      }
    );
    const optData = await resO.json();
    const grouped: Record<number, ServingOption[]> = {};
    optData.forEach((o: ServingOption & { beverage_id: number }) => {
      if (!grouped[o.beverage_id]) grouped[o.beverage_id] = [];
      grouped[o.beverage_id].push({
        id: o.id,
        option_name: o.option_name,
        price: o.price,
      });
    });
    setOptions(grouped);
  }

  useEffect(() => {
    load();
  }, []);

  async function order(bev: Beverage, option: ServingOption) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders`,
        {
          method: "POST",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            client_id: clientId,
            beverage_id: bev.id,
            serving_option_id: option.id,
            quantity: 1,
            total: option.price,
            status: "pending",
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      alert(`✅ Ordered ${bev.name} (${option.option_name})`);
    } catch (err) {
      console.error("Order failed", err);
      alert("⚠️ Failed to place order.");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🍹 Client Portal</h1>

      {/* Offers with serving options */}
      <section>
        <h2 className="text-xl font-semibold mb-2">🍸 Our Offers</h2>
        <ul className="space-y-4">
          {beverages.map((b) => (
            <li key={b.id} className="p-3 border rounded space-y-2">
              <div className="font-medium">{b.name}</div>
              <div className="text-sm text-gray-500">{b.category}</div>

              {/* Serving options */}
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(options[b.id] || []).map((opt) => (
                  <li
                    key={opt.id}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <span>{opt.option_name}</span>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-gray-600">
                        ${opt.price}
                      </span>
                      <button
                        onClick={() => order(b, opt)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                      >
                        Order
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
