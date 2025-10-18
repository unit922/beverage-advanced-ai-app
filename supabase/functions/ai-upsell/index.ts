import OpenAI from "openai";

Deno.serve(async (req) => {
  const { drinks } = await req.json();
  const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

  const prompt = `Suggest 3 complementary drinks or mixes to go with: ${drinks}. Return only the drink names.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const suggestions = res.choices[0].message.content
    ?.split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return new Response(JSON.stringify({ suggestions }), {
    headers: { "Content-Type": "application/json" },
  });
});
