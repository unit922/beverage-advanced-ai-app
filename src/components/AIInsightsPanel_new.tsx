"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AIInsightsPanel() {
  const [loading,setLoading] = useState(false);
  const [insights,setInsights] = useState<any>(null);
  const [error,setError] = useState<string|null>(null);

  async function load(query:string){
    setLoading(true); setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if(!session){ setError('Not logged in'); setLoading(false); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-insights`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${session.access_token}`
        },
        body: JSON.stringify({ query })
      });
      if(!res.ok) throw new Error('Fetch failed: ' + res.status);
      const d = await res.json();
      setInsights(d);
    } catch(err:any){
      setError(err.message);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load('trending cocktails this season'); },[]);

  return (
    <div className="p-4 bg-white shadow rounded">
      <h3 className="font-bold">🤖 AI Insights</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {insights && <pre className="text-sm bg-gray-100 p-2 rounded">{JSON.stringify(insights,null,2)}</pre>}
    </div>
  );
}
