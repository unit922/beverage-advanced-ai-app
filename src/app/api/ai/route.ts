import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: query }],
    }),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
