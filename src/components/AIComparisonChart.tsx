"use client";
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface ComparisonChartProps {
  current: any[];
  historical: any[];
  categories: string[];
  regions: string[];
  clients: string[];
  label?: string;
}

export default function AIComparisonChart({
  current,
  historical,
  categories,
  regions,
  clients,
  label = "Orders",
}: ComparisonChartProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Toggle selection
  function toggleSelection(setFn: any, list: string[], item: string) {
    setFn(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  // Filtering function
  function filterData(dataset: any[]) {
    return dataset.filter((d) => {
      return (
        (selectedCategories.length === 0 || selectedCategories.includes(d.category)) &&
        (selectedRegions.length === 0 || selectedRegions.includes(d.region)) &&
        (selectedClients.length === 0 || selectedClients.includes(d.client_name))
      );
    });
  }

  const filteredCurrent = filterData(current);
  const filteredHistorical = filterData(historical);

  // Build X-axis
  const days = Array.from(
    new Set([...filteredCurrent.map((c) => c.day), ...filteredHistorical.map((h) => h.day)])
  );

  const data = days.map((day) => ({
    day,
    current: filteredCurrent.find((c) => c.day === day)?.value || 0,
    historical: filteredHistorical.find((h) => h.day === day)?.value || 0,
  }));

  async function explainChart() {
    setLoading(true);
    setExplanation(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            mode: "explain_chart",
            current: filteredCurrent,
            historical: filteredHistorical,
            label,
            filters: {
              categories: selectedCategories,
              regions: selectedRegions,
              clients: selectedClients,
            },
          }),
        }
      );
      const data = await res.json();
      setExplanation(data?.explanation || "No explanation available.");
    } catch (err) {
      setExplanation("⚠️ Error contacting AI service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold">📊 {label}: Current vs Historical</h2>

      {/* Multi-select Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Categories */}
        <div>
          <p className="font-medium">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <label key={c} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c)}
                  onChange={() =>
                    toggleSelection(setSelectedCategories, selectedCategories, c)
                  }
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div>
          <p className="font-medium">Regions</p>
          <div className="flex flex-wrap gap-2">
            {regions.map((r) => (
              <label key={r} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(r)}
                  onChange={() =>
                    toggleSelection(setSelectedRegions, selectedRegions, r)
                  }
                />
                {r}
              </label>
            ))}
          </div>
        </div>

        {/* Clients */}
        <div>
          <p className="font-medium">Clients</p>
          <div className="flex flex-wrap gap-2">
            {clients.map((cl) => (
              <label key={cl} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedClients.includes(cl)}
                  onChange={() =>
                    toggleSelection(setSelectedClients, selectedClients, cl)
                  }
                />
                {cl}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="current" stroke="#2563eb" name="Current Week" />
          <Line type="monotone" dataKey="historical" stroke="#16a34a" name="Similar Past Week" />
        </LineChart>
      </ResponsiveContainer>

      {/* Explain Button */}
      <button
        onClick={explainChart}
        className="px-4 py-2 bg-indigo-600 text-white rounded shadow"
        disabled={loading}
      >
        {loading ? "Analyzing…" : "🤖 Explain Chart"}
      </button>

      {explanation && (
        <div className="p-3 bg-gray-100 rounded text-sm">
          <strong>AI Analysis:</strong>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}
