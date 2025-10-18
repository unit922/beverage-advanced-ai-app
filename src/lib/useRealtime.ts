"use client";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";

export function useRealtime(
  table: string,
  onChange: (payload: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload);
          onChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onChange]);
}
