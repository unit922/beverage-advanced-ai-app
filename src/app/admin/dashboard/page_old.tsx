import AIInsightsPanel from "@/components/AIInsightsPanel";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top-level stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-sm font-medium text-gray-500">Total Orders</h2>
          <p className="text-2xl font-bold mt-2">142</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-sm font-medium text-gray-500">Active Clients</h2>
          <p className="text-2xl font-bold mt-2">56</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-sm font-medium text-gray-500">Low Stock</h2>
          <p className="text-2xl font-bold mt-2">7</p>
        </div>
      </div>

      {/* Placeholder for charts (later we’ll plug in recharts) */}
      <div className="p-6 bg-white shadow rounded-lg">
        <h2 className="text-lg font-bold mb-4">📊 Sales Overview</h2>
        <p className="text-gray-500">
          Chart placeholder — integrate Recharts or D3 here.
        </p>
      </div>

      {/* AI Insights panel */}
      <AIInsightsPanel />
    </div>
  );
}
