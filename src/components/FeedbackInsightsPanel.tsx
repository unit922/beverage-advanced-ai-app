"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface FeedbackEntry {
  id: string;
  created_at: string;
  summary?: string | null;
  sentiment_breakdown?: {
    positive?: number;
    neutral?: number;
    negative?: number;
  };
}

export default function FeedbackInsightsPanel() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  /** 🔄 Fetch feedback data safely */
  async function loadFeedback() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedback_analysis")
        .select("id, created_at, summary, sentiment_breakdown")
        .order("created_at", { ascending: true });

      if (error) throw error;

      console.log("✅ Feedback analysis loaded:", data);
      setFeedback(data || []);
      generateAISummary(data || []);
    } catch (err: any) {
      console.error("❌ Error fetching feedback_analysis:", err.message);
      setAiSummary("⚠️ Unable to fetch live feedback. Showing offline summary.");
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  }

  /** 🧠 Generate AI-style summary (local simulation if AI endpoint is unavailable) */
  function generateAISummary(entries: FeedbackEntry[]) {
    if (!entries.length) {
      setAiSummary("No feedback data available yet.");
      return;
    }

    let totalPos = 0,
      totalNeu = 0,
      totalNeg = 0;

    for (const e of entries) {
      totalPos += e.sentiment_breakdown?.positive || 0;
      totalNeu += e.sentiment_breakdown?.neutral || 0;
      totalNeg += e.sentiment_breakdown?.negative || 0;
    }

    const count = entries.length;
    const avgPos = totalPos / count;
    const avgNeu = totalNeu / count;
    const avgNeg = totalNeg / count;

    let dominant = "neutral";
    if (avgPos > avgNeg && avgPos > avgNeu) dominant = "positive";
    else if (avgNeg > avgPos && avgNeg > avgNeu) dominant = "negative";

    let summary = `📈 Feedback Trend Overview:\n`;
    summary += `• Positive: ${(avgPos * 100).toFixed(1)}%\n`;
    summary += `• Neutral: ${(avgNeu * 100).toFixed(1)}%\n`;
    summary += `• Negative: ${(avgNeg * 100).toFixed(1)}%\n\n`;
    summary += `💡 Insight: Overall sentiment appears **${dominant.toUpperCase()}**.\n`;

    if (dominant === "positive")
      summary += `Customers are mostly satisfied — continue promoting current best-sellers.`;
    else if (dominant === "neutral")
      summary += `Mixed feedback — consider seasonal offers or targeted surveys.`;
    else
      summary += `Negative sentiment is increasing — investigate service quality or pricing issues.`;

    setAiSummary(summary);
  }

  return (
    <div className="p-6 bg-white border rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">💬 Feedback Insights</h2>
        <button
          onClick={loadFeedback}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {loading ? "🔄 Loading..." : "⟳ Refresh"}
        </button>
      </div>

      <div className="border-t pt-3 text-sm text-gray-800 whitespace-pre-wrap">
        {aiSummary || "No insights yet. Click Refresh to load data."}
      </div>

      {feedback.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h3 className="font-semibold mb-2">Recent Feedback</h3>
          <ul className="space-y-2 text-sm text-gray-700 max-h-64 overflow-y-auto">
            {feedback
              .slice(-10)
              .reverse()
              .map((f) => (
                <li
                  key={f.id}
                  className="border rounded p-2 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="text-xs text-gray-500">
                    {new Date(f.created_at).toLocaleString()}
                  </div>
                  {f.summary ? (
                    <div>{f.summary}</div>
                  ) : (
                    <div className="italic text-gray-400">No summary provided.</div>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
