"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Order {
  id: number;
  client_name: string;
  client_email?: string;
  customer_phone?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  order_item: string;
  payment_method: string;
  created_at: string;
}

interface Beverage {
  id: number;
  name: string;
  category?: string;
  price: number;
  price_shot?: number;
  price_rocks?: number;
  price_mix?: number;
  price_bottle?: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [beverages, setBeverages] = useState<Beverage[]>([]);
  const [aiText, setAiText] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [mixIdeas, setMixIdeas] = useState<string[]>([]);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Load orders + beverages
  useEffect(() => {
    async function load() {
      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .order("id", { ascending: false });
      const { data: b } = await supabase.from("beverages").select("*");
      if (o) setOrders(o);
      if (b) setBeverages(b);
    }
    load();
  }, []);

  // AI insights (global)
  async function getInsights(order: Order) {
    setLoading(true);
    setAiText("🔮 Generating AI insights...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ orders: [order], beverages }),
        }
      );
      const data = await res.json();
      setAiText(data.aiText || "No insights available.");
    } catch (err) {
      console.error(err);
      setAiText("⚠️ Failed to load insights.");
    } finally {
      setLoading(false);
    }
  }

  // Get cocktail mix ideas (from thecocktaildb.com)
  async function getMixIdeas(bevName: string) {
    try {
      const res = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
          bevName
        )}`
      );
      const data = await res.json();
      if (data?.drinks?.length) {
        const ideas = data.drinks
          .slice(0, 3)
          .map(
            (d: any) =>
              `${d.strDrink} — ${d.strInstructions?.slice(0, 100)}...`
          );
        setMixIdeas(ideas);
      } else {
        setMixIdeas([]);
      }
    } catch {
      setMixIdeas([]);
    }
  }

  // Render beverage items for a given order
  function renderItems(order: Order) {
    try {
      const items = JSON.parse(order.order_item || "[]");
      return items
        .map((it: any) => {
          const bev = beverages.find((b) => b.id === it.beverage_id);
          const price =
            it.serving === "shot"
              ? bev?.price_shot ?? bev?.price
              : it.serving === "rocks"
              ? bev?.price_rocks ?? bev?.price
              : it.serving === "mix"
              ? bev?.price_mix ?? bev?.price
              : bev?.price_bottle ?? bev?.price;
          return `${bev?.name || "Unknown"} (${it.serving}) x${it.qty} @ $${price}`;
        })
        .join(", ");
    } catch {
      return "—";
    }
  }

  // Export receipt as PDF
  function exportPDF(order: Order) {
    if (!pdfRef.current) return;
    const doc = new jsPDF();
    doc.text(`Order Receipt #${order.id}`, 10, 10);
    doc.text(`Client: ${order.client_name}`, 10, 20);
    doc.text(`Payment: ${order.payment_method}`, 10, 30);

    const items = JSON.parse(order.order_item || "[]");
    const rows = items.map((it: any) => {
      const bev = beverages.find((b) => b.id === it.beverage_id);
      const price =
        it.serving === "shot"
          ? bev?.price_shot ?? bev?.price
          : it.serving === "rocks"
          ? bev?.price_rocks ?? bev?.price
          : it.serving === "mix"
          ? bev?.price_mix ?? bev?.price
          : bev?.price_bottle ?? bev?.price;
      return [bev?.name || "Unknown", it.serving, it.qty, `$${price}`, `$${(
        price! * it.qty
      ).toFixed(2)}`];
    });

    (doc as any).autoTable({
      head: [["Beverage", "Serving", "Qty", "Price", "Total"]],
      body: rows,
      startY: 40,
    });

    doc.text(
      `Subtotal: $${order.subtotal.toFixed(2)}\nDiscount: $${order.discount_amount.toFixed(
        2
      )}\nTax: $${order.tax_amount.toFixed(2)}\nTotal: $${order.total.toFixed(2)}`,
      10,
      doc.lastAutoTable.finalY + 10
    );

    doc.save(`order_${order.id}.pdf`);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📦 Orders</h1>

      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Client</th>
            <th className="p-2">Items</th>
            <th className="p-2">Total</th>
            <th className="p-2">Date</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b">
              <td className="p-2">{o.client_name}</td>
              <td className="p-2 text-sm">{renderItems(o)}</td>
              <td className="p-2">${o.total.toFixed(2)}</td>
              <td className="p-2">{new Date(o.created_at).toLocaleString()}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => setSelected(o)}
                  className="bg-gray-300 px-2 py-1 rounded text-sm"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => getInsights(o)}
                  className="bg-indigo-600 text-white px-2 py-1 rounded text-sm"
                >
                  {loading ? "..." : "AI"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Order Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={pdfRef}
            className="bg-white p-6 rounded-lg w-[90%] max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-xl font-semibold mb-3">
              🧾 Order #{selected.id}
            </h2>
            <p>
              <strong>Client:</strong> {selected.client_name} <br />
              <strong>Email:</strong> {selected.client_email || "—"} <br />
              <strong>Phone:</strong> {selected.customer_phone || "—"} <br />
              <strong>Payment:</strong> {selected.payment_method}
            </p>

            <h3 className="mt-4 font-semibold">Items:</h3>
            <ul className="list-disc ml-5 mb-4">
              {(() => {
                try {
                  const items = JSON.parse(selected.order_item || "[]");
                  return items.map((it: any, idx: number) => {
                    const bev = beverages.find((b) => b.id === it.beverage_id);
                    const price =
                      it.serving === "shot"
                        ? bev?.price_shot ?? bev?.price
                        : it.serving === "rocks"
                        ? bev?.price_rocks ?? bev?.price
                        : it.serving === "mix"
                        ? bev?.price_mix ?? bev?.price
                        : bev?.price_bottle ?? bev?.price;
                    return (
                      <li key={idx} className="mb-1">
                        {bev?.name || "Unknown"} ({it.serving}) — Qty: {it.qty} × $
                        {price?.toFixed(2)} = ${(price! * it.qty).toFixed(2)}
                        {it.serving === "mix" && (
                          <button
                            onClick={() => getMixIdeas(bev?.name || "")}
                            className="ml-2 text-blue-600 underline text-sm"
                          >
                            Mix Ideas
                          </button>
                        )}
                      </li>
                    );
                  });
                } catch {
                  return <li>Invalid order data</li>;
                }
              })()}
            </ul>

            {mixIdeas.length > 0 && (
              <div className="bg-yellow-50 border p-3 rounded mb-4">
                <strong>🍹 Mix Ideas:</strong>
                <ul className="list-disc ml-5 mt-1">
                  {mixIdeas.map((idea, idx) => (
                    <li key={idx}>{idea}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t pt-2 text-right">
              <p>Subtotal: ${selected.subtotal.toFixed(2)}</p>
              <p>Discount: ${selected.discount_amount.toFixed(2)}</p>
              <p>Tax: ${selected.tax_amount.toFixed(2)}</p>
              <p className="font-bold">Total: ${selected.total.toFixed(2)}</p>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => exportPDF(selected)}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                ⬇️ Export PDF
              </button>
              <button
                onClick={() => setSelected(null)}
                className="bg-gray-400 text-white px-4 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Output */}
      {aiText && (
        <div className="p-4 bg-blue-50 border rounded mt-6">
          <h3 className="font-semibold mb-2">AI Insights</h3>
          <p className="whitespace-pre-line">{aiText}</p>
        </div>
      )}
    </div>
  );
}
