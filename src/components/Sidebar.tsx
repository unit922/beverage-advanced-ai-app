"use client";

import Link from "next/link";
import { useSupabase } from "./SupabaseProvider";

export default function Sidebar() {
  const { user } = useSupabase();

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4">
      <h2 className="text-lg font-bold mb-4">🍹 Admin</h2>
      <nav className="flex flex-col gap-2">
        <Link href="/admin/dashboard" className="hover:underline">📊 Dashboard</Link>
        <Link href="/orders/new" className="hover:underline">🆕 New Order</Link>
        <Link href="/beverages/new" className="hover:underline">🍾 Add Beverage</Link>
        <Link href="/inventory" className="hover:underline">📦 Inventory</Link>
        <Link href="/admin/feedback" className="hover:underline">💬 Feedback Insights</Link>
      </nav>

      {user && (
        <div className="mt-6 text-sm">
          <p>Logged in as: {user.email}</p>
        </div>
      )}
    </aside>
  );
}
