import { ReactNode } from "react";
import "./globals.css";
import SupabaseProvider from "@/components/SupabaseProvider";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
       <SupabaseProvider>{children}</SupabaseProvider> 
        {/* Top navigation always visible */}
        <nav className="p-2 bg-blue-600 text-white font-bold">
          🍹 Advanced AI Beverage App
        </nav>

        
<nav className="p-1 bg-blue-600 text-white flex gap-4">
  <a href="/">Dashboard</a>
  <a href="/orders">Orders</a>
  <a href="/inventory">Inventory</a>
  <a href="/analytics">Analytics</a>
</nav>


        {/* Footer nav (optional) */}
        <nav className="p-2 bg-blue-600 text-white text-center">
          © {new Date().getFullYear()} Beverage AI Pro
        </nav>
      </body>
    </html>
  );
}

