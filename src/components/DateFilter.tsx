"use client";
import { useState } from "react";

interface Props {
  onFilter: (from: string, to: string) => void;
}

export default function DateFilter({ onFilter }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function applyFilter() {
    onFilter(from, to);
  }

  return (
    <div className="flex gap-2 items-center mb-4">
      <label>From:</label>
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="p-1 border rounded"
      />
      <label>To:</label>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="p-1 border rounded"
      />
      <button
        onClick={applyFilter}
        className="px-3 py-1 bg-gray-700 text-white rounded"
      >
        Apply
      </button>
    </div>
  );
}
