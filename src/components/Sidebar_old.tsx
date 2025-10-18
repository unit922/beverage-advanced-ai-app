"use client";
import Link from "next/link";
import { useSupabase } from "@/components/SupabaseProvider";

export default function Sidebar() {
  const { supabase, session } = useSupabase();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="w-56 bg-gray-800 text-white flex flex-col">
      <div className="p-4 font-bold text-lg border-b border-gray-700">
        🍹 Admin Panel
      </div>

      <nav className="flex-1 p-2 space-y-2">
        <Link href="/admin" className="block p-2 hover:bg-gray-700 rounded">
          🏠 Dashboard
        </Link>
        <Link href="/admin/orders" className="block p-2 hover:bg-gray-700 rounded">
          🛒 Orders
        </Link>
        <Link href="/admin/inventory" className="block p-2 hover:bg-gray-700 rounded">
          📦 Inventory
        </Link>
        <Link href="/admin/insights" className="block p-2 hover:bg-gray-700 rounded">
          📊 Insights
        </Link>
        <Link href="/admin/feedback" className="block p-2 hover:bg-gray-700 rounded">
          💬 Feedback
        </Link>
        <Link href="/admin/promos" className="block p-2 hover:bg-gray-700 rounded">
          🎟️ Promo Codes
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-700">
        {session?.user ? (
          <div className="space-y-2">
            <p className="text-sm">👤 {session.user.email}</p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-1 rounded"
            >
              🚪 Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-1 rounded"
          >
            🔑 Login
          </Link>
        )}
      </div>
    </aside>
  );
}
