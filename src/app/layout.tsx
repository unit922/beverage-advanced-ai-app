import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <nav className="p-4 bg-blue-600 text-white font-bold">🍹 Advanced AI Beverage App</nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
