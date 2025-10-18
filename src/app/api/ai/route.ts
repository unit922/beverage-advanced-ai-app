async function fetchInsights(filteredOrders: any[], query: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-insights`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query, orders: filteredOrders }),
    }
  );

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No insights available.";
}
