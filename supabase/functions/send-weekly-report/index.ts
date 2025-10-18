// Supabase Edge Function: send-weekly-report
// Run on schedule: sends PDF + CSV report to admin emails

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import jsPDF from "npm:jspdf";
import autoTable from "npm:jspdf-autotable";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // 🔑 requires service role
  );

  // 1. Fetch last 7 days of orders
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .gte("order_date", since.toISOString());

  // 2. Build CSV
  const headers = ["Client", "Item", "Category", "Qty", "Total", "Date", "Region"];
  const csvRows = [
    headers.join(","),
    ...(orders || []).map(
      (o) =>
        `${o.client_name},${o.order_item},${o.category},${o.quantity},${o.total},${o.order_date},${o.region}`
    ),
  ];
  const csvContent = csvRows.join("\n");
  const csvBase64 = encode(new TextEncoder().encode(csvContent));

  // 3. Build PDF
  const doc = new jsPDF();
  doc.text("📊 Weekly Orders Report", 14, 16);
  (doc as any).autoTable({
    head: [headers],
    body: (orders || []).map((o) => [
      o.client_name,
      o.order_item,
      o.category,
      o.quantity,
      o.total,
      o.order_date,
      o.region,
    ]),
    startY: 20,
  });
  const pdfBase64 = encode(doc.output("arraybuffer"));

  // 4. Send email via Supabase Email (or Resend/SMTP)
  const { error } = await supabase.functions.invoke("send-email", {
    body: {
      to: "admin@example.com",
      subject: "📊 Weekly Orders Report",
      text: "Attached are the weekly orders in PDF and CSV format.",
      attachments: [
        { filename: "weekly_report.csv", content: csvBase64 },
        { filename: "weekly_report.pdf", content: pdfBase64 },
      ],
    },
  });

  if (error) {
    console.error("❌ Email send failed:", error);
    return new Response("Error sending email", { status: 500 });
  }

  return new Response("✅ Weekly report sent!", { status: 200 });
});
