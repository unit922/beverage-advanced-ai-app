// src/components/AIChatbot.tsx
"use client";
import { useState } from "react";

type Message = { role: "user" | "assistant", text: string };


export default function AIChatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]); 
  const [loading, setLoading] = useState(false);

  async function send() {
const userMsg = input.trim();

if (userMsg.startsWith("similar")) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/find-similar-insights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ query: userMsg }),
  });
  const data = await res.json();
  setMessages((m) => [...m, { role: "assistant", text: JSON.stringify(data.matches, null, 2) }]);
  return;
}

if (!input.trim()) return;
    // const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ mode: "chat", query: userMsg }),
      });
      const data = await res.json();
      const assistantText = data?.chat_response ||  "No response";
      setMessages((m) => [...m, { role: "assistant", text: assistantText }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: "Error contacting AI." }]);
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="bg-white p-4 rounded shadow max-w-lg">
      <h4 className="mb-3 font-semibold">AI Chat — ask anything</h4>
      <div className="space-y-3 mb-3 max-h-64 overflow-auto">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded ${m.role === "user" ? "bg-blue-50 self-end" : "bg-gray-50"}`}>
            <div className="text-sm">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="e.g. Which drinks trended last week?"
        />
        <button disabled={loading} onClick={send} className="px-3 py-2 bg-indigo-600 text-white rounded">Ask</button>
      </div>
    </div>
  );
}
