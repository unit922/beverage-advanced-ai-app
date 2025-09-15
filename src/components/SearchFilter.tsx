"use client";
import { useState } from "react";

interface Props {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export default function SearchFilter({ onSearch, placeholder }: Props) {
  const [query, setQuery] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  }

  return (
    <input
      type="text"
      value={query}
      onChange={handleChange}
      placeholder={placeholder || "Search..."}
      className="mb-4 p-2 border rounded w-64"
    />
  );
}
