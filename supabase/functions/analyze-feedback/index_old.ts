// supabase/functions/analyze-feedback/index.ts
// supabase/functions/analyze-feedback/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.1/mod.ts";

// ✅ Initialize OpenAI with the Supabase env var
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

serve(async (req: Request) => {
  // ✅ Handle preflight CORS requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  try {
    const { feedback } = await req.json();
    if (!feedback || feedback.length === 0) {
      return new Response(
        JSON.stringify({ error: "No feedback provided." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // ✅ Ask OpenAI to analyze feedback
    const prompt = `
You are an AI assistant for a beverage business. Analyze the following customer feedback:

${feedback.map((f: any, i: number) => `${i + 1}. ${f.text}`).join("\n")}

Please respond in JSON with the following structure:
{
  "summary": "short business-focused summary",
  "sentimentBreakdown": {
    "positive": number,
    "neutral": number,
    "negative": number
  },
  "recommendations": [
    "actionable insight 1",
    "actionable insight 2"
  ]
}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // lightweight but strong
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    // ✅ Parse AI response
    const aiText = completion.choices[0].message?.content ?? "{}";
    let insights;
    try {
      insights = JSON.parse(aiText);
    } catch (_err) {
      insights = { summary: aiText, sentimentBreakdown: {}, recommendations: [] };
    }

    return new Response(JSON.stringify(insights), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // allow all origins
      },
    });
  } catch (err: any) {
    console.error("❌ Error in analyze-feedback:", err);

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
