"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

 export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">
        🍹 Beverage AI Pro 
      </h1>
    </main>
  );
}
 
