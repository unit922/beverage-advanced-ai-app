"use client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Props {
  data: any[];
  filename: string;
}

export default function ExportButtons({ data, filename }: Props) {
  // CSV
  function exportCSV() {
    const header = Object.keys(data[0] || {}).join(",");
    const rows = data.map(row =>
      Object.values(row).map(v => `"${v}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${filename}.csv`);
  }

  // Excel
  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${filename}.xlsx`);
  }

  // PDF
  function exportPDF() {
    const doc = new jsPDF();
    const columns = Object.keys(data[0] || {});
    const rows = data.map(row => Object.values(row));
    (doc as any).autoTable({ head: [columns], body: rows });
    doc.save(`${filename}.pdf`);
  }

  return (
    <div className="flex gap-2 my-3">
      <button onClick={exportCSV} className="px-3 py-1 bg-green-600 text-white rounded">CSV</button>
      <button onClick={exportExcel} className="px-3 py-1 bg-blue-600 text-white rounded">Excel</button>
      <button onClick={exportPDF} className="px-3 py-1 bg-red-600 text-white rounded">PDF</button>
    </div>
  );
}
