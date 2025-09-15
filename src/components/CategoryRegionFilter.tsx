"use client";
import { useState } from "react";

interface Props {
  categories: string[];
  regions: string[];
  onFilter: (category: string, region: string) => void;
}

export default function CategoryRegionFilter({ categories, regions, onFilter }: Props) {
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");

  function applyFilter() {
    onFilter(category, region);
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">All Categories</option>
        {categories.map((c, i) => (
          <option key={i} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">All Regions</option>
        {regions.map((r, i) => (
          <option key={i} value={r}>
            {r}
          </option>
        ))}
      </select>

      <button
        onClick={applyFilter}
        className="px-4 py-2 bg-gray-700 text-white rounded"
      >
        Apply
      </button>
    </div>
  );
}
